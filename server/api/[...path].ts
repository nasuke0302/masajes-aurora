import {defineEventHandler,getRouterParam,getQuery,getHeader,readBody,readRawBody,createError,deleteCookie,getCookie} from 'h3'
import StripeClient from 'stripe'
import {z} from 'zod'
import {environment,sameOrigin,limit,hash,token,nowSeconds,safeError,privateHeaders} from '../core/security'
import {configuration,available,createBooking,findByToken,publicBooking,quantitiesSchema} from '../core/bookings'
import {stripeClient,checkout,reconcile,reconcileBooking,handleStripeEvent} from '../core/payments'
import {dispatch} from '../core/notifications'
import {requireAdmin,consumeLink,saveSettings,updateBooking} from '../core/admin'
export default defineEventHandler(async event=>{
 privateHeaders(event)
 const env=environment(event),path=getRouterParam(event,'path')||'',method=event.method
 if((Number(getHeader(event,'content-length'))||0)>32768)throw createError({statusCode:413,statusMessage:'Solicitud demasiado grande'})
 if(method!=='GET'&&path!=='stripe/webhook')sameOrigin(event,env)
 try{
  if(path==='stripe/webhook'&&method==='POST'){
   const body=await readRawBody(event)||''
   if(body.length>32768)throw createError({statusCode:413})
   let stripeEvent:StripeClient.Event
   try{stripeEvent=await stripeClient(env).webhooks.constructEventAsync(body,getHeader(event,'stripe-signature')||'',env.STRIPE_WEBHOOK_SECRET,undefined,StripeClient.createSubtleCryptoProvider())}catch{throw createError({statusCode:400,statusMessage:'Firma inválida'})}
   await handleStripeEvent(env,stripeEvent);event.waitUntil(dispatch(env));return {received:true}
  }
  if(path==='catalog'&&method==='GET'){
   const c=await configuration(env)
   return {...c,accepting:c.accepting&&!!env.ADMIN_EMAIL&&!!env.EMAIL_FROM,onlinePayment:!!env.STRIPE_SECRET_KEY&&!!env.STRIPE_PAYMENT_CONFIGURATION}
  }
  if(path==='availability'&&method==='GET'){
   const q=getQuery(event),parsed=quantitiesSchema.safeParse({massage40:Number(q.massage40),massage60:Number(q.massage60)})
   if(!parsed.success||typeof q.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(q.date))throw createError({statusCode:400,statusMessage:'Fecha o cantidades inválidas'})
   await limit(env,'availability:'+(getHeader(event,'cf-connecting-ip')||'local'),120,60)
   await reconcile(env);return await available(env,q.date,parsed.data)
  }
  if(path==='bookings'&&method==='POST'){
   await limit(env,'booking:'+(getHeader(event,'cf-connecting-ip')||'local'),12)
   await reconcile(env)
   const b=await createBooking(env,await readBody(event))
   const session=b.status==='held'?await checkout(env,b):null
   event.waitUntil(dispatch(env))
   return {url:b.manage_url,checkoutUrl:session?.url||null,reference:b.reference}
  }
  if(path.startsWith('bookings/')&&method==='GET'){
   const value=path.slice('bookings/'.length)
   let b=await findByToken(env,value)
   if(b.status==='held'){await reconcileBooking(env,b);b=await findByToken(env,value)}
   return publicBooking(b)
  }
  if(path.startsWith('checkout/')&&method==='POST'){
   const b=await findByToken(env,path.slice('checkout/'.length))
   await reconcileBooking(env,b)
   const current=await findByToken(env,path.slice('checkout/'.length))
   const session=await checkout(env,current)
   return {url:session.url}
  }
  if(path==='admin/login'&&method==='POST'){
   await limit(env,'admin-login:'+(getHeader(event,'cf-connecting-ip')||'local'),5,900)
   await limit(env,'admin-mail',5,900)
   const body=await readBody(event)
   if(env.ADMIN_EMAIL&&String(body.email||'').toLowerCase()===env.ADMIN_EMAIL.toLowerCase()){
    const value=token(),id=crypto.randomUUID(),url=new URL('/admin/acceso#'+value,env.SITE_URL).href
    await env.DB.batch([env.DB.prepare('INSERT INTO admin_links VALUES(?,?,NULL)').bind(await hash(value),nowSeconds()+900),env.DB.prepare('INSERT INTO outbox(id,recipient,subject,body,created_at) VALUES(?,?,?,?,?)').bind(id,env.ADMIN_EMAIL,'Acceso a Masajes Aurora','Accede al panel con este enlace de un solo uso (15 minutos): '+url,nowSeconds())])
    event.waitUntil(dispatch(env))
   }
   return {message:'Si el email está autorizado, recibirás un enlace de acceso.'}
  }
  if(path==='admin/consume'&&method==='POST'){await consumeLink(event,env,String((await readBody(event)).token||''));return {ok:true}}
  if(path.startsWith('admin/')){
   await requireAdmin(event,env)
   if(path==='admin/logout'&&method==='POST'){
    await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await hash(getCookie(event,'aurora_admin')||'')).run();deleteCookie(event,'aurora_admin',{path:'/'});return {ok:true}
   }
   if(path==='admin/settings'&&method==='GET')return configuration(env)
   if(path==='admin/settings'&&method==='PUT')return saveSettings(env,await readBody(event))
   if(path==='admin/bookings'&&method==='GET'){
    await reconcile(env)
    const q=getQuery(event);const from=String(q.from||'2000-01-01'),to=String(q.to||'2100-01-01')
    return (await env.DB.prepare('SELECT id,reference,service_date,start_at,end_at,quantity,amount_cents,lines_json,name,email,phone,address,notes,method,status,payment_status FROM bookings WHERE service_date BETWEEN ? AND ? ORDER BY start_at LIMIT 300').bind(from,to).all()).results
   }
   if(path==='admin/bookings'&&method==='POST'){
    const body=await readBody(event);const b=await createBooking(env,{...body,method:'cash'});event.waitUntil(dispatch(env));return {reference:b.reference}
   }
   if(path.startsWith('admin/bookings/')&&method==='PATCH'){
    const body=z.object({action:z.enum(['cancel','complete','cash-paid'])}).safeParse(await readBody(event));if(!body.success)throw createError({statusCode:400})
    await updateBooking(env,path.slice('admin/bookings/'.length),body.data.action);event.waitUntil(dispatch(env));return {ok:true}
   }
   if(path==='admin/blocks'&&method==='GET')return (await env.DB.prepare('SELECT * FROM blocks ORDER BY start_at').all()).results
   if(path==='admin/blocks'&&method==='POST'){
    const b=z.object({startAt:z.number().int(),endAt:z.number().int(),reason:z.string().trim().max(200)}).safeParse(await readBody(event));if(!b.success||b.data.endAt<=b.data.startAt)throw createError({statusCode:400,statusMessage:'Periodo inválido'})
    await env.DB.prepare('INSERT INTO blocks VALUES(?,?,?,?)').bind(crypto.randomUUID(),b.data.startAt,b.data.endAt,b.data.reason).run();return {ok:true}
   }
   if(path.startsWith('admin/blocks/')&&method==='DELETE'){await env.DB.prepare('DELETE FROM blocks WHERE id=?').bind(path.slice('admin/blocks/'.length)).run();return {ok:true}}
   if(path==='admin/notifications'&&method==='GET')return (await env.DB.prepare('SELECT id,subject,sent_at,attempts,last_error FROM outbox ORDER BY created_at DESC LIMIT 50').all()).results
   if(path==='admin/notifications/retry'&&method==='POST'){await dispatch(env);return {ok:true}}
  }
  throw createError({statusCode:404,statusMessage:'Ruta no encontrada'})
 }catch(error){safeError(error)}
})

