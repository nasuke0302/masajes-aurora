import {createError} from 'h3'
import type {AppEnv} from './types'
import {bookingSchema,createBooking} from './bookings'
import {validatedAddress,addressInputSchema} from './addresses'
import {parseBookingLegal} from '../../shared/booking-legal'
import {nowSeconds} from './security'
export async function verifyTurnstile(env:AppEnv,token:unknown,remoteip?:string){
 if(!env.TURNSTILE_SECRET_KEY)throw createError({statusCode:503,statusMessage:'La verificación no está disponible. Inténtalo de nuevo.'})
 if(typeof token!=='string'||!token.trim()||token.length>2048)throw createError({statusCode:403,statusMessage:'Completa la verificación antes de confirmar.'})
 let result:{success?:boolean;hostname?:string;action?:string}
 try{const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:token,...(remoteip?{remoteip}:{})}),signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error('SITEVERIFY_UNAVAILABLE');result=await response.json();if(!result||typeof result!=='object')throw new Error('SITEVERIFY_MALFORMED')}catch{throw createError({statusCode:503,statusMessage:'No se pudo verificar. Inténtalo de nuevo.'})}
 if(result.success!==true||result.hostname!==new URL(env.SITE_URL).hostname||result.action!=='booking_create')throw createError({statusCode:403,statusMessage:'La verificación ha caducado o no es válida. Inténtalo de nuevo.'})
}
export async function createWebBooking(env:AppEnv,input:unknown,remoteip?:string){
 const parsed=bookingSchema.safeParse(input)
 if(!parsed.success)throw createError({statusCode:400,statusMessage:'Revisa los datos de la reserva',data:parsed.error.flatten()})
 try{parseBookingLegal(input,parsed.data.startAt,nowSeconds())}catch{throw createError({statusCode:400,statusMessage:'Confirma las condiciones, la mayoría de edad y el inicio anticipado si corresponde.'})}
 if(!addressInputSchema.safeParse(input).success)throw createError({statusCode:400,statusMessage:'Selecciona una dirección con número en Ávila capital.'})
 await verifyTurnstile(env,(input as Record<string,unknown>).turnstileToken,remoteip)
 return createBooking(env,{...(input as Record<string,unknown>),...parsed.data,address:await validatedAddress(input)},'web')
}
