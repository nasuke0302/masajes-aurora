import nuxt from './nuxt.mjs'
import {authorizeAccess} from './access.mjs'
const MAX_BODY=32768
export default {...nuxt,async fetch(request,env,ctx){
 try{await authorizeAccess(request,env)}catch{return new Response('Acceso no autorizado',{status:401,headers:{'Cache-Control':'no-store'}})}
 if(env.ACCESS_MODE==='disabled'&&env.SITE_URL){
  const url=new URL(request.url),canonical=new URL(env.SITE_URL)
  if(url.hostname==='www.'+canonical.hostname){url.hostname=canonical.hostname;url.protocol=canonical.protocol;return Response.redirect(url.href,308)}
 }
 if(Number(request.headers.get('content-length')||0)>MAX_BODY)return new Response('Solicitud demasiado grande',{status:413})
 if(request.body){
  const reader=request.body.getReader(),chunks=[];let size=0
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BODY){await reader.cancel();return new Response('Solicitud demasiado grande',{status:413})}chunks.push(value)}}finally{reader.releaseLock()}
  const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.byteLength}
  request=new Request(request,{body})
 }
 return nuxt.fetch(request,env,ctx)
}}
