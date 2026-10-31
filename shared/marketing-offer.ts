// Public offer shared by staging and production. The booking catalog must match it.
export const marketingOffer = {
  durationMinutes: 60,
  priceCents: 5500,
  firstSessionPriceCents: 5000,
  facialMinutes: 10,
  facialPriceCents: 1000,
} as const;

const euros = (cents: number) =>
  `${(cents / 100).toLocaleString("es-ES", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })} €`;

export const marketingPrice = euros(marketingOffer.priceCents);
export const marketingFirstSessionPrice = euros(marketingOffer.firstSessionPriceCents);
export const marketingFacialPrice = euros(marketingOffer.facialPriceCents);
export const marketingCombinedPrice = euros(
  marketingOffer.priceCents + marketingOffer.facialPriceCents,
);
export const marketingFirstCombinedPrice = euros(
  marketingOffer.firstSessionPriceCents + marketingOffer.facialPriceCents,
);
