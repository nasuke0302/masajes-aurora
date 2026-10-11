import { z } from 'zod'

export const bookingContactSchema = z.object({
 name: z.string().trim().min(2).max(100),
 email: z.email().max(254).transform(s => s.toLowerCase()),
 phone: z.string().trim().regex(/^\+?[0-9 ()-]{9,20}$/),
 address: z.string().trim().min(8).max(300),
})
