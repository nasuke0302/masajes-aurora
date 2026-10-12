import {z} from 'zod'
import {EARLY_SERVICE_SECONDS,TERMS_VERSION} from './legal'
export const bookingLegalSchema=z.object({termsVersion:z.literal(TERMS_VERSION),acceptTerms:z.literal(true),adultsOnly:z.literal(true),earlyServiceRequested:z.boolean().default(false),withdrawalAcknowledged:z.boolean().default(false)})
export function parseBookingLegal(input:unknown,startAt:number,now:number){
 const result=bookingLegalSchema.parse(input)
 if(startAt<now+EARLY_SERVICE_SECONDS&&(!result.earlyServiceRequested||!result.withdrawalAcknowledged))throw new Error('Solicita expresamente el inicio del servicio dentro de los 14 días y confirma que conoces cuándo se pierde el derecho de desistimiento.')
 return result
}
