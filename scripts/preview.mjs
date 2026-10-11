import {Miniflare} from 'miniflare'
import {readBuildOutput} from '@cloudflare/build-output-utils'
import {readFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import assert from 'node:assert/strict'
const smoke=process.argv.includes('--smoke'),built=await readBuildOutput(process.cwd()),web=built.workers.default
const config=structuredClone(web.config)
config.manifest={mainModule:config.manifest.mainModule,modulesRoot:web.bundleDir,modules:Object.fromEntries(await Promise.all(Object.entries(config.manifest.modules).filter(([,m])=>m.type!=='sourcemap').map(async([name,m])=>[name,{type:m.type,contents:await readFile(resolve(web.bundleDir,name),'utf8')}])))}
config.assets={...config.assets,directory:web.assetsDir,hasUserWorker:true}
config.triggers=[]
config.env.DB={type:'d1',id:'00000000-0000-0000-0000-000000000002'}
for(const k of ['ADMIN_EMAIL','EMAIL_FROM','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_PAYMENT_CONFIGURATION','TURNSTILE_SECRET_KEY'])config.env[k]={type:'text',value:''}
config.env.SITE_URL={type:'text',value:'http://localhost:8888'}
config.env.LOCAL_DEV={type:'text',value:'true'}
for(const k of ['ACCESS_AUD','ACCESS_TEAM_DOMAIN','ACCESS_EMAIL'])config.env[k]={type:'text',value:''}
const mf=new Miniflare({workers:[{config}],port:smoke?0:8888,logRequests:false,telemetry:{enabled:false},...(smoke?{}:{resourcePersistencePath:resolve('.data/worker')})})
try{
 const DB=await mf.getD1Database('DB')
 if(!await DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'").first())await DB.exec((await readFile('migrations/0001_booking.sql','utf8')).replace(/\n/g,' '))
 if((await DB.prepare("SELECT sql FROM sqlite_master WHERE name='bookings'").first())?.sql?.includes('BETWEEN 1 AND 3'))await DB.exec((await readFile('migrations/0002_remove_daily_capacity.sql','utf8')).replace(/\n/g,' '))
 if(smoke){
  for(const path of ['/','/reservar','/admin/acceso','/api/catalog','/images/masaje-fluido-hero.png']){
   const r=await mf.dispatchFetch('http://localhost:8888'+path);if(r.status!==200)console.error(await r.clone().text());assert.equal(r.status,200,path)
   if(path==='/')assert.match(await r.text(),/Masajes Aurora/)
  }
  for(const path of ['/','/api/catalog','/api/admin/settings','/images/masaje-fluido-hero.png'])assert.equal((await mf.dispatchFetch('https://untrusted.example'+path)).status,401)
  const catalog=await (await mf.dispatchFetch('http://localhost:8888/api/catalog')).json();assert.equal(catalog.accepting,false)
  assert.equal((await mf.dispatchFetch('http://localhost:8888/api/admin/settings')).status,401)
  assert.equal((await mf.dispatchFetch('http://localhost:8888/api/bookings',{method:'POST',body:'x'.repeat(32769)})).status,413)
  console.log('Workers runtime verified: SSR, API, assets, private access and body size guard')
 }else{
  console.log('Workers preview: '+await mf.ready+' (isolated DB; bookings and email disabled). Ctrl+C to stop.')
  await new Promise(res=>{process.once('SIGINT',res);process.once('SIGTERM',res)})
 }
}finally{await mf.dispose()}
