import { createError } from 'h3'
import { z } from 'zod'
import { bookingContactSchema } from '../../shared/booking-contact'
import { availability, localDate, totals, MAX_SESSION_MASSAGES, type Product, type Hours, type Quantities } from '../../shared/booking'
import type { AppEnv, Booking } from './types'
import { hash, token, nowSeconds, safeError } from './security'
import { noticeStatements } from './notifications'
import {parseBookingLegal} from '../../shared/booking-legal'
export const quantitiesSchema=z.object({massage40:z.number().int().min(0).max(MAX_SESSION_MASSAGES),massage60:z.number().int().min(0).max(MAX_SESSION_MASSAGES)}).refine(q=>q.massage40+q.massage60>=1 && q.massage40+q.massage60<=MAX_SESSION_MASSAGES,'Elige al menos un masaje dentro de una jornada')
export const bookingSchema=z.object({ quantities:quantitiesSchema,startAt:z.number().int().positive().max(253402300799),...bookingContactSchema.shape,city:z.literal('Ávila'),notes:z.string().trim().max(1500).default(''),method:z.literal('cash').default('cash'),requestKey:z.string().uuid() })
export async function configuration(env:AppEnv):Promise<{products:Product[];hours:Hours[];accepting:boolean}> {
 const [products,hours,settings]=await Promise.all([env.DB.prepare('SELECT * FROM products ORDER BY minutes').all<Product>(),env.DB.prepare('SELECT * FROM hours ORDER BY weekday,open_minute').all<Hours>(),env.DB.prepare('SELECT accepting FROM settings WHERE id=1').first<{accepting:number}>()])
 return {products:products.results,hours:hours.results,accepting:!!settings?.accepting}
}
export async function available(env:AppEnv,date:string,q:Quantities,now=nowSeconds()) {
 const config=await configuration(env)
 const [bookings,blocks]=await Promise.all([env.DB.prepare("SELECT start_at,end_at,quantity FROM bookings WHERE service_date=? AND status IN('confirmed','completed')").bind(date).all<{start_at:number;end_at:number;quantity:number}>(),env.DB.prepare('SELECT start_at,end_at FROM blocks').all<{start_at:number;end_at:number}>()])
 const a=availability(date,q,config.products,config.hours,bookings.results,blocks.results,now)
 return {...a,slots:a.slots.map(s=>({...s,available:config.accepting && s.available}))}
}
export async function findByToken(env:AppEnv,value:string) {
 if(!/^[a-f0-9]{64}$/.test(value)) throw createError({statusCode:404,statusMessage:'Reserva no encontrada'})
 const b=await env.DB.prepare('SELECT * FROM bookings WHERE token_hash=?').bind(await hash(value)).first<Booking>()
 if(!b) throw createError({statusCode:404,statusMessage:'Reserva no encontrada'})
 return b
}
export function publicBooking(b:Booking) { return {reference:b.reference,startAt:b.start_at,endAt:b.end_at,date:b.service_date,quantity:b.quantity,amount:b.amount_cents,lines:JSON.parse(b.lines_json),name:b.name,address:b.address,notes:b.notes,status:b.status,paymentStatus:b.payment_status,method:b.method} }
export async function createBooking(env:AppEnv,input:unknown,source?:'web'|'admin') {
 const parsed=bookingSchema.safeParse(input)
 if(!parsed.success) throw createError({statusCode:400,statusMessage:'Revisa los datos de la reserva',data:parsed.error.flatten()})
 const data=parsed.data
 let legal:ReturnType<typeof parseBookingLegal>|undefined
 if(source){try{legal=parseBookingLegal(input,data.startAt,nowSeconds())}catch{throw createError({statusCode:400,statusMessage:'Confirma las condiciones, la mayoría de edad y, cuando corresponda, el inicio anticipado del servicio.'})}}
 const idem=await hash(data.requestKey)
 const previous=await env.DB.prepare('SELECT * FROM bookings WHERE idempotency_hash=?').bind(idem).first<Booking>()
 if(previous) return previous
 if(!env.ADMIN_EMAIL || !env.EMAIL_FROM) throw createError({statusCode:503,statusMessage:'Las reservas aún no están abiertas'})
 const now=nowSeconds(), date=localDate(data.startAt)
 const a=await available(env,date,data.quantities,now)
 if(!a.slots.some(s=>s.startAt===data.startAt && s.available)) throw createError({statusCode:409,statusMessage:'Esta hora ya no está disponible'})
 const config=await configuration(env),sum=totals(data.quantities,config.products)
 const value=token(),id=crypto.randomUUID()
 const b:Booking={id,token_hash:await hash(value),reference:'AUR-'+id.slice(0,8).toUpperCase(),service_date:date,start_at:data.startAt,end_at:data.startAt+sum.duration*60,quantity:sum.quantity,amount_cents:sum.amount,lines_json:JSON.stringify(config.products.filter(p=>data.quantities[p.id]>0).map(p=>({...p,quantity:data.quantities[p.id]}))),name:data.name,email:data.email,phone:data.phone,address:data.address+', Ávila capital',notes:data.notes,method:data.method,status:'confirmed',payment_status:'pending',created_at:now,paid_at:null,manage_url:new URL('/reserva/'+value,env.SITE_URL).href,origin:env.SITE_URL,idempotency_hash:idem}
 const keys=Object.keys(b)
 const stmt=env.DB.prepare('INSERT INTO bookings('+keys.join(',')+') VALUES('+keys.map(()=>'?').join(',')+')').bind(...Object.values(b))
 const acceptance=legal?env.DB.prepare('INSERT INTO booking_legal(booking_id,terms_version,accepted_at,source,adults_confirmed,early_service_requested,withdrawal_acknowledged,early_requested_at,withdrawal_acknowledged_at,early_source) VALUES(?,?,?,?,1,?,?,?,?,?)').bind(id,legal.termsVersion,now,source!,Number(legal.earlyServiceRequested),Number(legal.withdrawalAcknowledged),legal.earlyServiceRequested?now:null,legal.withdrawalAcknowledged?now:null,legal.earlyServiceRequested?source!:null):null
 try { await env.DB.batch([stmt,...(acceptance?[acceptance]:[]),...noticeStatements(env,b)]) } catch(error) {
  const existing=await env.DB.prepare('SELECT * FROM bookings WHERE idempotency_hash=?').bind(idem).first<Booking>()
  if(existing)return existing
  safeError(error)
 }
 return b
}

