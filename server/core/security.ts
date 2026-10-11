import { createError, getHeader, getRequestURL, type H3Event } from 'h3'
import type { AppEnv } from './types'
export const nowSeconds = () => Math.floor(Date.now()/1000)
export const token = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2,'0')).join('')
export async function hash(value:string) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('') }
export function environment(event:H3Event):AppEnv {
 const env = event.context.cloudflare?.env as AppEnv | undefined
 if (!env?.DB) throw createError({statusCode:503,statusMessage:'El sistema de reservas no está configurado'})
 return env
}
export function sameOrigin(event:H3Event, env:AppEnv) {
 const origin = getHeader(event,'origin')
 if (origin !== new URL(env.SITE_URL).origin) throw createError({statusCode:403,statusMessage:'Origen no permitido'})
}
export async function limit(env:AppEnv,key:string,max:number,seconds=3600) {
 const bucket=Math.floor(nowSeconds()/seconds)
 const r=await env.DB.prepare('INSERT INTO rate_limits(key,bucket,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN bucket=excluded.bucket THEN count+1 ELSE 1 END,bucket=excluded.bucket RETURNING count').bind(await hash(key),bucket).first<{count:number}>()
 if(r!.count>max) throw createError({statusCode:429,statusMessage:'Demasiadas solicitudes. Inténtalo más tarde.'})
}
export function safeError(error:unknown):never {
 if(error instanceof Error && /CAPACITY|OVERLAP|BLOCKED|BOOKING_IN_BLOCK|LEAD_TIME/.test(error.message)) throw createError({statusCode:409,statusMessage:'El horario o los cupos han cambiado. Elige otra hora.'})
 if(error instanceof Error && 'type' in error && String(error.type).startsWith('Stripe')) throw createError({statusCode:502,statusMessage:'El servicio de pagos no responde. Vuelve a intentarlo con los mismos datos.'})
 throw error
}
export function privateHeaders(event:H3Event) { event.node.res.setHeader('Cache-Control','no-store');event.node.res.setHeader('Referrer-Policy','no-referrer');event.node.res.setHeader('X-Robots-Tag','noindex, nofollow') }

