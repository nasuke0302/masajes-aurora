---
version: 1
slug: "src-pages-admin-index-vue"
primary_target: "src/pages/admin/index.vue"
related_targets: ["src/components/admin/AdminCalendar.vue","src/components/admin/AdminReservationDetails.vue"]
---

# Admin agenda — direction contract

Mode: Operate. Melba uses mobile and desktop equally to organize the week and inspect visits.

THESIS: A Monday–Sunday time grid makes visits, shared sessions and separation visible, with the selected visit alongside it.
OWN-WORLD: Preserve Aurora's Urbanist, teal text/actions, near-white ground and mint selection. Compact tags, consistent controls and quiet surfaces.
STORY: Scan the week, select a reservation, read contact/address/email and act on payment or completion. Existing settings, blocked periods and email retries remain accessible. A quiet Historial de reservas link below the agenda replaces the Reservas navigation item; date and status filters include cancelled and expired records, and returning restores the selected calendar range.
FIRST VIEWPORT: Header navigation, week arrows/date range, Week/Day selection and New reservation; seven-day calendar left, selected-reservation details right. No Today control or explanatory paragraphs beneath tags. Mobile scrolls the week and opens details in a native dialog. Day headings show a booked massage count without a capacity denominator; availability is constrained by time rather than a daily massage quota.
FORM: Approved timeline direction from seed 83539b0c, revised to weekly. Operate code-led; admin-week.png is the approved compositional critique reference. Calendar geometry is runtime data, not an illustration.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

REVIEW: Ship for the provided local Chrome admin captures at 1440×1000 and 390×844. Weekly navigation, selected details, client email and mobile dialog were checked against the direction contract.
DOCUMENTATION: Admin layout and components merged into the existing DESIGN.md; README.md records navigation/contact behavior and scoped browser evidence. Public landing visual verification remains pending. Existing global tokens and the pre-existing design.json schema drift are preserved.

HISTORY EVIDENCE: history-desktop.png (1440×1000) and history-mobile.png (390×844), local Chrome. Filter behavior, invalid-query HTTP 400, return range and mobile fit checked. History reviewer disposition: ship for these empty-history captures; populated records and transient states were outside this review. No QUALITY BAR card was supplied and no detector ran for this narrow refinement.
