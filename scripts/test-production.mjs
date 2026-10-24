import assert from 'node:assert/strict'
import {readFile,readdir} from 'node:fs/promises'
import {resolve,extname} from 'node:path'
import {Miniflare} from 'miniflare'
import {readBuildOutput} from '@cloudflare/build-output-utils'
const root=resolve('.cloudflare/production'),built=await readBuildOutput(root)
assert.equal(JSON.parse(await readFile(resolve(root,'profile.json'),'utf8')).profile,'production')
assert.deepEqual(Object.keys(built.workers),['default'])
const web=built.workers.default,config=structuredClone(web.config)
assert.equal(config.name,'masajes-aurora');assert.deepEqual(Object.keys(config.env),['ASSETS']);assert.deepEqual(config.triggers,[])
assert.deepEqual(Object.keys(config.manifest.modules),['index.mjs'])
const contents=await readFile(resolve(web.bundleDir,'index.mjs'),'utf8')
const routePattern=/\/(?:reservar|admin)(?:[\/"'`]|$)|\/reserva\//
assert.doesNotMatch(contents,/nuxt|authorizeAccess|scheduled|queue\(|RESEND|TURNSTILE|\.DB\b/)
async function scan(dir){for(const item of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,item.name);assert.doesNotMatch(item.name,/^(?:admin|reservar|reserva|BookingForm|BookingAddress|BookingTurnstile|AdminCalendar|200\.html)$/);if(item.isDirectory())await scan(path);else if(['.js','.mjs','.html','.json'].includes(extname(path))){const text=await readFile(path,'utf8');assert.doesNotMatch(text,/challenges\.cloudflare\.com|booking_create|\/api\/(?:bookings|admin|catalog|auth-mode)|vue-cal|admin_sessions/,path)}}}
await scan(web.assetsDir)
for(const name of await readdir(resolve(web.assetsDir,'_nuxt')))if(name.endsWith('.js'))assert.doesNotMatch(await readFile(resolve(web.assetsDir,'_nuxt',name),'utf8'),routePattern,name)
config.manifest={mainModule:'index.mjs',modulesRoot:web.bundleDir,modules:{'index.mjs':{type:'esm',contents}}}
config.assets={...config.assets,directory:web.assetsDir,hasUserWorker:true}
const mf=new Miniflare({workers:[{config}],port:0,logRequests:false,telemetry:{enabled:false}})
try{
 for(const path of ['/','/aviso-legal','/privacidad','/cookies','/condiciones-reserva','/robots.txt','/sitemap.xml','/images/masaje-fluido-hero.png']){
  const r=await mf.dispatchFetch('https://auroramasajista.com'+path);assert.equal(r.status,200,path)
  if(path==='/'){const html=await r.text();assert.match(html,/Reservar por WhatsApp/);assert.doesNotMatch(html,/href="\/reservar"|Reservar una sesión|Recibirás la confirmación de tu reserva por email/);assert.match(html,/https:\/\/wa.me\/34644798063/)}
  if(path==='/sitemap.xml')assert.doesNotMatch(await r.text(),/\/reservar|\/admin|\/reserva\//)
 }
 for(const path of ['/reservar','/reserva/token','/admin','/admin/acceso','/api/catalog','/api/auth-mode','/api/admin/settings','/unknown'])for(const headers of [{},{'Sec-Fetch-Mode':'navigate'}])assert.equal((await mf.dispatchFetch('https://auroramasajista.com'+path,{headers})).status,404,path)
 const www=await mf.dispatchFetch('https://www.auroramasajista.com/privacidad?test=1',{redirect:'manual'});assert.equal(www.status,308);assert.equal(www.headers.get('location'),'https://auroramasajista.com/privacidad?test=1')
 console.log('Static production verified: isolated artifact, no backend, public pages, WhatsApp, redirects and real 404s')
}finally{await mf.dispose()}
