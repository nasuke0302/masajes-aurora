# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Spanish-speaking people in Ávila capital looking for a personalized massage at home. They need to understand the available sessions, get to know Melba, and enquire about availability or arrange a reservation.

## Product Purpose

Present Melba's at-home massage service and help visitors start a WhatsApp conversation. Success means relevant enquiries and advance reservations; clicking the contact button does not itself confirm a booking.

## Positioning

Melba personally travels to clients' homes within Ávila city. She has more than 10 years of professional experience giving massages and adapts sessions to clients' preferences.

## Operating Context

- Service is exclusively within Ávila capital, not the entire province.
- Sessions are available seven days a week by prior reservation. Do not claim 24-hour availability.
- Visitors contact Melba on WhatsApp at +34 644 798 063 to agree on the day, time, and session details.
- The website is Spanish-only and supports desktop and mobile visitors.

## Capabilities and Constraints

- Standard session: a 60-minute full-body massage.
- Optional complement: a 10-minute facial massage.
- Short session: 30 minutes.
- Sessions can be tailored, for example to focus only on the back and shoulders.
- WhatsApp contact opens a new tab using https://wa.me/34644798063. The telephone link uses tel:+34644798063.
- The current site has no booking calendar, checkout, customer account, or enquiry form.
- Existing implementation uses Vue, TypeScript, Vite, Tailwind, and vue-i18n. Retaining vue-i18n does not imply English support.
- Images use Netlify image delivery on public hosts and local assets for local development. Preserve appropriate eager loading for the hero and lazy loading for other images.
- SITE_URL supplies the deployment URL for canonical and sitemap metadata. The final public domain is not confirmed here.
- Open decisions: pricing, specific qualifications, service logistics, and legal policy content have not been confirmed. Do not invent them.

## Brand Commitments

The business is Melba Massage. Spanish copy speaks personally as Melba, with a warm, direct, professional tone. Preserve the emphasis on listening, personal preferences, comfort at home, and time to slow down. Avoid unsupported medical or treatment claims.

## Evidence on Hand

- src/locales/es.json contains the current Spanish service and contact copy.
- The owner supplied the statement that Melba has more than 10 years of professional massage experience; this is not independent verification of a qualification.
- public/images/ contains existing hero assets, including melba-massages-hero-2.png. Their provenance and whether they depict Melba have not been established.
- No verified testimonials, certifications, or clinical outcomes have been supplied for use as proof.

## Product Principles

- Make the Ávila-city-only service area clear before visitors enquire.
- Explain session duration and customization plainly so visitors can choose what to discuss.
- Keep contacting Melba straightforward on desktop and mobile.
- Treat WhatsApp as a conversation leading to an agreed reservation, not instant booking confirmation.
- Build trust through accurate personal and service information, without invented claims.

## Updated brief — 2026-10-01
The owner requests a complete replacement of all prior visual choices, including colors, fonts, composition and imagery. New ambient and massage-detail imagery is approved; do not present generated people as real portraits of Melba.
Services are wellbeing massages, not therapeutic treatment. The audience includes all ages; do not imply universal medical suitability. The owner uses neutral creams and approved this wording: Utilizo cremas neutras. Si tienes alergias o sensibilidad a algún producto, coméntamelo antes de reservar para revisar los ingredientes contigo.
The new landing page prioritizes arranging an appointment through WhatsApp at +34 644 798 063, in Spanish, exclusively for Ávila city.
