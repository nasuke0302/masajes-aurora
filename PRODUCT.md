# Aurora Masajista

Spanish website for at-home wellbeing massages exclusively in Ávila capital. Aurora remains the professional, with more than ten years of experience. Contact: +34 644 51 71 87. Preserve existing imagery as illustrative, not verified portraits, and do not make medical claims.

## Booking rules

The public Spanish guide at `/masaje-relajante-avila` explains the at-home wellbeing service and converts enquiries through WhatsApp, with no automatic booking. It is shared by staging and static production, linked from the homepage services, dated 2026-10-25, and uses the existing illustrative image, typography and palette with an index and a 70ch reading column. Canonical, BlogPosting, BreadcrumbList, both sitemaps and production prerender include the route.

These booking and admin features apply to staging only. Production at auroramasajista.com is an informational static website: WhatsApp booking CTA, no booking/admin routes or APIs, no database, emails, queue, cron, Access or Turnstile. Its public legal pages describe direct contact. Build scripts explicitly select the profile independently of NODE_ENV; preserve the full staging behavior when changing shared components.

The public landing presents a 60-minute full-body massage and a facial massage as an optional 10-minute complement to that session. The staging booking catalog still contains 40- and 60-minute massages; the facial complement is not yet integrated into its booking flow.

Guests book without accounts. A booking is one visit to one address, with one contact and one joint payment. Combine quantities of 40- and 60-minute massages, without a daily massage quota; confirmed/completed sessions still occupy their reserved times. Durations and prices sum without group discounts.

Starts are offered every ten minutes within configured weekly hours; the whole visit must fit. Leave thirty minutes between visits, with no break between massages in a visit. Confirm at least three hours ahead, use Europe/Madrid, and offer thirty days ahead. Public availability never reveals customer information.

All bookings confirm immediately with cash payment pending. Record cash collection from the admin panel. Store immutable product and price snapshots.

Customers and Aurora receive transactional emails. A failed email does not cancel a booking. Customers view their booking through a private token link. Changes/cancellations go through Aurora.

Aurora can reprogram a future confirmed visit by dragging its event in the weekly agenda or using the date/time field in its details. The server preserves the visit duration, product and price snapshots, payment state and private link, and validates the three-hour lead time, thirty-day horizon, configured hours, blocks and separation from other visits. Each successful move atomically stores the new schedule and email outbox notifications for both the client and Aurora, then dispatches them through the existing queue.

## Operations

The private agenda uses Vue Cal 4.10.2, opening in week view with a month option; years, year and day views are disabled. A booking is one event. Week view shows unavailable periods and the thirty-minute buffer after each visit; month view shows working hours and block counts. Double-clicking a cell opens the existing admin booking form with its date and start prefilled, without saving until the form is completed.

Nuxt + Workers, D1 and a separate Queue/email Worker using Resend. Aurora signs in through a single-use email link and configures prices, hours, blocks, WhatsApp bookings, cancellations, completed sessions and cash collections. Staging accepts cash bookings only, with prices of €40 for 40 minutes and €50 for 60 minutes. Aurora configured initial hours Monday through Sunday, 09:00–21:00, and the authorized email masajesaurora@gmail.com.

Existing .env.local is preserved. Production needs a real origin, authorized admin email, verified sender domain, separate DB/queue. Local emails are written to ignored .data/mail.jsonl, never sent to customers.

Staging web and admin share Cloudflare Access OTP for albertoesquivelanias@gmail.com, matching Geonuvia. Booking notifications still go to Aurora at masajesaurora@gmail.com. Hosted admin uses the signed Access identity; local development retains the link flow.

New bookings require selecting a CartoCiudad portal in municipality 05019 and population Ávila. The server rechecks the identifier and portal before storing canonical address text. Floor/door is optional and separate. Other localities in the municipality are excluded; unknown addresses require contacting Aurora. Geoapify is not used.

## Legal and data rules

Public legal identity and contact details are owner-confirmed in shared/legal.ts. Aviso legal, Privacidad, Cookies and Condiciones de reserva are public routes, listed in the sitemap and linked from the home, booking and private confirmation footers. Contractual wording is versioned there and included as durable text in confirmation emails; update the version whenever that wording changes.

Services are exclusively for adults and wellbeing, without medical diagnosis or treatment. Prices are final, tax included, with no travel supplement or other extra charge in Ávila capital. Payment is cash on the service date. Changes and cancellations are free; client absence carries no penalty. Notes are intended for access logistics only, with an explicit instruction not to provide health information, and are omitted from newly generated emails. Invoices and accounting are managed outside the web.

Booking review requires unchecked acknowledgments of the conditions and adulthood of every attendee. Visits starting within 14 days additionally require an express request to start early and acknowledgment that withdrawal is lost only once the service is fully performed. Customers may cancel free before service starts. The server validates the current terms version and acknowledgments before Turnstile or creation. Acceptance version, timestamp and source are stored atomically with the booking: web acceptance or acceptance communicated to Aurora for an admin entry. When moving an existing visit into that early period without a recorded acknowledgment, Aurora must confirm the client's express request and acknowledgment before saving.

Periodic maintenance deletes reservations after 12 calendar months from the appointment date, outbox email contents and delivery records after 30 days, technical rate-limit identifiers after 24 hours without activity, and expired local access links/sessions. An admin retention-hold control preserves a booking and its related outbox records for an open claim; Aurora removes the exception when resolved. Provider infrastructure logs, backups and mailboxes have their own retention and are outside this purge.

Urbanist is self-hosted through @fontsource/urbanist, with its OFL license at public/urbanist-license.txt. The implementation adds no analytics, advertising pixels or commercial personalization. The cookies page describes Access authentication and Turnstile without pre-clearance; a deployed browser cookie inventory remains unverified. Migration 0004 adds legal acceptance and rate-limit activity records; local/preview setup applies it automatically. Migration 0004 was applied and verified in staging on 12 October 2026. The application changes remain in the local checkout pending push/deployment.
