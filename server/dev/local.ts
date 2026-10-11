import {createRequire} from 'node:module'
import {readFile,mkdir,appendFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {deliver} from '../../workers/notifications'
import {reconcile} from '../core/payments'
import {dispatch} from '../core/notifications'
import type {AppEnv} from '../core/types'
export default defineNitroPlugin(async app=>{
 const {Miniflare}=createRequire(resolve('package.json'))('miniflare') as typeof import('miniflare')
 const mf=new Miniflare({workers:[{config:{name:'local',compatibilityDate:'2026-10-11',env:{DB:{type:'d1',id:'00000000-0000-0000-0000-000000000001'}},manifest:{mainModule:'index.mjs',modules:{'index.mjs':{type:'esm',contents:'export default {fetch(){return new Response("local")}}'}}}}}],resourcePersistencePath:resolve('.data/d1')})
 const DB=await mf.getD1Database('DB')
 await mkdir('.data',{recursive:true})
 if(!await DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'").first())await DB.exec((await readFile('migrations/0001_booking.sql','utf8')).replace(/--[^\n]*/g,'').replace(/\n/g,' '))
 const mailEnv={DB,EMAIL_FROM:process.env.EMAIL_FROM||'reservas@localhost',EMAIL:{async send(message:{to:unknown;subject:string;text?:string;html?:string}){await appendFile('.data/mail.jsonl',JSON.stringify({...message,at:new Date().toISOString()})+'\n');return {messageId:crypto.randomUUID()}}}}
 const env={DB,ASSETS:undefined,SITE_URL:process.env.SITE_URL?.startsWith('http://localhost')?process.env.SITE_URL:'http://localhost:3000',ADMIN_EMAIL:process.env.ADMIN_EMAIL||'',EMAIL_FROM:process.env.EMAIL_FROM||'',STRIPE_SECRET_KEY:process.env.STRIPE_SECRET_KEY||'',STRIPE_WEBHOOK_SECRET:process.env.STRIPE_WEBHOOK_SECRET||'',STRIPE_PAYMENT_CONFIGURATION:process.env.STRIPE_PAYMENT_CONFIGURATION||'',NOTIFICATIONS:{async send(body:{id:string}){await deliver(mailEnv as Parameters<typeof deliver>[0],body.id)}}} as unknown as AppEnv
 app.hooks.hook('request',event=>{event.context.cloudflare={...event.context.cloudflare,env};})
 const timer=setInterval(()=>{void reconcile(env).then(()=>dispatch(env)).catch(()=>console.error('Local maintenance failed'))},60000)
 app.hooks.hook('close',async()=>{clearInterval(timer);await mf.dispose()})
})

