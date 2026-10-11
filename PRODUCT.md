# Masajes Aurora

Spanish website for at-home wellbeing massages exclusively in Ávila capital. Melba remains the professional, with more than ten years of experience. Contact: +34 644 798 063. Preserve existing imagery as illustrative, not verified portraits, and do not make medical claims.

## Booking rules

Guests book without accounts. A booking is one visit to one address, with one contact and one joint payment. Combine quantities of 40- and 60-minute massages, maximum three massages per day including confirmed/completed sessions and payment holds. Durations and prices sum without group discounts. Masajes Aurora has no additional facial product in v1.

Starts are offered every ten minutes within configured weekly hours; the whole visit must fit. Leave thirty minutes between visits, with no break between massages in a visit. Confirm at least three hours ahead, use Europe/Madrid, and offer thirty days ahead. Public availability never reveals customer information.

Cash bookings confirm immediately with payment pending. Online bookings hold capacity until payment confirmation, a maximum of thirty minutes and no later than the three-hour cutoff. Verify Stripe webhooks, close unpaid checkouts before releasing holds, and refund invalid late payments. Store immutable product and price snapshots.

Customers and Melba receive transactional emails. A failed email does not cancel a booking. Customers view their booking through a private token link. Changes/cancellations go through Melba; ordinary refunds are handled in Stripe.

## Operations

Nuxt + Workers, D1, Stripe Checkout and a separate Queue/email Worker using Resend. Melba signs in through a single-use email link and configures prices, hours, blocks, WhatsApp bookings, cancellations, completed sessions and cash collections. Staging accepts cash bookings only, with prices of €40 for 40 minutes and €50 for 60 minutes; Stripe remains disabled. Melba configured initial hours Monday through Sunday, 09:00–21:00, and the authorized email masajesaurora@gmail.com.

Existing .env.local is preserved. Production needs a real origin, authorized admin email, verified sender domain, separate DB/queue and payment credentials if online payment is enabled. Local emails are written to ignored .data/mail.jsonl, never sent to customers.
