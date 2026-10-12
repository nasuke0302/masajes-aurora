import type { MessageBatch, ExportedHandler } from '@cloudflare/workers-types'
import type {InferEnv} from 'cf/config'
import type config from '../notifications.cloudflare.config'
import type {Outbox} from '../server/core/types'
type Env=InferEnv<ReturnType<typeof config>['worker']>
type EmailMessage={from:string;to:string;subject:string;text:string;html:string}
export async function sendResend(env:Env,message:EmailMessage,id:string){
 if(!env.RESEND_API_KEY)throw new Error('EMAIL_NOT_CONFIGURED')
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'aurora/'+id},body:JSON.stringify({...message,reply_to:env.ADMIN_EMAIL}),signal:AbortSignal.timeout(15000)})
 if(!response.ok)throw new Error('EMAIL_SEND_FAILED')
 const result=await response.json() as {id?:string}
 if(!result.id)throw new Error('EMAIL_SEND_FAILED')
 return {messageId:result.id}
}
export async function deliver(env:Env,id:string,send:typeof sendResend=sendResend){
 const now=Math.floor(Date.now()/1000)
 const row=await env.DB.prepare('UPDATE outbox SET lease_until=?,attempts=attempts+1 WHERE id=? AND created_at>=? AND sent_at IS NULL AND (lease_until IS NULL OR lease_until<?) RETURNING *').bind(now+300,id,now-30*86400,now).first<Outbox>()
 if(!row)return
 try{
  const html='<div style="font-family:Arial,sans-serif;white-space:pre-wrap">'+row.body.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))+'</div>'
  const result=await send(env,{from:env.EMAIL_FROM,to:row.recipient,subject:row.subject,text:row.body,html},id)
  await env.DB.prepare('UPDATE outbox SET sent_at=?,provider_id=?,lease_until=NULL,last_error=NULL WHERE id=?').bind(now,result.messageId,id).run()
 }catch(error){
  await env.DB.prepare('UPDATE outbox SET lease_until=?,last_error=? WHERE id=?').bind(now+60,error instanceof Error?(error as Error & {code?:string}).code||'EMAIL_SEND_FAILED':'EMAIL_SEND_FAILED',id).run()
  throw new Error('EMAIL_SEND_FAILED')
 }
}
export default {
 async queue(batch:MessageBatch<{id:string}>,env:Env){for(const message of batch.messages){try{await deliver(env,message.body.id);message.ack()}catch{message.retry({delaySeconds:60})}}}
} satisfies ExportedHandler<Env,{id:string}>

