import assert from 'node:assert/strict'
import {readFile,readdir} from 'node:fs/promises'
import {resolve,extname} from 'node:path'
import {Miniflare} from 'miniflare'
import {readBuildOutput} from '@cloudflare/build-output-utils'
import {assertGuide} from './assert-guide.mjs'
const root=resolve('.cloudflare/production'),built=await readBuildOutput(root)
assert.equal(JSON.parse(await readFile(resolve(root,'profile.json'),'utf8')).profile,'production')
assert.deepEqual(Object.keys(built.workers),['default'])
const web=built.workers.default,config=structuredClone(web.config)
assert.equal(config.name,'masajes-aurora');assert.deepEqual(Object.keys(config.env),[]);assert.deepEqual(config.triggers,[])
assert.equal(config.manifest,undefined);assert.equal(web.bundleDir,undefined)
assert.equal(config.assets.runWorkerFirst,false);assert.equal(config.observability.enabled,false)
const routePattern=/\/(?:reservar|admin)(?:[\/"'`]|$)|\/reserva\//
function assertPublicOffer(html) {
 const text=html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')
 for(const price of ['55 €','50 €','10 €'])assert(text.includes(price),'Missing public price: '+price)
 assert.doesNotMatch(text,/(?<![\d,])40 (?:minutos|€)|49,50|59,50|10\s*%|[Aa]horras/)
 assert.match(text,/3 × 2 metros/)
}
async function scan(dir){for(const item of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,item.name);assert.doesNotMatch(item.name,/^(?:admin|reservar|reserva|BookingForm|BookingAddress|BookingTurnstile|AdminCalendar|200\.html)$/);if(item.isDirectory())await scan(path);else if(['.js','.mjs','.html','.json'].includes(extname(path))){const text=await readFile(path,'utf8');assert.doesNotMatch(text,/challenges\.cloudflare\.com|booking_create|\/api\/(?:bookings|admin|catalog|auth-mode)|vue-cal|admin_sessions/,path)}}}
await scan(web.assetsDir)
for(const name of await readdir(resolve(web.assetsDir,'_nuxt')))if(name.endsWith('.js'))assert.doesNotMatch(await readFile(resolve(web.assetsDir,'_nuxt',name),'utf8'),routePattern,name)
config.assets={...config.assets,directory:web.assetsDir,hasUserWorker:false}
// This Miniflare release requires a user-module placeholder even in assets-only mode.
// It exists only in this test adapter, never in the deployable build. Any invocation fails the test.
config.manifest={mainModule:'test-sentinel.mjs',modules:{'test-sentinel.mjs':{type:'esm',contents:'export default {fetch(){throw new Error("ASSETS_ONLY_MUST_NOT_INVOKE_CODE")}}'}}}
const mf=new Miniflare({workers:[{config}],port:0,logRequests:false,telemetry:{enabled:false}})
try{
 for(const path of ['/','/masaje-relajante-avila','/aviso-legal','/privacidad','/cookies','/condiciones-reserva','/robots.txt','/sitemap.xml','/images/masaje-cuerpo-completo-hero-952.webp']){
  const r=await mf.dispatchFetch('https://auroramasajista.com'+path);assert.equal(r.status,200,path)
  if(['/','/masaje-relajante-avila','/condiciones-reserva'].includes(path))assertPublicOffer(await r.clone().text())
  if(path==='/'){assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.equal(r.headers.get('referrer-policy'),'no-referrer');assert.equal(r.headers.get('x-frame-options'),'DENY');const html=await r.text();assert.match(html,/Reservar por WhatsApp/);assert.doesNotMatch(html,/href="\/reservar"|Reservar una sesión|Recibirás la confirmación de tu reserva por email/);assert.match(html,/https:\/\/wa.me\/34644517187/);assert(html.includes('href="/masaje-relajante-avila"'))}
  if(path==='/masaje-relajante-avila')assertGuide(await r.text())
  if(path==='/sitemap.xml'){const xml=await r.text();assert.doesNotMatch(xml,/\/reservar|\/admin|\/reserva\//);assert(xml.includes('<loc>https://auroramasajista.com/masaje-relajante-avila</loc>'))}
 }
 for(const path of ['/reservar','/reserva/token','/admin','/admin/acceso','/api/catalog','/api/auth-mode','/api/admin/settings','/unknown'])for(const headers of [{},{'Sec-Fetch-Mode':'navigate'}])assert.equal((await mf.dispatchFetch('https://auroramasajista.com'+path,{headers})).status,404,path)
 // The canonical-host redirect lives in Cloudflare Rules, not executable application code.
 console.log('Assets-only production verified: no executable bundle, security headers, public pages, WhatsApp and real 404s')
}finally{await mf.dispose()}
