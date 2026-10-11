export default defineEventHandler(event=>{setHeader(event,'Content-Type','text/plain');const origin=useRuntimeConfig().public.siteUrl;return 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /reserva/\nDisallow: /api/\n'+(origin?'Sitemap: '+new URL('/sitemap.xml',origin).href+'\n':'')})

