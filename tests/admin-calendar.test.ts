import {describe,it,expect} from 'vitest'
import {monday,calendarDates,dayCapacity,agendaRange,clockMinute,type AgendaReservation} from '../shared/admin-calendar'
const base={id:'visit',reference:'AUR-TEST',service_date:'2026-10-13',start_at:Date.parse('2026-10-13T08:00:00Z')/1000,end_at:Date.parse('2026-10-13T10:00:00Z')/1000,quantity:2,amount_cents:1,lines_json:'[]',name:'Demo',email:'demo@example.com',phone:'600000000',address:'Demo',notes:'',method:'cash',status:'confirmed',payment_status:'pending'} satisfies AgendaReservation

describe('Private agenda dates and capacity',()=>{
 it('opens a Sunday in the preceding Monday–Sunday week',()=>{expect(calendarDates('2026-10-11','week')).toEqual(['2026-10-05','2026-10-06','2026-10-07','2026-10-08','2026-10-09','2026-10-10','2026-10-11'])})
 it('crosses year boundaries without dropping days',()=>{expect(monday('2027-01-01')).toBe('2026-12-28');expect(calendarDates('2027-01-01','week').at(-1)).toBe('2027-01-03')})
 it('keeps the seven local dates across both Madrid clock changes',()=>{expect(calendarDates('2026-03-29','week').at(-1)).toBe('2026-03-29');expect(calendarDates('2026-10-25','week').at(-1)).toBe('2026-10-25');expect(calendarDates('2026-10-25','day')).toEqual(['2026-10-25'])})
 it('counts massages from held, confirmed and completed sessions only',()=>{const rows=[base,{...base,id:'hold',quantity:1,status:'held'},{...base,id:'cancel',quantity:3,status:'cancelled'},{...base,id:'expired',quantity:3,status:'expired'},{...base,id:'other',service_date:'2026-10-14',quantity:3}];expect(dayCapacity(rows,'2026-10-13')).toBe(3);expect(dayCapacity([{...base,status:'completed'}],'2026-10-13')).toBe(2)})
 it('uses Madrid wall time instead of the browser timezone',()=>{expect(clockMinute(Date.parse('2026-10-13T08:00:00Z')/1000)).toBe(600);expect(clockMinute(Date.parse('2026-11-13T09:00:00Z')/1000)).toBe(600)})
 it('includes configured early/late work and historic bookings in the grid',()=>{expect(agendaRange([{weekday:1,open_minute:420,close_minute:1380}],[])).toEqual({start:420,end:1380});expect(agendaRange([],[{...base,start_at:Date.parse('2026-10-13T20:00:00Z')/1000,end_at:Date.parse('2026-10-13T21:00:00Z')/1000}])).toEqual({start:540,end:1440})})
})
