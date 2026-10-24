import type { AppEnv, Booking } from './types'
import { money, localLabel } from '../../shared/booking'
import { nowSeconds } from './security'
import {bookingConditionsText} from '../../shared/legal'
export function noticeStatements(env:AppEnv,b:Booking,kind:'confirmed'|'cancelled'|'rescheduled'='confirmed',revision='') {
 const lines=JSON.parse(b.lines_json) as {name:string;quantity:number;price_cents:number}[]
 const title=kind==='rescheduled'?'Reserva reprogramada':kind==='confirmed'?'Reserva confirmada':'Reserva cancelada'
 const detail=[title+' · Aurora Masajista', 'Referencia: '+b.reference, 'Fecha: '+b.service_date, 'Horario: '+localLabel(b.start_at)+'–'+localLabel(b.end_at)+' (Europe/Madrid)',...lines.map(l=>l.quantity+' × '+l.name+' · '+money(l.quantity*l.price_cents)), 'Total: '+money(b.amount_cents),'Pago: En efectivo el día de la cita', 'Nombre: '+b.name,'Teléfono: '+b.phone,'Dirección: '+b.address, 'Consultar reserva: '+b.manage_url,'Para cambios o cancelaciones gratuitos: +34 644 51 71 87', 'Condiciones de reserva: '+new URL('/condiciones-reserva',env.SITE_URL).href, 'Privacidad: '+new URL('/privacidad',env.SITE_URL).href,...(kind==='confirmed'?['',bookingConditionsText]:[])].join('\n')
 return [b.email,env.ADMIN_EMAIL].filter(Boolean).map((email,i)=>env.DB.prepare('INSERT OR IGNORE INTO outbox(id,recipient,subject,body,created_at) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM bookings WHERE id=? AND '+(kind!=='cancelled'?"status IN('confirmed','completed')":"status='cancelled'")+')').bind(b.id+':'+kind+':'+(revision?revision+':':'')+i,email,title+' · '+b.reference,detail,nowSeconds(),b.id))
}
export async function dispatch(env:AppEnv) {
 const {results}=await env.DB.prepare('SELECT id FROM outbox WHERE created_at>=? AND sent_at IS NULL AND (lease_until IS NULL OR lease_until<?) ORDER BY created_at LIMIT 30').bind(nowSeconds()-30*86400,nowSeconds()).all<{id:string}>()
 for(const row of results) await env.NOTIFICATIONS.send({id:row.id})
}

