export const TIME_ZONE = 'Europe/Madrid'
export const DAILY_CAPACITY = 3
export const BUFFER_MINUTES = 30
export const LEAD_SECONDS = 3 * 3600
export const HORIZON_DAYS = 30
export type Quantities = { massage40: number; massage60: number }
export type Product = { id: 'massage40' | 'massage60'; name: string; minutes: number; price_cents: number | null }
export type Hours = { weekday: number; open_minute: number; close_minute: number }
export type Occupancy = { start_at: number; end_at: number; quantity: number }
export type Slot = { startAt: number; endAt: number; label: string; available: boolean }
const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
const timeFormat = new Intl.DateTimeFormat('es-ES', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
export const money = (cents: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100)
export function localDate(epoch: number) {
  const p = dateFormat.formatToParts(epoch * 1000)
  return ['year', 'month', 'day'].map(k => p.find(x => x.type === k)!.value).join('-')
}
export function localLabel(epoch: number) { return timeFormat.format(epoch * 1000) }
export function datePlus(date: string, days: number) { const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10) }
// Enumerating real instants also handles missing and repeated local times during DST.
export function dayInstants(date: string) {
  const center = Date.parse(date + 'T12:00:00Z') / 1000
  if (!Number.isFinite(center) || localDate(center) !== date) throw new Error('Fecha inválida')
  const result: { epoch: number; minute: number }[] = []
  for (let epoch = center - 18 * 3600; epoch < center + 18 * 3600; epoch += 600) {
    if (localDate(epoch) !== date) continue
    const [h, m] = localLabel(epoch).split(':').map(Number)
    result.push({ epoch, minute: h! * 60 + m! })
  }
  return result
}
export function totals(q: Quantities, products: Product[]) {
  if (![q.massage40, q.massage60].every(n => Number.isInteger(n) && n >= 0) || q.massage40 + q.massage60 < 1 || q.massage40 + q.massage60 > DAILY_CAPACITY) throw new Error('Elige entre uno y tres masajes')
  let duration = 0, amount = 0
  for (const product of products) {
    const count = q[product.id]
    if (!count) continue
    if (product.price_cents === null || product.price_cents <= 0) throw new Error('Las tarifas aún no están configuradas')
    duration += product.minutes * count; amount += product.price_cents * count
  }
  if (products.length !== 2) throw new Error('Productos no configurados')
  return { duration, amount, quantity: q.massage40 + q.massage60 }
}
export function availability(date: string, q: Quantities, products: Product[], hours: Hours[], bookings: Occupancy[], blocks: { start_at: number; end_at: number }[], now: number) {
  const total = totals(q, products)
  const remaining = Math.max(0, DAILY_CAPACITY - bookings.reduce((sum, b) => sum + b.quantity, 0))
  const weekday = new Date(date + 'T12:00:00Z').getUTCDay()
  const windows = hours.filter(h => h.weekday === weekday)
  const inHorizon = date >= localDate(now) && date <= datePlus(localDate(now), HORIZON_DAYS)
  const slots: Slot[] = []
  const instants = dayInstants(date)
  for (const { epoch, minute } of instants) {
    if (!windows.some(h => minute >= h.open_minute && minute < h.close_minute)) continue
    const end = epoch + total.duration * 60
    const fits = localDate(end - 1) === date && windows.some(h => minute >= h.open_minute && !instants.some(p => p.epoch >= epoch && p.epoch < end && (p.minute < h.open_minute || p.minute >= h.close_minute)))
    const overlap = bookings.some(b => epoch < b.end_at + BUFFER_MINUTES * 60 && end + BUFFER_MINUTES * 60 > b.start_at)
    const blocked = blocks.some(b => epoch < b.end_at && end > b.start_at)
    slots.push({ startAt: epoch, endAt: end, label: localLabel(epoch), available: inHorizon && epoch >= now + LEAD_SECONDS && total.quantity <= remaining && fits && !overlap && !blocked })
  }
  return { slots, remaining, ...total }
}

