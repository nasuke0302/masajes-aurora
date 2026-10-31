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
for(const k of ['ADMIN_EMAIL','EMAIL_FROM','TURNSTILE_SECRET_KEY'])config.env[k]={type:'text',value:''}
if(smoke){config.env.ADMIN_EMAIL={type:'text',value:'aurora@example.com'};config.env.EMAIL_FROM={type:'text',value:'test@example.com'};config.env.TURNSTILE_SECRET_KEY={type:'text',value:'test-only'}}
config.env.SITE_URL={type:'text',value:'http://localhost:8888'}
config.env.LOCAL_DEV={type:'text',value:'true'}
config.env.ACCESS_MODE={type:'text',value:'required'}
for(const k of ['ACCESS_AUD','ACCESS_TEAM_DOMAIN','ACCESS_EMAIL'])config.env[k]={type:'text',value:''}
const mf=new Miniflare({workers:[{config}],port:smoke?0:8888,logRequests:false,telemetry:{enabled:false},...(smoke?{}:{resourcePersistencePath:resolve('.data/worker')})})
try{
 const DB=await mf.getD1Database('DB')
 if(!await DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'").first())await DB.exec((await readFile('migrations/0001_booking.sql','utf8')).replace(/\n/g,' '))
 if((await DB.prepare("SELECT sql FROM sqlite_master WHERE name='bookings'").first())?.sql?.includes('BETWEEN 1 AND 3'))await DB.exec((await readFile('migrations/0002_remove_daily_capacity.sql','utf8')).replace(/\n/g,' '))
 if((await DB.prepare("SELECT sql FROM sqlite_master WHERE name='bookings'").first())?.sql?.includes('checkout_url'))await DB.exec((await readFile('migrations/0003_cash_only.sql','utf8')).replace(/\n/g,' ')); if(!await DB.prepare("SELECT name FROM sqlite_master WHERE name='booking_legal'" ).first())await DB.exec((await readFile('migrations/0004_privacy.sql','utf8')).replace(/\n/g,' ')); if(smoke){
  for(const path of ['/','/reservar','/admin/acceso','/aviso-legal','/privacidad','/cookies','/condiciones-reserva','/api/catalog','/images/masaje-cuerpo-completo-hero-952.webp']){
   const r=await mf.dispatchFetch('http://localhost:8888'+path);if(r.status!==200)console.error(await r.clone().text());assert.equal(r.status,200,path)
   if(path==='/'){const html=await r.text();assert.match(html,/Aurora Masajista/);assert.match(html,/Reservar una sesión/);assert.match(html,/Consultar por WhatsApp/);assert.doesNotMatch(html,/Reservar por WhatsApp/);for(const price of ['55 €','50 €','10 €'])assert(html.includes(price),'Missing staging price: '+price)}
  }
  for(const path of ['/','/api/catalog','/api/admin/settings','/images/masaje-cuerpo-completo-hero-952.webp'])assert.equal((await mf.dispatchFetch('https://untrusted.example'+path)).status,401)
  const catalog=await (await mf.dispatchFetch('http://localhost:8888/api/catalog')).json();assert.equal(catalog.accepting,false)
  await DB.prepare('UPDATE settings SET accepting=1').run();await DB.prepare('UPDATE products SET price_cents=5000').run()
  const form=await (await mf.dispatchFetch('http://localhost:8888/reservar')).text();assert.match(form,/Pago en efectivo/);assert.doesNotMatch(form,/Pagar ahora|Continuar al pago/)
  const headers={'Origin':'http://localhost:8888','Content-Type':'application/json'}
  for(const path of ['/api/checkout/obsolete','/api/stripe/webhook'])assert.equal((await mf.dispatchFetch('http://localhost:8888'+path,{method:'POST',headers,body:'{}'})).status,404)
  const invalid=await mf.dispatchFetch('http://localhost:8888/api/bookings',{method:'POST',headers,body:JSON.stringify({quantities:{massage40:0,massage60:1},startAt:Math.floor(Date.now()/1000)+86400,name:'Test Client',email:'client@example.com',phone:'+34644517187',address:'Calle Mayor 12',city:'Ávila',addressSelection:{id:'07.05.G05_050190111614',portal:'2'},addressExtra:'',requestKey:crypto.randomUUID(),termsVersion:'2026-10-12.1',acceptTerms:true,adultsOnly:true,earlyServiceRequested:true,withdrawalAcknowledged:true})});assert.equal(invalid.status,403)
  assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM bookings').first()).n,0);assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM outbox').first()).n,0)
  assert.equal((await mf.dispatchFetch('http://localhost:8888/api/admin/settings')).status,401)
  assert.equal((await mf.dispatchFetch('http://localhost:8888/api/bookings',{method:'POST',body:'x'.repeat(32769)})).status,413)
  console.log('Workers runtime verified: SSR, API, assets, private access and body size guard')
 }else{
  console.log('Workers preview: '+await mf.ready+' (isolated DB; bookings and email disabled). Ctrl+C to stop.')
  await new Promise(res=>{process.once('SIGINT',res);process.once('SIGTERM',res)})
 }
}finally{await mf.dispose()}
