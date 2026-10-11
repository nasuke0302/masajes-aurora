import {describe,it,expect} from 'vitest'
import {availability,totals,dayInstants,localLabel,localDate,datePlus,type Product} from '../shared/booking'
const products:Product[]=[{id:'massage40',name:'40',minutes:40,price_cents:4000},{id:'massage60',name:'60',minutes:60,price_cents:6000}]
const date='2026-10-12',at=(h:string)=>dayInstants(date).find(x=>localLabel(x.epoch)===h)!.epoch
const hours=[{weekday:1,open_minute:600,close_minute:1080}],now=at('06:00')
describe('Madrid availability',()=>{
 it('sums mixed groups and prices',()=>expect(totals({massage40:1,massage60:2},products)).toEqual({duration:160,amount:16000,quantity:3}))
 it('counts massages and reserves 30 minutes between visits',()=>{
  const a=availability(date,{massage40:1,massage60:0},products,hours,[{start_at:at('10:00'),end_at:at('12:00'),quantity:2}],[],now)
  expect(a.remaining).toBe(1);expect(a.slots.find(s=>s.label==='12:20')?.available).toBe(false);expect(a.slots.find(s=>s.label==='12:30')?.available).toBe(true)
  expect(availability(date,{massage40:0,massage60:2},products,hours,[{start_at:at('10:00'),end_at:at('12:00'),quantity:2}],[],now).slots.some(s=>s.available)).toBe(false)
 })
 it('prevents a fourth massage even when its time is free',()=>expect(availability(date,{massage40:1,massage60:0},products,hours,[{start_at:at('10:00'),end_at:at('13:00'),quantity:3}],[],now).slots.some(s=>s.available)).toBe(false))
 it('enforces lead time, closing time and blocks',()=>{
  const a=availability(date,{massage40:0,massage60:2},products,hours,[],[{start_at:at('14:00'),end_at:at('15:00')}],at('08:00'))
  expect(a.slots.find(s=>s.label==='10:50')?.available).toBe(false);expect(a.slots.find(s=>s.label==='11:00')?.available).toBe(true);expect(a.slots.find(s=>s.label==='13:00')?.available).toBe(false);expect(a.slots.find(s=>s.label==='16:10')?.available).toBe(false)
 })
 it('handles DST using real instants',()=>{
  const spring=dayInstants('2026-03-29'),autumn=dayInstants('2026-10-25')
  expect(spring.length).toBe(23*6);expect(autumn.length).toBe(25*6);expect(spring.some(x=>localLabel(x.epoch)==='02:30')).toBe(false);expect(autumn.filter(x=>localLabel(x.epoch)==='02:30').length).toBe(2)
 })
 it('keeps the whole session inside hours during a repeated autumn hour',()=>{
  const d='2026-10-25',n=Date.parse('2026-10-24T12:00:00Z')/1000
  const a=availability(d,{massage40:0,massage60:1},products,[{weekday:0,open_minute:150,close_minute:240}],[],[],n)
  const repeated=a.slots.filter(s=>s.label==='02:40');expect(repeated).toHaveLength(2);expect(repeated[0]!.available).toBe(false);expect(repeated[1]!.available).toBe(true)
 })
 it('rejects invalid quantities and unconfigured tariffs',()=>{
  expect(()=>totals({massage40:2,massage60:2},products)).toThrow();expect(()=>totals({massage40:0,massage60:0},products)).toThrow();expect(()=>totals({massage40:1,massage60:0},[{...products[0]!,price_cents:null},products[1]!])).toThrow()
 })
 it('closes dates beyond the 30 day horizon',()=>{
  const future=datePlus(localDate(now),31)
  expect(availability(future,{massage40:1,massage60:0},products,Array.from({length:7},(_,weekday)=>({weekday,open_minute:600,close_minute:1080})),[],[],now).slots.some(s=>s.available)).toBe(false)
 })
})

