import {beforeAll,beforeEach,afterAll,describe,it,expect,vi} from 'vitest'
import {Miniflare} from 'miniflare'
import {readFile} from 'node:fs/promises'
import {createBooking,available} from '../server/core/bookings'
import {deliver,sendResend} from '../workers/notifications'
import {consumeLink,requireAdmin,saveSettings,updateBooking,rescheduleBooking} from '../server/core/admin'
import {createWebBooking} from '../server/core/turnstile'
import {hash} from '../server/core/security'
import {localDate,datePlus,dayInstants,localLabel} from '../shared/booking'
import type {AppEnv,Booking} from '../server/core/types'
let mf:Miniflare,env:AppEnv,start:number
let migrationPreserved=false
const emailSend=vi.fn(),queueSend=vi.fn()
async function row(id:string){return (await env.DB.prepare('SELECT * FROM bookings WHERE id=?').bind(id).first<Booking>())!}
function input(q={massage40:0,massage60:1},s=start,method='cash'){return {quantities:q,startAt:s,name:'Cliente prueba',email:'cliente@example.com',phone:'+34644798063',address:'Calle Mayor 10, 1A',city:'Ávila',notes:'Avisar al llegar',addressSelection:{id:'07.05.G05_050190111614',portal:'2'},addressExtra:'1A',method,requestKey:crypto.randomUUID()}}
beforeAll(async()=>{
 mf=new Miniflare({workers:[{config:{name:'test',compatibilityDate:'2026-10-11',env:{DB:{type:'d1',id:'00000000-0000-0000-0000-000000000001'}},manifest:{mainModule:'index.mjs',modules:{'index.mjs':{type:'esm',contents:'export default {fetch(){return new Response("test")}}'}}}}}]})
 env={DB:await mf.getD1Database('DB'),SITE_URL:'https://aurora.example',ADMIN_EMAIL:'melba@example.com',EMAIL_FROM:'reservas@aurora.example',NOTIFICATIONS:{send:queueSend}} as unknown as AppEnv
 await env.DB.exec((await readFile('migrations/0001_booking.sql','utf8')).replace(/\n/g,' '))
 await env.DB.prepare('UPDATE settings SET accepting=1').run();await env.DB.prepare('UPDATE products SET price_cents=5000').run()
 const seedDate=datePlus(localDate(Math.floor(Date.now()/1000)),1),seedStart=dayInstants(seedDate).find(x=>localLabel(x.epoch)==='09:00')!.epoch
 const seed=await createBooking(env,input({massage40:0,massage60:1},seedStart)),before=await row(seed.id)
 await env.DB.exec((await readFile('migrations/0002_remove_daily_capacity.sql','utf8')).replace(/\n/g,' '))
 migrationPreserved=JSON.stringify(before)===JSON.stringify(await row(seed.id))
 await env.DB.exec((await readFile('migrations/0003_cash_only.sql','utf8')).replace(/\n/g,' '))
 const cash=await row(seed.id);migrationPreserved= migrationPreserved&&Object.entries(cash).every(([key,value])=>value===before[key as keyof Booking])
},30000)
beforeEach(async()=>{
 vi.clearAllMocks()
 for(const table of ['bookings','outbox','admin_links','admin_sessions','blocks','hours'])await env.DB.prepare('DELETE FROM '+table).run()
 await env.DB.prepare('UPDATE settings SET accepting=1').run();await env.DB.prepare("UPDATE products SET price_cents=CASE WHEN id='massage40' THEN 4000 ELSE 6000 END").run()
 for(let day=0;day<7;day++)await env.DB.prepare('INSERT INTO hours VALUES(?,600,1200)').bind(day).run()
 const tomorrow=datePlus(localDate(Math.floor(Date.now()/1000)),1);start=dayInstants(tomorrow).find(x=>localLabel(x.epoch)==='10:00')!.epoch
})
afterAll(async()=>{await mf.dispose()})
describe('D1 bookings and notifications',()=>{
 it('preserves existing reservations across the capacity-removal migration',()=>expect(migrationPreserved).toBe(true))
 it('sends through Resend with stable idempotency and persists the provider ID',async()=>{
  await createBooking(env,input());const notice=(await env.DB.prepare('SELECT id FROM outbox LIMIT 1').first<{id:string}>())!
  const mail={DB:env.DB,EMAIL_FROM:env.EMAIL_FROM,ADMIN_EMAIL:env.ADMIN_EMAIL,RESEND_API_KEY:'re_test'} as Parameters<typeof deliver>[0]
  const request=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify({id:'resend_test'}),{status:200}))
  try{await deliver(mail,notice.id);await deliver(mail,notice.id);expect(request).toHaveBeenCalledTimes(1)
   const [url,init]=request.mock.calls[0]!;expect(url).toBe('https://api.resend.com/emails');expect((init!.headers as Record<string,string>)['Idempotency-Key']).toBe('aurora/'+notice.id)
   expect(JSON.parse(init!.body as string).reply_to).toBe(env.ADMIN_EMAIL)
   expect(await env.DB.prepare('SELECT provider_id FROM outbox WHERE id=?').bind(notice.id).first()).toEqual({provider_id:'resend_test'})
  }finally{request.mockRestore()}
 })
 it('keeps Resend failures pending without exposing provider responses',async()=>{
  const mail={EMAIL_FROM:env.EMAIL_FROM,ADMIN_EMAIL:env.ADMIN_EMAIL,RESEND_API_KEY:'re_test'} as Parameters<typeof deliver>[0]
  const request=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('private provider details',{status:429}))
  try{await expect(sendResend(mail,{from:env.EMAIL_FROM,to:'client@example.com',subject:'Test',text:'Test',html:'Test'},'notice')).rejects.toThrow('EMAIL_SEND_FAILED')}finally{request.mockRestore()}
 })
 it('makes one group reservation with snapshots and two persisted notices',async()=>{
  const b=await createBooking(env,input({massage40:1,massage60:1}))
  expect(b.quantity).toBe(2);expect(b.end_at-b.start_at).toBe(100*60);expect(b.amount_cents).toBe(10000)
  expect((await env.DB.prepare('SELECT * FROM outbox').all()).results).toHaveLength(2)
  expect((await env.DB.prepare('SELECT body FROM outbox LIMIT 1').first<{body:string}>())!.body).toContain(String.fromCharCode(10))
  await env.DB.prepare('UPDATE products SET price_cents=9000').run();expect((await row(b.id)).amount_cents).toBe(10000)
 })
 it('allows simultaneous non-overlapping reservations above three daily massages',async()=>{
  const r=await Promise.allSettled([createBooking(env,input({massage40:0,massage60:2})),createBooking(env,input({massage40:0,massage60:2},start+4*3600))])
  expect(r.filter(x=>x.status==='fulfilled')).toHaveLength(2);expect((await env.DB.prepare('SELECT SUM(quantity) as n FROM bookings').first<{n:number}>())!.n).toBe(4)
 })
 it('books more than three consecutive massages in one session',async()=>{const b=await createBooking(env,input({massage40:2,massage60:2}));expect(b.quantity).toBe(4);expect(b.end_at-b.start_at).toBe(200*60)})
 it('rejects simultaneous overlapping sessions',async()=>{const r=await Promise.allSettled([createBooking(env,input()),createBooking(env,input())]);expect(r.filter(x=>x.status==='fulfilled')).toHaveLength(1)})
 it('deduplicates a retried booking request and its notices',async()=>{const body=input();const a=await createBooking(env,body),b=await createBooking(env,body);expect(a.id).toBe(b.id);expect((await env.DB.prepare('SELECT * FROM outbox').all()).results).toHaveLength(2)})
 it('protects occupied periods against new blocks',async()=>{await createBooking(env,input());await expect(env.DB.prepare('INSERT INTO blocks VALUES(?,?,?,?)').bind('block',start,start+3600,'Test').run()).rejects.toThrow('BOOKING_IN_BLOCK')})
 it('keeps completed session times occupied and releases cancelled times',async()=>{const b=await createBooking(env,input({massage40:0,massage60:3}));await env.DB.prepare("UPDATE bookings SET status='completed' WHERE id=?").bind(b.id).run();expect((await available(env,b.service_date,{massage40:1,massage60:0})).slots.find(s=>s.startAt===start)?.available).toBe(false);await env.DB.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").bind(b.id).run();expect((await available(env,b.service_date,{massage40:1,massage60:0})).slots.find(s=>s.startAt===start)?.available).toBe(true)})
 it('retries email failures without cancelling bookings and acknowledges duplicates',async()=>{
  const b=await createBooking(env,input()),notice=(await env.DB.prepare('SELECT id FROM outbox LIMIT 1').first<{id:string}>())!
  const mail={DB:env.DB,EMAIL_FROM:env.EMAIL_FROM,RESEND_API_KEY:'re_test'} as unknown as Parameters<typeof deliver>[0]
  emailSend.mockRejectedValueOnce(new Error('temporary'));await expect(deliver(mail,notice.id,emailSend)).rejects.toThrow();expect((await row(b.id)).status).toBe('confirmed')
  await env.DB.prepare('UPDATE outbox SET lease_until=0').run();emailSend.mockResolvedValueOnce({messageId:'sent'});await deliver(mail,notice.id,emailSend);await deliver(mail,notice.id,emailSend);expect(emailSend).toHaveBeenCalledTimes(2)
 })
})
describe('admin validation and access',()=>{
 it('allows saving hours with undefined prices while bookings remain closed',async()=>{
  const c=await saveSettings(env,{accepting:false,products:[{id:'massage40',price_cents:null},{id:'massage60',price_cents:null}],hours:[{weekday:1,open_minute:540,close_minute:1260}]});expect(c.accepting).toBe(false);expect(c.products.every(p=>p.price_cents===null)).toBe(true)
 })
 it('does not open bookings without both product prices',async()=>{
  await expect(saveSettings(env,{accepting:true,products:[{id:'massage40',price_cents:null},{id:'massage60',price_cents:6000}],hours:[{weekday:1,open_minute:540,close_minute:1260}]})).rejects.toThrow()
 })
 it('rejects overlapping weekly hours',async()=>{await expect(saveSettings(env,{accepting:true,products:[{id:'massage40',price_cents:4000},{id:'massage60',price_cents:6000}],hours:[{weekday:1,open_minute:600,close_minute:900},{weekday:1,open_minute:800,close_minute:1000}]})).rejects.toThrow()})
 it('requires an authenticated admin session',async()=>{await expect(requireAdmin({node:{req:{headers:{}}}} as never,env)).rejects.toThrow()})
 it('does not accept an expired login link',async()=>{const value='a'.repeat(64);await env.DB.prepare('INSERT INTO admin_links VALUES(?,?,NULL)').bind(await hash(value),1).run();await expect(consumeLink({} as never,env,value)).rejects.toThrow()})
})


describe('Turnstile before web bookings',()=>{
 const token='fresh-token'
 const portal=()=>new Response(JSON.stringify({id:'07.05.G05_050190111614',type:'portal',noNumber:false,muniCode:'05019',poblacion:'Ávila',tip_via:'CALLE',address:'SAN SEGUNDO',portalNumber:2,lat:40.6547,lng:-4.6968}))
 const response=(success=true,hostname=new URL(env.SITE_URL).hostname,action='booking_create')=>new Response(JSON.stringify({success,hostname,action}))
 it('creates a reservation only after Siteverify succeeds',async()=>{
  const request=vi.spyOn(globalThis,'fetch').mockImplementation(async url=>String(url).includes('siteverify')?response():portal())
  try{const b=await createWebBooking({...env,TURNSTILE_SECRET_KEY:'secret-test'},{...input(),turnstileToken:token},'127.0.0.1');expect(b.status).toBe('confirmed');expect(b.address).toBe('CALLE SAN SEGUNDO 2, 1A, Ávila capital');expect((await env.DB.prepare('SELECT * FROM outbox').all()).results).toHaveLength(2);expect(request.mock.calls[0]![0]).toContain('/siteverify');expect(JSON.parse(request.mock.calls[0]![1]!.body as string)).toMatchObject({response:token,remoteip:'127.0.0.1'})}finally{request.mockRestore()}
 })
 it.each(['missing','invalid','expired','replayed','wrong-host','wrong-action','unavailable','malformed','timeout'])('rejects %s without creating a booking or notices',async scenario=>{
  const request=vi.spyOn(globalThis,'fetch')
  if(scenario==='timeout')request.mockRejectedValue(new DOMException('Timeout','TimeoutError'))
  else if(scenario==='unavailable')request.mockResolvedValue(new Response('',{status:503}))
  else if(scenario==='malformed')request.mockResolvedValue(new Response('not-json'))
  else request.mockResolvedValue(response(!['invalid','expired','replayed'].includes(scenario),scenario==='wrong-host'?'other.example':new URL(env.SITE_URL).hostname,scenario==='wrong-action'?'contact':'booking_create'))
  try{await expect(createWebBooking({...env,TURNSTILE_SECRET_KEY:'secret-test'},{...input(),turnstileToken:scenario==='missing'?undefined:token})).rejects.toThrow();expect((await env.DB.prepare('SELECT * FROM bookings').all()).results).toHaveLength(0);expect((await env.DB.prepare('SELECT * FROM outbox').all()).results).toHaveLength(0);expect(queueSend).not.toHaveBeenCalled()}finally{request.mockRestore()}
 })
 it('validates contact data before consuming a token',async()=>{const request=vi.spyOn(globalThis,'fetch');try{await expect(createWebBooking({...env,TURNSTILE_SECRET_KEY:'secret-test'},{...input(),email:'invalid',turnstileToken:token})).rejects.toThrow();expect(request).not.toHaveBeenCalled()}finally{request.mockRestore()}})
 it('keeps booking idempotency when a retry has a fresh token',async()=>{const request=vi.spyOn(globalThis,'fetch').mockImplementation(async url=>String(url).includes('siteverify')?response():portal());try{const body={...input(),turnstileToken:token},first=await createWebBooking({...env,TURNSTILE_SECRET_KEY:'secret-test'},body),second=await createWebBooking({...env,TURNSTILE_SECRET_KEY:'secret-test'},{...body,turnstileToken:'new-token'});expect(second.id).toBe(first.id);expect((await env.DB.prepare('SELECT * FROM bookings').all()).results).toHaveLength(1);expect((await env.DB.prepare('SELECT * FROM outbox').all()).results).toHaveLength(2)}finally{request.mockRestore()}})
})

describe('admin rescheduling',()=>{
 it('preserves duration, prices, private link and payment, with an email for each move',async()=>{
  const b=await createBooking(env,input({massage40:2,massage60:0}))
  await rescheduleBooking(env,b.id,start+86400,b.start_at)
  const changed=await row(b.id)
  expect(changed).toMatchObject({start_at:start+86400,end_at:start+86400+4800,service_date:localDate(start+86400),amount_cents:b.amount_cents,lines_json:b.lines_json,manage_url:b.manage_url,payment_status:b.payment_status})
  await rescheduleBooking(env,b.id,start+90000,changed.start_at)
  const notices=(await env.DB.prepare("SELECT * FROM outbox WHERE subject LIKE 'Reserva reprogramada%'").all<{recipient:string;body:string}>()).results
  expect(notices).toHaveLength(4)
  expect(notices.filter(n=>n.recipient===b.email)).toHaveLength(2)
  expect(notices[0]!.body).toContain(localDate(start+86400))
  expect(notices[0]!.body).toContain('10:00–11:20')
 })
 it('rejects occupied slots and the travel buffer without changing the booking or sending email',async()=>{
  const b=await createBooking(env,input()),other=await createBooking(env,input({massage40:0,massage60:1},start+86400))
  for(const target of [other.start_at,other.end_at+600])await expect(rescheduleBooking(env,b.id,target,b.start_at)).rejects.toThrow()
  expect((await row(b.id)).start_at).toBe(start)
  expect((await env.DB.prepare('SELECT * FROM outbox').all()).results).toHaveLength(4)
 })
 it('rejects blocks, outside hours, past times, horizon and stale edits',async()=>{
  const b=await createBooking(env,input())
  await env.DB.prepare('INSERT INTO blocks VALUES(?,?,?,?)').bind('blocked',start+86400,start+90000,'No disponible').run()
  for(const target of [start+86400,start+12*3600,1,start+40*86400])await expect(rescheduleBooking(env,b.id,target,b.start_at)).rejects.toThrow()
  await expect(rescheduleBooking(env,b.id,start+2*86400,b.start_at+600)).rejects.toThrow()
  expect((await env.DB.prepare('SELECT * FROM outbox').all()).results).toHaveLength(2)
 })
 it('rejects cancelled/completed sessions and makes identical moves a no-op',async()=>{
  const b=await createBooking(env,input())
  await rescheduleBooking(env,b.id,b.start_at,b.start_at)
  expect((await env.DB.prepare('SELECT * FROM outbox').all()).results).toHaveLength(2)
  await updateBooking(env,b.id,'cancel')
  await expect(rescheduleBooking(env,b.id,start+86400,b.start_at)).rejects.toThrow()
 })
 it('allows only one of two simultaneous moves from the same original time',async()=>{
  const b=await createBooking(env,input())
  const moves=await Promise.allSettled([rescheduleBooking(env,b.id,start+86400,b.start_at),rescheduleBooking(env,b.id,start+2*86400,b.start_at)])
  expect(moves.filter(r=>r.status==='fulfilled')).toHaveLength(1)
  expect((await env.DB.prepare("SELECT * FROM outbox WHERE subject LIKE 'Reserva reprogramada%'").all()).results).toHaveLength(2)
 })
})

describe('cash-only reservations',()=>{
 it('rejects other payment methods',async()=>{await expect(createBooking(env,{...input(),method:'online'})).rejects.toThrow();expect((await env.DB.prepare('SELECT * FROM bookings').all()).results).toHaveLength(0)})
 it('confirms immediately with pending cash payment and records collection once',async()=>{const b=await createBooking(env,input());expect(b.status).toBe('confirmed');expect(b.payment_status).toBe('pending');await updateBooking(env,b.id,'cash-paid');const paid=await row(b.id);expect(paid.payment_status).toBe('paid');expect(paid.paid_at).toBeGreaterThan(0);await updateBooking(env,b.id,'cash-paid');expect((await row(b.id)).paid_at).toBe(paid.paid_at)})
 it('has no checkout fields or payment event table after migration',async()=>{const columns=(await env.DB.prepare('PRAGMA table_info(bookings)').all<{name:string}>()).results.map(c=>c.name);expect(columns).not.toContain('checkout_url');expect(await env.DB.prepare("SELECT name FROM sqlite_master WHERE name='stripe_events'").first()).toBeNull()})
})

describe('address gate prevents writes',()=>{
 it('does not create a booking or emails for another locality after valid Turnstile',async()=>{const mock=vi.spyOn(globalThis,'fetch').mockImplementation(async url=>new Response(JSON.stringify(String(url).includes('siteverify')?{success:true,hostname:new URL(env.SITE_URL).hostname,action:'booking_create'}:{id:'07.05.G05_050190111614',portalNumber:2,type:'portal',noNumber:false,muniCode:'05019',poblacion:'Vicolozano',address:'Calle Mayor',lat:40.7,lng:-4.6})));try{await expect(createWebBooking({...env,TURNSTILE_SECRET_KEY:'secret-test'},{...input(),turnstileToken:'fresh-token'})).rejects.toThrow();expect((await env.DB.prepare('SELECT * FROM bookings').all()).results).toHaveLength(0);expect((await env.DB.prepare('SELECT * FROM outbox').all()).results).toHaveLength(0)}finally{mock.mockRestore()}})
})
