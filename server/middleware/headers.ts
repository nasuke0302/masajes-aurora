export default defineEventHandler(event=>{setHeader(event,'X-Content-Type-Options','nosniff');setHeader(event,'Referrer-Policy','no-referrer');setHeader(event,'X-Frame-Options','DENY');if(event.path.startsWith('/api/')||event.path.startsWith('/reserva/')||event.path.startsWith('/admin')){setHeader(event,'Cache-Control','no-store');setHeader(event,'X-Robots-Tag','noindex, nofollow')}})

