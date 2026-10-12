import { datePlus, localDate, localLabel, dayInstants, type Hours } from './booking'
export type AgendaReservation = { id:string; reference:string; service_date:string; start_at:number; end_at:number; quantity:number; amount_cents:number; lines_json:string; name:string; email:string; phone:string; address:string; notes:string; method:string; status:string; payment_status:string;created_at?:number;retention_hold?:number;early_service_requested?:number }
export type AgendaBlock = { id:string; start_at:number; end_at:number; reason:string }
export const occupiesAgenda = (status:string) => ['confirmed','completed'].includes(status)
export function monday(date:string) {
 const day = new Date(date+'T12:00:00Z').getUTCDay()
 return datePlus(date,-((day+6)%7))
}
export function calendarDates(anchor:string,view:'week'|'day'|'month') {
 if(view==='month') {
  const first=anchor.slice(0,7)+'-01',start=monday(first)
  const next=new Date(first+'T12:00:00Z');next.setUTCMonth(next.getUTCMonth()+1)
  const last=datePlus(next.toISOString().slice(0,10),-1),end=datePlus(monday(last),6)
  return Array.from({length:Math.round((Date.parse(end)-Date.parse(start))/86400000)+1},(_,i)=>datePlus(start,i))
 }
 return view==='day' ? [anchor] : Array.from({length:7},(_,i)=>datePlus(monday(anchor),i))
}
// Vue Cal 4 uses browser-local Dates. Treat those as Madrid wall-clock values,
// never as actual instants: the server and booking rules use Europe/Madrid.
export function calendarDateText(date:Date) {
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}
export function calendarWallTime(epoch:number) {return localDate(epoch)+' '+localLabel(epoch)}
export function calendarInstant(date:Date|string) {
 const text=typeof date==='string'?date:calendarDateText(date)+'T'+String(date.getHours()).padStart(2,'0')+':'+String(date.getMinutes()).padStart(2,'0')
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text))throw new Error('Fecha u hora inválida')
 const minute=Math.round((Number(text.slice(11,13))*60+Number(text.slice(14,16)))/10)*10
 const candidates=dayInstants(text.slice(0,10)).filter(p=>p.minute===minute)
 if(candidates.length!==1)throw new Error('Hora inexistente o ambigua en Ávila. Elige otra hora.')
 return candidates[0]!.epoch
}
export function closedHours(date:string,hours:Hours[]) {
 const weekday=new Date(date+'T12:00:00Z').getUTCDay()
 const windows=hours.filter(h=>h.weekday===weekday).sort((a,b)=>a.open_minute-b.open_minute)
 const gaps:{start:number;end:number}[]=[];let cursor=0
 for(const w of windows){if(w.open_minute>cursor)gaps.push({start:cursor,end:w.open_minute});cursor=Math.max(cursor,w.close_minute)}
 if(cursor<1440)gaps.push({start:cursor,end:1440})
 return gaps
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
