export default {async fetch(request,env){
 const url=new URL(request.url)
 if(url.hostname==='www.auroramasajista.com'){url.hostname='auroramasajista.com';url.protocol='https:';return Response.redirect(url.href,308)}
 const asset=await env.ASSETS.fetch(request)
 const response=new Response(asset.body,asset)
 response.headers.set('X-Content-Type-Options','nosniff')
 response.headers.set('Referrer-Policy','no-referrer')
 response.headers.set('X-Frame-Options','DENY')
 return response
}}
