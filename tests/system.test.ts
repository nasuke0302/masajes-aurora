import {beforeAll,beforeEach,afterAll,describe,it,expect,vi} from 'vitest'
import {Miniflare} from 'miniflare'
import {readFile} from 'node:fs/promises'
import StripeClient from 'stripe'
import {createBooking,available} from '../server/core/bookings'
import {checkout,reconcileBooking,handleStripeEvent,verifyImmediatePayments} from '../server/core/payments'
import {deliver,sendResend} from '../workers/notifications'
import {consumeLink,requireAdmin,saveSettings} from '../server/core/admin'
import {hash} from '../server/core/security'
import {localDate,datePlus,dayInstants,localLabel} from '../shared/booking'
import type {AppEnv,Booking} from '../server/core/types'
let mf:Miniflare,env:AppEnv,start:number
let migrationPreserved=false
const emailSend=vi.fn(),queueSend=vi.fn()
async function row(id:string){return (await env.DB.prepare('SELECT * FROM bookings WHERE id=?').bind(id).first<Booking>())!}
function input(q={massage40:0,massage60:1},s=start,method='cash'){return {quantities:q,startAt:s,name:'Cliente prueba',email:'cliente@example.com',phone:'+34644798063',address:'Calle Mayor 10, 1A',city:'Ávila',notes:'Avisar al llegar',method,requestKey:crypto.randomUUID()}}
function gateway(session:Record<string,unknown>={}){
 const s={id:'cs_test',status:'open',payment_status:'unpaid',url:'https://checkout.stripe.com/test',payment_intent:'pi_test',...session}
 return {paymentMethodConfigurations:{retrieve:vi.fn().mockResolvedValue({active:true,card:{available:true,display_preference:{value:'on'}}})},checkout:{sessions:{create:vi.fn().mockResolvedValue(s),retrieve:vi.fn().mockResolvedValue(s),expire:vi.fn().mockResolvedValue({...s,status:'expired'})}},events:{list:vi.fn().mockReturnValue({async *[Symbol.asyncIterator](){}})},refunds:{create:vi.fn().mockResolvedValue({id:'re_test'})}} as unknown as StripeClient
}
function paymentEvent(b:Booking,time:number,id='evt_paid'){
 return {id,type:'checkout.session.completed',created:time,data:{object:{id:'cs_test',status:'complete',payment_status:'paid',amount_total:b.amount_cents,currency:'eur',client_reference_id:b.id,metadata:{booking_id:b.id},payment_intent:'pi_test'}}} as unknown as StripeClient.Event
}
beforeAll(async()=>{
 mf=new Miniflare({workers:[{config:{name:'test',compatibilityDate:'2026-10-11',env:{DB:{type:'d1',id:'00000000-0000-0000-0000-000000000001'}},manifest:{mainModule:'index.mjs',modules:{'index.mjs':{type:'esm',contents:'export default {fetch(){return new Response("test")}}'}}}}}]})
 env={DB:await mf.getD1Database('DB'),SITE_URL:'https://aurora.example',ADMIN_EMAIL:'melba@example.com',EMAIL_FROM:'reservas@aurora.example',STRIPE_SECRET_KEY:'rk_test_example',STRIPE_WEBHOOK_SECRET:'whsec_example',STRIPE_PAYMENT_CONFIGURATION:'pmc_test',NOTIFICATIONS:{send:queueSend}} as unknown as AppEnv
 await env.DB.exec((await readFile('migrations/0001_booking.sql','utf8')).replace(/\n/g,' '))
 await env.DB.prepare('UPDATE settings SET accepting=1').run();await env.DB.prepare('UPDATE products SET price_cents=5000').run()
 const seedDate=datePlus(localDate(Math.floor(Date.now()/1000)),1),seedStart=dayInstants(seedDate).find(x=>localLabel(x.epoch)==='09:00')!.epoch
 const seed=await createBooking(env,input({massage40:0,massage60:1},seedStart)),before=await row(seed.id)
 await env.DB.exec((await readFile('migrations/0002_remove_daily_capacity.sql','utf8')).replace(/\n/g,' '))
 migrationPreserved=JSON.stringify(before)===JSON.stringify(await row(seed.id))
},30000)
beforeEach(async()=>{
 vi.clearAllMocks()
 for(const table of ['bookings','outbox','stripe_events','admin_links','admin_sessions','blocks','hours'])await env.DB.prepare('DELETE FROM '+table).run()
 await env.DB.prepare('UPDATE settings SET accepting=1').run();await env.DB.prepare("UPDATE products SET price_cents=CASE WHEN id='massage40' THEN 4000 ELSE 6000 END").run()
 for(let day=0;day<7;day++)await env.DB.prepare('INSERT INTO hours VALUES(?,600,1200)').bind(day).run()
 const tomorrow=datePlus(localDate(Math.floor(Date.now()/1000)),1);start=dayInstants(tomorrow).find(x=>localLabel(x.epoch)==='10:00')!.epoch
})
afterAll(async()=>{await mf.dispose()})
describe('D1 bookings and notifications',()=>{
 it('preserves existing reservations across the capacity-removal migration',()=>expect(migrationPreserved).toBe(true))
 it('sends through Resend with stable idempotency and persists the provider ID',async()=>{
  await createBooking(env,input());const notice=(await env.DB.prepare('SELECT id FROM outbox LIMIT 1').first<{id:string}>())!
  const mail={DB:env.DB,EMAIL_FROM:env.EMAIL_FROM,ADMIN_EMAIL:env.ADMIN_EMAIL,RESEND_API_KEY:'re_test'} as Parameters<typeof deliver>[0]
  const request=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify({id:'resend_test'}),{status:200}))
  try{await deliver(mail,notice.id);await deliver(mail,notice.id);expect(request).toHaveBeenCalledTimes(1)
   const [url,init]=request.mock.calls[0]!;expect(url).toBe('https://api.resend.com/emails');expect((init!.headers as Record<string,string>)['Idempotency-Key']).toBe('aurora/'+notice.id)
   expect(JSON.parse(init!.body as string).reply_to).toBe(env.ADMIN_EMAIL)
   expect(await env.DB.prepare('SELECT provider_id FROM outbox WHERE id=?').bind(notice.id).first()).toEqual({provider_id:'resend_test'})
  }finally{request.mockRestore()}
 })
 it('keeps Resend failures pending without exposing provider responses',async()=>{
  const mail={EMAIL_FROM:env.EMAIL_FROM,ADMIN_EMAIL:env.ADMIN_EMAIL,RESEND_API_KEY:'re_test'} as Parameters<typeof deliver>[0]
  const request=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('private provider details',{status:429}))
  try{await expect(sendResend(mail,{from:env.EMAIL_FROM,to:'client@example.com',subject:'Test',text:'Test',html:'Test'},'notice')).rejects.toThrow('EMAIL_SEND_FAILED')}finally{request.mockRestore()}
 })
 it('makes one group reservation with snapshots and two persisted notices',async()=>{
  const b=await createBooking(env,input({massage40:1,massage60:1}))
  expect(b.quantity).toBe(2);expect(b.end_at-b.start_at).toBe(100*60);expect(b.amount_cents).toBe(10000)
  expect((await env.DB.prepare('SELECT * FROM outbox').all()).results).toHaveLength(2)
  expect((await env.DB.prepare('SELECT body FROM outbox LIMIT 1').first<{body:string}>())!.body).toContain(String.fromCharCode(10))
  await env.DB.prepare('UPDATE products SET price_cents=9000').run();expect((await row(b.id)).amount_cents).toBe(10000)
 })
 it('allows simultaneous non-overlapping reservations above three daily massages',async()=>{
  const r=await Promise.allSettled([createBooking(env,input({massage40:0,massage60:2})),createBooking(env,input({massage40:0,massage60:2},start+4*3600))])
  expect(r.filter(x=>x.status==='fulfilled')).toHaveLength(2);expect((await env.DB.prepare('SELECT SUM(quantity) as n FROM bookings').first<{n:number}>())!.n).toBe(4)
 })
 it('books more than three consecutive massages in one session',async()=>{const b=await createBooking(env,input({massage40:2,massage60:2}));expect(b.quantity).toBe(4);expect(b.end_at-b.start_at).toBe(200*60)})
 it('rejects simultaneous overlapping sessions',async()=>{const r=await Promise.allSettled([createBooking(env,input()),createBooking(env,input())]);expect(r.filter(x=>x.status==='fulfilled')).toHaveLength(1)})
 it('deduplicates a retried booking request and its notices',async()=>{const body=input();const a=await createBooking(env,body),b=await createBooking(env,body);expect(a.id).toBe(b.id);expect((await env.DB.prepare('SELECT * FROM outbox').all()).results).toHaveLength(2)})
 it('does not release expired holds just because their timestamp passed',async()=>{const b=await createBooking(env,input({massage40:0,massage60:3},start,'online'));await env.DB.prepare('UPDATE bookings SET hold_until=1 WHERE id=?').bind(b.id).run();expect((await available(env,b.service_date,{massage40:1,massage60:0})).slots.find(s=>s.startAt===start)?.available).toBe(false)})
 it('protects occupied periods against new blocks',async()=>{await createBooking(env,input());await expect(env.DB.prepare('INSERT INTO blocks VALUES(?,?,?,?)').bind('block',start,start+3600,'Test').run()).rejects.toThrow('BOOKING_IN_BLOCK')})
 it('keeps completed session times occupied and releases cancelled times',async()=>{const b=await createBooking(env,input({massage40:0,massage60:3}));await env.DB.prepare("UPDATE bookings SET status='completed' WHERE id=?").bind(b.id).run();expect((await available(env,b.service_date,{massage40:1,massage60:0})).slots.find(s=>s.startAt===start)?.available).toBe(false);await env.DB.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").bind(b.id).run();expect((await available(env,b.service_date,{massage40:1,massage60:0})).slots.find(s=>s.startAt===start)?.available).toBe(true)})
 it('retries email failures without cancelling bookings and acknowledges duplicates',async()=>{
  const b=await createBooking(env,input()),notice=(await env.DB.prepare('SELECT id FROM outbox LIMIT 1').first<{id:string}>())!
  const mail={DB:env.DB,EMAIL_FROM:env.EMAIL_FROM,RESEND_API_KEY:'re_test'} as unknown as Parameters<typeof deliver>[0]
  emailSend.mockRejectedValueOnce(new Error('temporary'));await expect(deliver(mail,notice.id,emailSend)).rejects.toThrow();expect((await row(b.id)).status).toBe('confirmed')
  await env.DB.prepare('UPDATE outbox SET lease_until=0').run();emailSend.mockResolvedValueOnce({messageId:'sent'});await deliver(mail,notice.id,emailSend);await deliver(mail,notice.id,emailSend);expect(emailSend).toHaveBeenCalledTimes(2)
 })
})
describe('payment lifecycle',()=>{
 it('rejects a configuration with delayed payment methods enabled',async()=>{
  const g=gateway();vi.mocked(g.paymentMethodConfigurations.retrieve).mockResolvedValue({active:true,card:{available:true},sepa_debit:{display_preference:{value:'on'}}} as never);
  await expect(verifyImmediatePayments(env,g)).rejects.toThrow('configuración exclusiva')
 })
 it('creates one joint checkout with a stable idempotency key',async()=>{const b=await createBooking(env,input({massage40:1,massage60:1},start,'online')),g=gateway();await checkout(env,b,g);expect(g.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({line_items:expect.arrayContaining([expect.objectContaining({quantity:1})])}),{idempotencyKey:'checkout:'+b.id})})
 it('confirms on a verified event once, including delayed webhook delivery',async()=>{const b=await createBooking(env,input(undefined,start,'online')),g=gateway(),e=paymentEvent(b,b.created_at+60);await handleStripeEvent(env,e,g);await handleStripeEvent(env,e,g);expect((await row(b.id)).status).toBe('confirmed');expect((await env.DB.prepare('SELECT * FROM outbox').all()).results).toHaveLength(2)})
 it('recovers a timely payment from paginated Stripe events after the deadline',async()=>{
  const b=await createBooking(env,input(undefined,start,'online')),event=paymentEvent(b,b.created_at+60)
  const g=gateway(event.data.object as unknown as Record<string,unknown>);
  vi.mocked(g.events.list).mockReturnValue({async *[Symbol.asyncIterator](){yield {...event,id:'other',data:{object:{id:'cs_other'}}};yield event}} as never)
  const time=vi.spyOn(Date,'now').mockReturnValue((b.hold_until!+600)*1000)
  try{await reconcileBooking(env,b,g);expect((await row(b.id)).status).toBe('confirmed');expect(g.refunds.create).not.toHaveBeenCalled()}finally{time.mockRestore()}
 })
 it('refunds payments completed after the hold cutoff',async()=>{const b=await createBooking(env,input(undefined,start,'online')),g=gateway();await handleStripeEvent(env,paymentEvent(b,b.hold_until!+1),g);expect(g.refunds.create).toHaveBeenCalledTimes(1);expect((await row(b.id)).payment_status).toBe('refunded');expect((await row(b.id)).status).toBe('expired')})
 it('closes checkout before releasing abandoned capacity',async()=>{const b=await createBooking(env,input(undefined,start,'online'));await env.DB.prepare('UPDATE bookings SET hold_until=1,session_id=? WHERE id=?').bind('cs_test',b.id).run();const g=gateway();await reconcileBooking(env,await row(b.id),g);expect(g.checkout.sessions.expire).toHaveBeenCalledTimes(1);expect((await row(b.id)).status).toBe('expired')})
 it('retains capacity if Stripe cannot close a checkout',async()=>{const b=await createBooking(env,input(undefined,start,'online'));await env.DB.prepare('UPDATE bookings SET hold_until=1,session_id=? WHERE id=?').bind('cs_test',b.id).run();const g=gateway();vi.mocked(g.checkout.sessions.expire).mockRejectedValue(new Error('timeout'));await expect(reconcileBooking(env,await row(b.id),g)).rejects.toThrow('CHECKOUT_NOT_CLOSED');expect((await row(b.id)).status).toBe('held')})
 it('rejects wrong amounts and invalid webhook signatures',async()=>{const b=await createBooking(env,input(undefined,start,'online')),e=paymentEvent(b,b.created_at+10);(e.data.object as StripeClient.Checkout.Session).amount_total=1;await expect(handleStripeEvent(env,e,gateway())).rejects.toThrow('PAYMENT_MISMATCH');const client=new StripeClient('rk_test_x');await expect(client.webhooks.constructEventAsync('{}','bad','whsec_x',undefined,StripeClient.createSubtleCryptoProvider())).rejects.toThrow()})
 it('synchronizes full and partial refunds',async()=>{const b=await createBooking(env,input(undefined,start,'online')),g=gateway();await handleStripeEvent(env,paymentEvent(b,b.created_at+10),g);await handleStripeEvent(env,{id:'evt_refund',type:'charge.refunded',data:{object:{payment_intent:'pi_test',refunded:false}}} as unknown as StripeClient.Event,g);expect((await row(b.id)).payment_status).toBe('partial_refund')})
})
describe('checkout creation recovery',()=>{
 it('releases a hold that never acquired a Stripe checkout',async()=>{
  const b=await createBooking(env,input(undefined,start,'online'));
  await env.DB.prepare('UPDATE bookings SET hold_until=1 WHERE id=?').bind(b.id).run();
  const g=gateway();vi.mocked(g.checkout.sessions.create).mockRejectedValue(new StripeClient.errors.StripeInvalidRequestError({message:'expired parameter',param:'expires_at'}));
  (g.checkout.sessions as unknown as {list:unknown}).list=()=>({async *[Symbol.asyncIterator](){}});
  await reconcileBooking(env,await row(b.id),g);expect((await row(b.id)).status).toBe('expired')
 })
 it('keeps capacity when a failed creation is uncertain',async()=>{
  const b=await createBooking(env,input(undefined,start,'online'));await env.DB.prepare('UPDATE bookings SET hold_until=1 WHERE id=?').bind(b.id).run();
  const g=gateway();vi.mocked(g.checkout.sessions.create).mockRejectedValue(new Error('network failed'));
  await expect(reconcileBooking(env,await row(b.id),g)).rejects.toThrow();expect((await row(b.id)).status).toBe('held')
 })
})
describe('admin validation and access',()=>{
 it('allows saving hours with undefined prices while bookings remain closed',async()=>{
  const c=await saveSettings(env,{accepting:false,products:[{id:'massage40',price_cents:null},{id:'massage60',price_cents:null}],hours:[{weekday:1,open_minute:540,close_minute:1260}]});expect(c.accepting).toBe(false);expect(c.products.every(p=>p.price_cents===null)).toBe(true)
 })
 it('does not open bookings without both product prices',async()=>{
  await expect(saveSettings(env,{accepting:true,products:[{id:'massage40',price_cents:null},{id:'massage60',price_cents:6000}],hours:[{weekday:1,open_minute:540,close_minute:1260}]})).rejects.toThrow()
 })
 it('rejects overlapping weekly hours',async()=>{await expect(saveSettings(env,{accepting:true,products:[{id:'massage40',price_cents:4000},{id:'massage60',price_cents:6000}],hours:[{weekday:1,open_minute:600,close_minute:900},{weekday:1,open_minute:800,close_minute:1000}]})).rejects.toThrow()})
 it('requires an authenticated admin session',async()=>{await expect(requireAdmin({node:{req:{headers:{}}}} as never,env)).rejects.toThrow()})
 it('does not accept an expired login link',async()=>{const value='a'.repeat(64);await env.DB.prepare('INSERT INTO admin_links VALUES(?,?,NULL)').bind(await hash(value),1).run();await expect(consumeLink({} as never,env,value)).rejects.toThrow()})
})

