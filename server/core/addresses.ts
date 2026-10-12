import {createError} from 'h3'
import {z} from 'zod'
const canonical=(value:string)=>value.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().trim()
export const addressSelectionSchema=z.object({id:z.string().regex(/^[a-zA-Z0-9._-]{1,250}$/),portal:z.string().regex(/^\d+(\.\d+)?$/).max(20)})
export const addressInputSchema=z.object({addressSelection:addressSelectionSchema,addressExtra:z.string().trim().max(100).default('')})
export type AddressCandidate={id:string;portal:string;street:string;label:string}
export function normalizeAddress(value:unknown):AddressCandidate|null{
 if(!value||typeof value!=='object')return null
 const p=value as Record<string,unknown>,portal=String(p.portalNumber??'')
 if(p.type!=='portal'||p.noNumber!==false||p.muniCode!=='05019'||typeof p.poblacion!=='string'||canonical(p.poblacion)!=='avila'||typeof p.address!=='string'||!p.address.trim()||typeof p.id!=='string'||!addressSelectionSchema.safeParse({id:p.id,portal}).success||typeof p.lat!=='number'||typeof p.lng!=='number'||!Number.isFinite(p.lat)||!Number.isFinite(p.lng))return null
 let street=p.address.replace(/,\s*Ávila\s*$/i,'').trim()
 if(typeof p.tip_via==='string'&&p.tip_via.trim()&&!canonical(street).startsWith(canonical(p.tip_via)+' '))street=p.tip_via.trim()+' '+street
 if(!street.endsWith(' '+portal))street+=' '+portal
 return {id:p.id,portal,street,label:street+', Ávila'}
}
async function request(endpoint:'candidates'|'find',parameters:Record<string,string>):Promise<unknown>{
 const url=new URL(endpoint,'https://www.cartociudad.es/geocoder/api/geocoder/');url.search=new URLSearchParams(parameters).toString()
 try{const r=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error('ADDRESS_UPSTREAM');return await r.json()}catch{throw createError({statusCode:503,statusMessage:'No se puede comprobar la dirección. Inténtalo de nuevo o consulta por WhatsApp.'})}
}
export async function searchAddresses(query:string){
 const q=z.string().trim().min(3).max(150).safeParse(query);if(!q.success)throw createError({statusCode:400,statusMessage:'Escribe la calle y el número.'})
 const data=await request('candidates',{q:q.data+', Ávila',limit:'15',municipio:'05019'})
 if(!Array.isArray(data))throw createError({statusCode:503,statusMessage:'No se puede comprobar la dirección. Inténtalo de nuevo.'})
 const found=data.map(normalizeAddress).filter((p):p is AddressCandidate=>!!p)
 return [...new Map(found.map(p=>[p.id+':'+p.portal,p])).values()].slice(0,8)
}
export async function validatedAddress(input:unknown){
 const parsed=addressInputSchema.safeParse(input);if(!parsed.success)throw createError({statusCode:400,statusMessage:'Selecciona una dirección con número en Ávila capital.'})
 const {id,portal}=parsed.data.addressSelection
 const data=normalizeAddress(await request('find',{id,type:'portal',portal}))
 if(!data||data.id!==id||data.portal!==portal)throw createError({statusCode:400,statusMessage:'La dirección no pertenece al núcleo de Ávila o no tiene un portal válido.'})
 return data.street+(parsed.data.addressExtra?', '+parsed.data.addressExtra:'')
}
