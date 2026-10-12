import type { InferEnv } from 'cf/config'
import type config from '../../cloudflare.config'
export type AppEnv = InferEnv<ReturnType<typeof config>['worker']>
export type Booking = {
 id:string;token_hash:string;reference:string;service_date:string;start_at:number;end_at:number;quantity:number;amount_cents:number;lines_json:string;
 name:string;email:string;phone:string;address:string;notes:string;method:'cash';status:'confirmed'|'completed'|'cancelled';
 payment_status:'pending'|'paid';created_at:number;
 paid_at:number|null;manage_url:string;origin:string;idempotency_hash:string|null
}
export type Outbox = {id:string;recipient:string;subject:string;body:string;sent_at:number|null;lease_until:number|null;attempts:number;created_at:number}

