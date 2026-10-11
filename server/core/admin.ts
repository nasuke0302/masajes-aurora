import { createError,getCookie,setCookie,type H3Event } from 'h3'
import {z} from 'zod'
import type {AppEnv,Booking} from './types'
import {hash,token,nowSeconds,safeError} from './security'
import {configuration} from './bookings'
import {noticeStatements} from './notifications'
export async function requireAdmin(event:H3Event,env:AppEnv){
 const value=getCookie(event,'aurora_admin')||''
 if(!/^[a-f0-9]{64}$/.test(value)||!await env.DB.prepare('SELECT 1 FROM admin_sessions WHERE token_hash=? AND expires_at>?').bind(await hash(value),nowSeconds()).first())throw createError({statusCode:401,statusMessage:'Accede con el enlace enviado a tu email'})
}
export async function consumeLink(event:H3Event,env:AppEnv,value:string){
 if(!/^[a-f0-9]{64}$/.test(value))throw createError({statusCode:401,statusMessage:'Enlace inválido'})
 const r=await env.DB.prepare('UPDATE admin_links SET consumed_at=? WHERE token_hash=? AND consumed_at IS NULL AND expires_at>? RETURNING token_hash').bind(nowSeconds(),await hash(value),nowSeconds()).first()
 if(!r)throw createError({statusCode:401,statusMessage:'El enlace ha caducado o ya se ha utilizado'})
 const session=token()
 await env.DB.prepare('INSERT INTO admin_sessions VALUES(?,?)').bind(await hash(session),nowSeconds()+8*3600).run()
 setCookie(event,'aurora_admin',session,{httpOnly:true,secure:new URL(env.SITE_URL).protocol==='https:',sameSite:'strict',path:'/',maxAge:8*3600})
}
export const settingsSchema=z.object({accepting:z.boolean(),products:z.array(z.object({id:z.enum(['massage40','massage60']),price_cents:z.number().int().positive().max(100000).nullable()})).length(2),hours:z.array(z.object({weekday:z.number().int().min(0).max(6),open_minute:z.number().int().min(0).max(1430).multipleOf(10),close_minute:z.number().int().min(10).max(1440).multipleOf(10)})).max(28)})
export async function saveSettings(env:AppEnv,input:unknown){
 const p=settingsSchema.safeParse(input)
 if(!p.success)throw createError({statusCode:400,statusMessage:'Revisa las tarifas y jornadas'})
 const s=p.data
 if(new Set(s.products.map(p=>p.id)).size!==2||s.hours.some(h=>h.close_minute<=h.open_minute)||s.hours.some((h,i)=>s.hours.some((b,j)=>j!==i&&h.weekday===b.weekday&&h.open_minute<b.close_minute&&h.close_minute>b.open_minute)))throw createError({statusCode:400,statusMessage:'Las jornadas no pueden solaparse'})
 if(s.accepting&&(!env.ADMIN_EMAIL||!env.EMAIL_FROM||!s.hours.length||s.products.some(p=>p.price_cents===null)))throw createError({statusCode:400,statusMessage:'Configura tarifas, email, remitente y jornadas antes de abrir reservas'})
 await env.DB.batch([env.DB.prepare('UPDATE settings SET accepting=? WHERE id=1').bind(s.accepting?1:0),...s.products.map(p=>env.DB.prepare('UPDATE products SET price_cents=? WHERE id=?').bind(p.price_cents,p.id)),env.DB.prepare('DELETE FROM hours'),...s.hours.map(h=>env.DB.prepare('INSERT INTO hours VALUES(?,?,?)').bind(h.weekday,h.open_minute,h.close_minute))])
 return configuration(env)
}
export async function updateBooking(env:AppEnv,id:string,action:'cancel'|'complete'|'cash-paid'){
 const b=await env.DB.prepare('SELECT * FROM bookings WHERE id=?').bind(id).first<Booking>()
 if(!b)throw createError({statusCode:404,statusMessage:'Reserva no encontrada'})
 if(action==='cancel'){
  if(b.status!=='confirmed')throw createError({statusCode:409,statusMessage:'Solo se pueden cancelar reservas confirmadas'})
  await env.DB.batch([env.DB.prepare("UPDATE bookings SET status='cancelled' WHERE id=? AND status='confirmed'").bind(id),...noticeStatements(env,{...b,status:'cancelled'},'cancelled')])
 }else if(action==='complete'){
  if(b.status!=='confirmed'||b.end_at>nowSeconds())throw createError({statusCode:409,statusMessage:'La sesión todavía no ha finalizado'})
  await env.DB.prepare("UPDATE bookings SET status='completed' WHERE id=? AND status='confirmed'").bind(id).run()
 }else{
  if(b.method!=='cash'||!['confirmed','completed'].includes(b.status))throw createError({statusCode:409,statusMessage:'Esta reserva no admite cobro en efectivo'})
  await env.DB.prepare("UPDATE bookings SET payment_status='paid' WHERE id=? AND method='cash'").bind(id).run()
 }
}

