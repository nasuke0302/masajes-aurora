---
name: Masajes Aurora — A tu ritmo
description: Approved fluid identity for wellbeing massage in Ávila.
colors:
  cream: '#fafdfc'
  ink: '#064f58'
  sage: '#08767b'
  sage-light: '#edf8f5'
  muted: '#386369'
  coral: '#c95349'
typography:
  display:
    fontFamily: 'Urbanist, sans-serif'
    fontWeight: 800
    lineHeight: 1.03
  body:
    fontFamily: 'Urbanist, sans-serif'
    fontSize: '16px'
    lineHeight: 1.625
---

## Overview

User approved the A tu ritmo mockup, replacing the previous cream/olive identity. Source: .impeccable/mocks/redesign/fluid.png. Coral is deepened in live text for contrast.

## Colors

Deep teal text and actions, near-white ground, pale mint supporting fields, coral accents. Legacy Tailwind token names remain compatible with existing components; their values now belong to this identity.

## Typography

Urbanist, geometric and approachable. Bold compact headings, readable regular body text. No italic serif headings. The same typefaces are served locally through @fontsource/urbanist rather than Google Fonts; the public OFL license is available at /urbanist-license.txt.

## Layout

Desktop: broad hero with semantic text above a generated text-free image and marbled pigment ribbon; open two-column session details below. Narrow screens: normal-flow text then image, service columns stack, compact header navigation. Content capped at 1800px.

Hero and contact actions share a 12px gap and align in a row when space permits. Below 576px, each pair stacks with equal-width buttons in a group capped at 320px; the telephone link remains left-aligned.

The private agenda uses Vue Cal 4.10.2 and opens to a Monday–Sunday week time grid, with a month option and the selected reservation in a right-hand panel on desktop. Years, year and day views are disabled. Below 1100px, the calendar scrolls horizontally and reservation details open in a native dialog; on phones the dialog sits at the bottom of the viewport. The calendar keeps the incumbent teal, mint and coral palette.

## Elevation & Depth

Photography and the pigment ribbon provide depth. Supporting sections remain flat.

## Shapes

Pill contact controls; circular service pictograms; softly rounded cream-information strip.

## Components

All page headers share the Aurora wordmark, coral underline, vertical divider and “Masajes a domicilio en Ávila capital” descriptor through BrandLogo. The descriptor remains visible on mobile with a smaller scale; the logo links home. Header anchors to sessions, Melba and contact. WhatsApp opens a prefilled enquiry in a new tab. Telephone links dial +34 644 798 063. Session details show 60 and 40 minutes. The booking flow combines quantities in one visit with one joint payment; its summary sits beside the form on desktop and below it on mobile. Date and start time stack at full width below 640px and sit side by side on larger screens. The native start-time dropdown stays visible and is disabled while loading or when no starts are available; it contains available starts and session end times; fully unavailable days show a recovery message. Changing the date or massage quantities clears the selected start and refreshes available options. The private agenda uses native form controls, 16px fields, visible focus and the incumbent palette.

Public landing buttons use a reusable pill treatment with 14px text and a minimum 44px height. Reservation is filled teal; WhatsApp is outlined on the near-white ground with a 20px icon. Telephone links use 16px text and an 18px icon, hero trust statements use 14px text, and the contact email-confirmation line uses 12px text with the spelling Recibirás.

Agenda navigation uses previous/next arrows, a date range, a Semana/Mes switch and Nueva reserva. Each booking occupies one event showing time, client and grouped durations. Week headings show booked massage counts without a capacity denominator; outside-hours and blocked periods are background events, with a 30-minute buffer after each visit. Month cells show Jornada or Fuera de jornada and applicable block counts. Mint selection supports scanning. Double-clicking a calendar cell opens the existing admin booking form with date and start prefilled; the reservation is saved only after completing the form. Future confirmed visits can be dragged in week view or reprogrammed through a native date/time field in the selected details, providing a touch and keyboard route. Selected details include address, telephone and a mailto client email, plus applicable cash collection, completion and cancellation actions. Settings, blocked periods, email retries and WhatsApp booking entry remain accessible in the header navigation.

The main navigation does not repeat the reservations list. A quiet Historial de reservas link below the agenda opens native date and status filters, including cancelled records. The return action restores the selected weekly or monthly calendar range. History filters and controls wrap within the phone viewport.

LegalPage reuses the narrow page shell, BrandLogo and return link for the four public legal pages. Long text stays within 70 characters per line with generous line height, clear section headings and underlined links; long contact details wrap. LegalLinks is a wrapping footer navigation with underlined links and minimum 44px targets, shared by the home, booking and private confirmation pages.

Booking review places labeled, initially unchecked acknowledgment boxes beside the final action, with direct links to conditions and privacy. Early-service request and withdrawal acknowledgment appear only when the appointment falls within 14 days. Admin entry uses wording that records what the client communicated. Confirmation requires these acknowledgments as well as Turnstile on public entry; changing the start clears the early-service acknowledgments. Selected admin reservation details and history expose a reversible open-claim retention button with a pressed state; the details explain when to remove the exception. Moving a visit into the early period uses an explicit native confirmation of the client's request when that acknowledgment is missing.

## Do's and Don'ts

Use actual semantic text and controls, never a flattened mockup. Generated photography is illustrative, not a portrait of Melba. Preserve the non-therapeutic description and agreed neutral-cream wording. Honor reduced motion. The previous custom private admin agenda was checked in local Chrome at 1440×1000 and 390×844; its finish reviewer returned ship. That review does not cover the Vue Cal replacement: current screenshots and browser interaction verification remain pending because the available browser inventory was empty. Source review returned ship scoped to its three resolved source fixes. Empty-history captures were also checked at those sizes for filters, return navigation and mobile fit, with reviewer disposition ship; populated records and transient states were outside that review. The public hero/contact CTA refinement was checked in local Chrome captures at 1440px and 390px widths; measurements at 1440px, 768px and 390px confirmed 14px button text, 44px height and no horizontal overflow. The finish reviewer returned ship for these four hero/contact captures, scoped to the CTA refinement; hover/focus captures and a full public landing visual audit remain pending.

The native start-time dropdown was checked in local 1440px and 390px booking captures using four 60-minute massages, the real staging catalog and an empty-agenda fixture calculated by the shared availability logic. No reservations were submitted; the finish reviewer returned ship with no material fixes, scoped to these dropdown captures. The deployed refinement was then checked in live staging Chrome captures at 1440px and 390px without fixtures: four 60-minute massages, available-start dropdown and matching summary, no remaining-capacity field, horizontal overflow or page errors. No bookings or emails were submitted; this verification remains scoped to the booking refinement.

Hosted staging uses the shared Geonuvia Cloudflare Access OTP screen for both web and admin; /admin/acceso forwards to the agenda after Access authentication. Local development retains its existing email-link screen.

Public reservation review shows a flexible Managed Turnstile widget (full container width when at least 300px is available; compact fallback below that width) beside the final confirmation action. Confirmation is disabled until verified; expiry and errors clear verification, with a retry action and preserved booking details. Admin entry remains Access-only.

Reservations accept cash only. The review shows a static Pago en efectivo label, with no method selector. Admin history includes confirmed/completed/cancelled records; calendar events include confirmed/completed visits only. Cash status is pending/collected.

Address entry uses a labeled Calle y número combobox with official portal choices, keyboard navigation, loading/error/empty states and CartoCiudad attribution. Typing invalidates the selection. Floor/door is an optional separate field; review includes the selected street/portal and that detail.

Booking labels keep (opcional) inline. Required date/time/contact/address fields show a coral red asterisk with aria-hidden; native required attributes remain. Address suggestions are an absolute dropdown under the input, above other controls, with a bounded scroll area and no layout displacement.

Selected reservation details lead with large date/time and smaller client name underneath. The reservation reference is small and aligned top right. No Reserva seleccionada heading or separate payment-method row; pending collection is labeled Pendiente de cobro.

Selected reservation details omit the manual date/time reschedule form. Weekly event drag on desktop uses the calendar event wrapper with keyboard-accessible inner content; event permissions gate moves while loading and for past/completed reservations.

The legal pages, acknowledgment controls and retention actions have source review only; browser inventory was empty, so responsive visual approval, live interaction checks and a deployed cookie inventory remain pending.
