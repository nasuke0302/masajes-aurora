import type {AppEnv} from './types'
import {localDate,datePlus} from '../../shared/booking'
import {nowSeconds} from './security'
export function retentionCutoff(now:number){
 const date=localDate(now),year=Number(date.slice(0,4))-1,month=date.slice(5,7),day=date.slice(8,10)
 const anniversary=`${year}-${month}-${day}`
 // February 29 is clamped to February 28 in the preceding non-leap year.
 const valid=new Date(anniversary+'T12:00:00Z').toISOString().slice(0,10)
 return valid===anniversary?anniversary:datePlus(valid,-1)
}
export async function purgeExpiredData(env:AppEnv,now=nowSeconds()){
 const cutoff=retentionCutoff(now)
 await env.DB.batch([
  env.DB.prepare("DELETE FROM bookings WHERE service_date < ? AND id NOT IN (SELECT booking_id FROM booking_legal WHERE retention_hold=1)").bind(cutoff),
  env.DB.prepare('DELETE FROM outbox WHERE created_at < ? AND NOT EXISTS (SELECT 1 FROM booking_legal WHERE retention_hold=1 AND substr(outbox.id,1,length(booking_id)+1)=booking_id||\':\')').bind(now-30*86400),
  env.DB.prepare('DELETE FROM admin_links WHERE expires_at < ?').bind(now),
  env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').bind(now),
  env.DB.prepare('DELETE FROM rate_limits WHERE updated_at < ?').bind(now-86400),
 ])
}
