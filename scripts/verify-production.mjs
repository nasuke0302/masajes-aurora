import assert from 'node:assert/strict'
const origin='https://auroramasajista.com'
for(const path of ['/','/aviso-legal','/privacidad','/cookies','/condiciones-reserva','/robots.txt','/sitemap.xml','/images/masaje-fluido-hero.png']){
 const response=await fetch(origin+path,{redirect:'manual',signal:AbortSignal.timeout(20000)})
 assert.equal(response.status,200,path)
 if(path==='/'){
  const html=await response.text();assert.match(html,/Reservar por WhatsApp/);assert.doesNotMatch(html,/href="\/reservar"|Reservar una sesión|Recibirás la confirmación de tu reserva por email|challenges\.cloudflare\.com/)
  const scripts=[...html.matchAll(/<script[^>]*src="([^\"]+)"/g)].map(m=>m[1])
  for(const script of scripts){const js=await fetch(new URL(script,origin)).then(r=>r.text());assert.doesNotMatch(js,/booking_create|\/api\/(?:bookings|admin|catalog)|vue-cal/)}
 }
 if(path==='/sitemap.xml')assert.doesNotMatch(await response.text(),/\/reservar|\/admin|\/reserva\//)
 console.log(path,200)
}
for(const path of ['/reservar','/reservar/','/reserva/token','/admin','/admin/acceso','/api/catalog','/api/bookings','/api/auth-mode','/api/admin/settings','/unknown']){
 for(const headers of [{},{'Sec-Fetch-Mode':'navigate'}])assert.equal((await fetch(origin+path,{headers,redirect:'manual',signal:AbortSignal.timeout(20000)})).status,404,path)
 console.log(path,404)
}
const www=await fetch('https://www.auroramasajista.com/privacidad?check=domain',{redirect:'manual'})
assert.equal(www.status,308);assert.equal(www.headers.get('location'),origin+'/privacidad?check=domain')
const staging=await fetch('https://aurora-staging.geonuvia.com/',{redirect:'manual'})
assert.equal(staging.status,302);assert.match(staging.headers.get('location'),/geonuvia\.cloudflareaccess\.com/)
console.log('Live production: static website and 404s verified; www redirect and staging Access preserved')
