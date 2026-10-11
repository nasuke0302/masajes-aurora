import StripeClient from 'stripe'
import { createError } from 'h3'
import type { AppEnv, Booking } from './types'
import { nowSeconds } from './security'
import { noticeStatements } from './notifications'
export const stripeClient=(env:AppEnv)=>new StripeClient(env.STRIPE_SECRET_KEY,{httpClient:StripeClient.createFetchHttpClient(),maxNetworkRetries:2})
export async function verifyImmediatePayments(env:AppEnv,client=stripeClient(env)){
 const config=await client.paymentMethodConfigurations.retrieve(env.STRIPE_PAYMENT_CONFIGURATION)
 const allowed=new Set(['card','apple_pay','google_pay'])
 const invalid=Object.entries(config).some(([name,value])=>value&&typeof value==='object'&&'display_preference' in value&&((value as {display_preference:{value:string}}).display_preference.value==='on')&&!allowed.has(name))
 if(!config.active||!config.card?.available||invalid)throw createError({statusCode:503,statusMessage:'El pago online requiere una configuración exclusiva de tarjetas y sus monederos'})
}
export async function checkout(env:AppEnv,b:Booking,client=stripeClient(env),verify=true) {
 if(b.method!=='online'||b.status!=='held') throw createError({statusCode:409,statusMessage:'Esta reserva no admite un nuevo pago'})
 if(b.session_id)return client.checkout.sessions.retrieve(b.session_id)
 // A stable idempotency key recovers a session created before a process interruption.
 if(verify)await verifyImmediatePayments(env,client)
 const lines=JSON.parse(b.lines_json) as {name:string;quantity:number;price_cents:number}[]
 const session=await client.checkout.sessions.create({mode:'payment',customer_email:b.email,client_reference_id:b.id,
  metadata:{booking_id:b.id},payment_intent_data:{metadata:{booking_id:b.id}},
  line_items:lines.map(l=>({quantity:l.quantity,price_data:{currency:'eur',unit_amount:l.price_cents,product_data:{name:l.name}}})),
  payment_method_configuration:env.STRIPE_PAYMENT_CONFIGURATION,
  excluded_payment_method_types:['acss_debit','au_becs_debit','bacs_debit','boleto','customer_balance','konbini','multibanco','oxxo','sepa_debit','us_bank_account','pay_by_bank','payto'],
  // Automatic expiration cannot be less than 30 minutes. The reconciler explicitly closes at the lead-time cutoff.
  success_url:b.manage_url,cancel_url:b.manage_url,expires_at:b.checkout_expires_at!+60,
  integration_identifier:'masajes_aurora_booking_abcdefgh'
 },{idempotencyKey:'checkout:'+b.id})
 await env.DB.prepare('UPDATE bookings SET session_id=?,checkout_url=? WHERE id=? AND session_id IS NULL').bind(session.id,session.url,b.id).run()
 return session
}
export async function settle(env:AppEnv,b:Booking,session:StripeClient.Checkout.Session,paidAt:number,client=stripeClient(env)) {
 if((b.session_id&&session.id!==b.session_id)||session.payment_status!=='paid'||session.client_reference_id!==b.id||session.amount_total!==b.amount_cents||session.currency!=='eur'||session.metadata?.booking_id!==b.id) throw new Error('PAYMENT_MISMATCH')
 const intent=typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id
 if(!intent)throw new Error('PAYMENT_INTENT_MISSING')
 if(b.payment_status==='refunded')return
 const timely=paidAt<=b.hold_until! && paidAt<=b.start_at-10800
 if(timely && (b.status==='held'||b.status==='confirmed'||b.status==='completed')) {
  const updated={...b,status:b.status==='completed'?'completed':'confirmed',payment_status:'paid',payment_intent:intent,paid_at:paidAt} as Booking
  await env.DB.batch([env.DB.prepare("UPDATE bookings SET status=CASE WHEN status='completed' THEN 'completed' ELSE 'confirmed' END,payment_status='paid',session_id=COALESCE(session_id,?),payment_intent=?,paid_at=? WHERE id=? AND status IN('held','confirmed','completed')").bind(session.id,intent,paidAt,b.id),...noticeStatements(env,updated)])
 }else{
  await client.refunds.create({payment_intent:intent},{idempotencyKey:'late-refund:'+b.id})
  const updated={...b,status:b.status==='cancelled'?'cancelled':'expired',payment_status:'refunded',payment_intent:intent} as Booking
  await env.DB.batch([env.DB.prepare("UPDATE bookings SET status=CASE WHEN status='cancelled' THEN 'cancelled' ELSE 'expired' END,payment_status='refunded',payment_intent=?,paid_at=? WHERE id=?").bind(intent,paidAt,b.id),...noticeStatements(env,updated,'refunded')])
 }
}
export async function reconcileBooking(env:AppEnv,b:Booking,client=stripeClient(env)) {
 if(b.method!=='online'||b.status!=='held')return
 // Never release a hold while a recovered checkout could still collect a payment.
 let session:StripeClient.Checkout.Session
 try{session=await checkout(env,b,client,false)}catch(error){
  // A validation failure before Stripe creates a session has no charge to close.
  // Check historical sessions too, so a creation response lost before persistence is recovered.
  if(b.session_id || nowSeconds()<b.hold_until! || !(error instanceof StripeClient.errors.StripeInvalidRequestError))throw error
  let recovered:StripeClient.Checkout.Session|undefined
  for await(const candidate of client.checkout.sessions.list({created:{gte:b.created_at-60,lte:b.checkout_expires_at!+60},limit:100})){
   if(candidate.client_reference_id===b.id&&candidate.metadata?.booking_id===b.id){recovered=candidate;break}
  }
  if(!recovered){await env.DB.prepare("UPDATE bookings SET status='expired' WHERE id=? AND status='held' AND session_id IS NULL").bind(b.id).run();return}
  await env.DB.prepare('UPDATE bookings SET session_id=?,checkout_url=? WHERE id=? AND session_id IS NULL').bind(recovered.id,recovered.url,b.id).run()
  session=recovered
 }
 if(session.payment_status==='paid') {
  let event:StripeClient.Event|undefined
  for await(const candidate of client.events.list({type:'checkout.session.completed',created:{gte:b.created_at},limit:100})){if((candidate.data.object as StripeClient.Checkout.Session).id===session.id){event=candidate;break}}
  if(!event)throw new Error('PAYMENT_EVENT_NOT_READY')
  await settle(env,b,session,event.created,client);return
 }
 if(nowSeconds()<b.hold_until! && session.status!=='expired')return
 if(session.status==='open'){
  try{session=await client.checkout.sessions.expire(session.id)}catch{session=await client.checkout.sessions.retrieve(session.id)}
 }
 if(session.payment_status==='paid'){ await reconcileBooking(env,{...b,session_id:session.id},client);return }
 if(session.status!=='expired')throw new Error('CHECKOUT_NOT_CLOSED')
 await env.DB.prepare("UPDATE bookings SET status='expired' WHERE id=? AND status='held'").bind(b.id).run()
}
export async function reconcile(env:AppEnv) {
 if(!env.STRIPE_SECRET_KEY)return
 const rows=await env.DB.prepare("SELECT * FROM bookings WHERE status='held' AND hold_until<=? ORDER BY created_at LIMIT 20").bind(nowSeconds()).all<Booking>()
 for(const b of rows.results){try{await reconcileBooking(env,b)}catch{console.error(JSON.stringify({event:'reconciliation_failed',bookingId:b.id}))}}
}
export async function handleStripeEvent(env:AppEnv,event:StripeClient.Event,client=stripeClient(env)) {
 if(await env.DB.prepare('SELECT id FROM stripe_events WHERE id=?').bind(event.id).first())return
 if(event.type==='checkout.session.completed'||event.type==='checkout.session.async_payment_succeeded') {
  const session=event.data.object as StripeClient.Checkout.Session
  const b=await env.DB.prepare('SELECT * FROM bookings WHERE id=?').bind(session.metadata?.booking_id||'').first<Booking>()
  if(b){if(session.payment_status==='paid')await settle(env,b,session,event.created,client)}
 }else if(event.type==='checkout.session.expired') {
  const session=event.data.object as StripeClient.Checkout.Session
  const b=await env.DB.prepare('SELECT * FROM bookings WHERE session_id=?').bind(session.id).first<Booking>()
  if(b)await reconcileBooking(env,b,client)
 }else if(event.type==='charge.refunded') {
  const charge=event.data.object as StripeClient.Charge
  const intent=typeof charge.payment_intent==='string'?charge.payment_intent:charge.payment_intent?.id
  if(intent)await env.DB.prepare('UPDATE bookings SET payment_status=? WHERE payment_intent=?').bind(charge.refunded?'refunded':'partial_refund',intent).run()
 }
 await env.DB.prepare('INSERT OR IGNORE INTO stripe_events VALUES(?,?)').bind(event.id,nowSeconds()).run()
}

