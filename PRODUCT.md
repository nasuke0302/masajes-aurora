# Masajes Aurora

Spanish website for at-home wellbeing massages exclusively in Ávila capital. Melba remains the professional, with more than ten years of experience. Contact: +34 644 798 063. Preserve existing imagery as illustrative, not verified portraits, and do not make medical claims.

## Booking rules

Guests book without accounts. A booking is one visit to one address, with one contact and one joint payment. Combine quantities of 40- and 60-minute massages, without a daily massage quota; confirmed/completed sessions still occupy their reserved times. Durations and prices sum without group discounts. Masajes Aurora has no additional facial product in v1.

Starts are offered every ten minutes within configured weekly hours; the whole visit must fit. Leave thirty minutes between visits, with no break between massages in a visit. Confirm at least three hours ahead, use Europe/Madrid, and offer thirty days ahead. Public availability never reveals customer information.

All bookings confirm immediately with cash payment pending. Record cash collection from the admin panel. Store immutable product and price snapshots.

Customers and Melba receive transactional emails. A failed email does not cancel a booking. Customers view their booking through a private token link. Changes/cancellations go through Melba.

Melba can reprogram a future confirmed visit by dragging its event in the weekly agenda or using the date/time field in its details. The server preserves the visit duration, product and price snapshots, payment state and private link, and validates the three-hour lead time, thirty-day horizon, configured hours, blocks and separation from other visits. Each successful move atomically stores the new schedule and email outbox notifications for both the client and Melba, then dispatches them through the existing queue.

## Operations

The private agenda uses Vue Cal 4.10.2, opening in week view with a month option; years, year and day views are disabled. A booking is one event. Week view shows unavailable periods and the thirty-minute buffer after each visit; month view shows working hours and block counts. Double-clicking a cell opens the existing admin booking form with its date and start prefilled, without saving until the form is completed.

Nuxt + Workers, D1 and a separate Queue/email Worker using Resend. Melba signs in through a single-use email link and configures prices, hours, blocks, WhatsApp bookings, cancellations, completed sessions and cash collections. Staging accepts cash bookings only, with prices of €40 for 40 minutes and €50 for 60 minutes. Melba configured initial hours Monday through Sunday, 09:00–21:00, and the authorized email masajesaurora@gmail.com.

Existing .env.local is preserved. Production needs a real origin, authorized admin email, verified sender domain, separate DB/queue. Local emails are written to ignored .data/mail.jsonl, never sent to customers.

Staging web and admin share Cloudflare Access OTP for albertoesquivelanias@gmail.com, matching Geonuvia. Booking notifications still go to Melba at masajesaurora@gmail.com. Hosted admin uses the signed Access identity; local development retains the link flow.

New bookings require selecting a CartoCiudad portal in municipality 05019 and population Ávila. The server rechecks the identifier and portal before storing canonical address text. Floor/door is optional and separate. Other localities in the municipality are excluded; unknown addresses require contacting Melba. Geoapify is not used.
