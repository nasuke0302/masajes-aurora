import { describe, expect, it } from 'vitest'
import { bookingContactSchema } from '../shared/booking-contact'

const valid = { name: 'Ana García', email: 'ana@example.com', phone: '+34 644 798 063', address: 'Calle Mayor 12' }
describe('required booking contact', () => {
 it('accepts a complete contact', () => expect(bookingContactSchema.safeParse(valid).success).toBe(true))
 it.each(['name', 'email', 'phone', 'address'] as const)('rejects missing or blank %s', field => {
  for (const value of ['', '   ']) expect(bookingContactSchema.safeParse({ ...valid, [field]: value }).success).toBe(false)
 })
 it.each([{ email: 'ana@' }, { phone: 'abcdefghi' }, { name: 'A' }, { address: 'Calle' }])('rejects invalid contact %j', change => {
  expect(bookingContactSchema.safeParse({ ...valid, ...change }).success).toBe(false)
 })
})
