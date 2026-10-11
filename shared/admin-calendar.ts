import { datePlus, localLabel, type Hours } from './booking'
export type AgendaReservation = { id:string; reference:string; service_date:string; start_at:number; end_at:number; quantity:number; amount_cents:number; lines_json:string; name:string; email:string; phone:string; address:string; notes:string; method:string; status:string; payment_status:string }
export type AgendaBlock = { id:string; start_at:number; end_at:number; reason:string }
export const occupiesAgenda = (status:string) => ['held','confirmed','completed'].includes(status)
export function monday(date:string) {
 const day = new Date(date+'T12:00:00Z').getUTCDay()
 return datePlus(date,-((day+6)%7))
}
export function calendarDates(anchor:string,view:'week'|'day') {
 return view==='day' ? [anchor] : Array.from({length:7},(_,i)=>datePlus(monday(anchor),i))
}
export function clockMinute(epoch:number) {
 const [hour,minute] = localLabel(epoch).split(':').map(Number)
 return hour!*60+minute!
}
export function dayMassageCount(rows:AgendaReservation[],date:string) {
 return rows.filter(r=>r.service_date===date&&occupiesAgenda(r.status)).reduce((sum,r)=>sum+r.quantity,0)
}
export function agendaRange(hours:Hours[],rows:AgendaReservation[]) {
 const active=rows.filter(r=>occupiesAgenda(r.status))
 const starts=[...hours.map(h=>h.open_minute),...active.map(r=>clockMinute(r.start_at))]
 const ends=[...hours.map(h=>h.close_minute),...active.map(r=>Math.min(1440,clockMinute(r.start_at)+(r.end_at-r.start_at)/60+30))]
 return {start:Math.min(540,...starts.map(m=>Math.floor(m/60)*60)),end:Math.max(1260,...ends.map(m=>Math.min(1440,Math.ceil(m/60)*60)))}
}
