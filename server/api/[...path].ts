import {defineEventHandler,getRouterParam,getQuery,getHeader,readBody,createError,deleteCookie,getCookie} from 'h3'
import {z} from 'zod'
import {environment,sameOrigin,limit,hash,token,nowSeconds,safeError,privateHeaders} from '../core/security'
import {configuration,available,createBooking,findByToken,publicBooking,quantitiesSchema} from '../core/bookings'
import {dispatch} from '../core/notifications'
import {createWebBooking} from '../core/turnstile'
import {searchAddresses,validatedAddress} from '../core/addresses'
import {requireAdmin,consumeLink,saveSettings,updateBooking,rescheduleBooking} from '../core/admin'
export default defineEventHandler(async event=>{
 privateHeaders(event)
 const env=environment(event),path=getRouterParam(event,'path')||'',method=event.method
 if((Number(getHeader(event,'content-length'))||0)>32768)throw createError({statusCode:413,statusMessage:'Solicitud demasiado grande'})
 if(method!=='GET')sameOrigin(event,env)
 try{
  if(path==='auth-mode'&&method==='GET')return {access:!!env.ACCESS_AUD}
  if(path==='catalog'&&method==='GET'){
   const c=await configuration(env)
   return {...c,accepting:c.accepting&&!!env.ADMIN_EMAIL&&!!env.EMAIL_FROM}
  }
  if(path==='addresses/search'&&method==='GET'){
   await limit(env,'addresses:'+(getHeader(event,'cf-connecting-ip')||'local'),40,60)
   const q=getQuery(event).q;if(typeof q!=='string')throw createError({statusCode:400})
   return searchAddresses(q)
  }
  if(path==='availability'&&method==='GET'){
   const q=getQuery(event),parsed=quantitiesSchema.safeParse({massage40:Number(q.massage40),massage60:Number(q.massage60)})
   if(!parsed.success||typeof q.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(q.date))throw createError({statusCode:400,statusMessage:'Fecha o cantidades inválidas'})
   await limit(env,'availability:'+(getHeader(event,'cf-connecting-ip')||'local'),120,60)
   return await available(env,q.date,parsed.data)
  }
  if(path==='bookings'&&method==='POST'){
   await limit(env,'booking:'+(getHeader(event,'cf-connecting-ip')||'local'),12)
   const b=await createWebBooking(env,await readBody(event),getHeader(event,'cf-connecting-ip'))
   event.waitUntil(dispatch(env))
   return {url:b.manage_url,reference:b.reference}
  }
  if(path.startsWith('bookings/')&&method==='GET'){
   const value=path.slice('bookings/'.length)
   const b=await findByToken(env,value)
   return publicBooking(b)
  }
  if(env.ACCESS_AUD&&['admin/login','admin/consume'].includes(path))throw createError({statusCode:410,statusMessage:'Utiliza Cloudflare Access'})
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
    if(env.ACCESS_AUD)return {ok:true,url:'/cdn-cgi/access/logout'}
    await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await hash(getCookie(event,'aurora_admin')||'')).run();deleteCookie(event,'aurora_admin',{path:'/'});return {ok:true}
   }
   if(path==='admin/settings'&&method==='GET')return configuration(env)
   if(path==='admin/settings'&&method==='PUT')return saveSettings(env,await readBody(event))
   if(path==='admin/bookings'&&method==='GET'){
    const q=getQuery(event);const from=String(q.from||'2000-01-01'),to=String(q.to||'2100-01-01'),state=String(q.status||'')
    if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to)||from>to||(state&&!['confirmed','completed','cancelled'].includes(state)))throw createError({statusCode:400,statusMessage:'Revisa las fechas y el estado del historial'})
    const agenda=q.agenda==='true'
    if(agenda&&(!Number.isFinite(Date.parse(from))||!Number.isFinite(Date.parse(to))||Date.parse(to)-Date.parse(from)>41*86400000))throw createError({statusCode:400,statusMessage:'El calendario admite hasta seis semanas por consulta'})
    // A complete month grid can exceed the history's 300-record page. Within
    // six weeks, the minimum visit duration and buffer bound active visits below 1000.
    return (await env.DB.prepare('SELECT id,reference,service_date,start_at,end_at,quantity,amount_cents,lines_json,name,email,phone,address,notes,method,status,payment_status FROM bookings WHERE service_date BETWEEN ? AND ? AND (? = \'\' OR status = ?)'+(agenda?" AND status IN('confirmed','completed')":'')+' ORDER BY start_at LIMIT '+(agenda?'1000':'300')).bind(from,to,state,state).all()).results
   }
   if(path==='admin/bookings'&&method==='POST'){
    const body=await readBody(event);const b=await createBooking(env,{...body,address:await validatedAddress(body),method:'cash'});event.waitUntil(dispatch(env));return {reference:b.reference}
   }
   if(path.startsWith('admin/bookings/')&&method==='PATCH'){
    const body=z.discriminatedUnion('action',[z.object({action:z.enum(['cancel','complete','cash-paid'])}),z.object({action:z.literal('reschedule'),startAt:z.number().int().positive().max(253402300799),expectedStartAt:z.number().int().positive()})]).safeParse(await readBody(event));if(!body.success)throw createError({statusCode:400})
    const id=path.slice('admin/bookings/'.length)
    if(body.data.action==='reschedule')await rescheduleBooking(env,id,body.data.startAt,body.data.expectedStartAt)
    else await updateBooking(env,id,body.data.action)
    event.waitUntil(dispatch(env));return {ok:true}
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

