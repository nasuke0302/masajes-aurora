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

Urbanist, geometric and approachable. Bold compact headings, readable regular body text. No italic serif headings.

## Layout

Desktop: broad hero with semantic text above a generated text-free image and marbled pigment ribbon; open two-column session details below. Narrow screens: normal-flow text then image, service columns stack, compact header navigation. Content capped at 1800px.

Hero and contact actions share a 12px gap and align in a row when space permits. Below 576px, each pair stacks with equal-width buttons in a group capped at 320px; the telephone link remains left-aligned.

The private agenda opens to a Monday–Sunday time grid with the selected reservation in a right-hand panel on desktop. Below 1100px, the calendar scrolls horizontally and reservation details open in a native dialog; on phones the dialog sits at the bottom of the viewport. Sticky day headings and the time gutter keep the weekly grid legible while scrolling.

## Elevation & Depth

Photography and the pigment ribbon provide depth. Supporting sections remain flat.

## Shapes

Pill contact controls; circular service pictograms; softly rounded cream-information strip.

## Components

All page headers share the Aurora wordmark, coral underline, vertical divider and “Masajes a domicilio en Ávila capital” descriptor through BrandLogo. The descriptor remains visible on mobile with a smaller scale; the logo links home. Header anchors to sessions, Melba and contact. WhatsApp opens a prefilled enquiry in a new tab. Telephone links dial +34 644 798 063. Session details show 60 and 40 minutes. The booking flow combines quantities in one visit with one joint payment; its summary sits beside the form on desktop and below it on mobile. Date and start time sit side by side. The native start-time dropdown stays visible and is disabled while loading or when no starts are available; it contains available starts and session end times; fully unavailable days show a recovery message. Changing the date or massage quantities clears the selected start and refreshes available options. The private agenda uses native form controls, 16px fields, visible focus and the incumbent palette.

Public landing buttons use a reusable pill treatment with 14px text and a minimum 44px height. Reservation is filled teal; WhatsApp is outlined on the near-white ground with a 20px icon. Telephone links use 16px text and an 18px icon, hero trust statements use 14px text, and the contact email-confirmation line uses 12px text with the spelling Recibirás.

Agenda navigation uses previous/next arrows, a date range, a Week/Day switch and New reservation, without a Today button or badge. Each day shows its booked massage count without a capacity denominator; visit cards show time, client and grouped durations, with the 30-minute separation visible below. Mint selection and compact reservation/payment tags support scanning. Selected details include address, telephone and a mailto client email, plus applicable cash collection, completion and cancellation actions. Settings, blocked periods, email retries and WhatsApp booking entry remain accessible in the header navigation.

The main navigation does not repeat the reservations list. A quiet Historial de reservas link below the agenda opens native date and status filters, including cancelled and expired records. The return action restores the selected weekly or daily calendar range. History filters and controls wrap within the phone viewport.

## Do's and Don'ts

Use actual semantic text and controls, never a flattened mockup. Generated photography is illustrative, not a portrait of Melba. Preserve the non-therapeutic description and agreed neutral-cream wording. Honor reduced motion. The private admin agenda was checked in local Chrome at 1440×1000 and 390×844; its finish reviewer returned ship. Empty-history captures were also checked at those sizes for filters, return navigation and mobile fit, with reviewer disposition ship; populated records and transient states were outside that review. The public hero/contact CTA refinement was checked in local Chrome captures at 1440px and 390px widths; measurements at 1440px, 768px and 390px confirmed 14px button text, 44px height and no horizontal overflow. The finish reviewer returned ship for these four hero/contact captures, scoped to the CTA refinement; hover/focus captures and a full public landing visual audit remain pending.

The native start-time dropdown was checked in local 1440px and 390px booking captures using four 60-minute massages, the real staging catalog and an empty-agenda fixture calculated by the shared availability logic. No reservations were submitted; the finish reviewer returned ship with no material fixes, scoped to these dropdown captures. The deployed refinement was then checked in live staging Chrome captures at 1440px and 390px without fixtures: four 60-minute massages, available-start dropdown and matching summary, no remaining-capacity field, horizontal overflow or page errors. No bookings or emails were submitted; this verification remains scoped to the booking refinement.

Hosted staging uses the shared Geonuvia Cloudflare Access OTP screen for both web and admin; /admin/acceso forwards to the agenda after Access authentication. Local development retains its existing email-link screen.

Public reservation review shows a compact Managed Turnstile widget beside the final confirmation action. Confirmation is disabled until verified; expiry and errors clear verification, with a retry action and preserved booking details. Admin entry remains Access-only.
