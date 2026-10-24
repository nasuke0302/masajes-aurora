<script setup lang="ts">
import ContactButton from './ContactButton.vue'
import Image from './atoms/Image.vue'
import Phone from '@primeicons/vue/phone'
import Verified from '@primeicons/vue/verified'
import Sliders from '@primeicons/vue/sliders-h'
import MapMarker from '@primeicons/vue/map-marker'

const artwork = '/images/masaje-cuerpo-completo-hero.png'
const bookingEnabled = !!import.meta.env.AURORA_BOOKING_ENABLED
</script>

<template>
  <section id="home" aria-labelledby="hero-title" class="bg-cream">
    <div class="hero-scene">
      <header class="hero-header"><BrandLogo /></header>
      <div class="hero-copy">
        <h1 id="hero-title" class="hero-title">
          Un masaje a tu ritmo.<br /><span class="text-coral">En tu casa.</span>
        </h1>
        <p class="hero-description">Masajes de bienestar a domicilio, exclusivamente en Ávila capital.</p>
        <div class="landing-actions">
          <NuxtLink v-if="bookingEnabled" to="/reservar" class="landing-button">Reservar una sesión</NuxtLink>
          <ContactButton />
        </div>
        <a href="tel:+34644517187" class="contact-phone mt-3">
          <Phone :size="20" class="block shrink-0" aria-hidden="true" /><span>+34 644 51 71 87</span>
        </a>
      </div>
      <div class="hero-photograph">
        <Image :src="artwork" alt="Masaje de espalda en una camilla a domicilio. La profesional lleva uniforme gris y su rostro queda fuera del encuadre."
          :w="952" :h="528" sizes="(min-width: 1024px) 74vw, 100vw" eager />
      </div>
    </div>
    <ul class="hero-trust" aria-label="Sobre el servicio">
      <li><Verified :size="24" aria-hidden="true" /><span>Más de 20 años de experiencia</span></li>
      <li><Sliders :size="24" aria-hidden="true" /><span>Adaptado a tus preferencias</span></li>
      <li><MapMarker :size="24" aria-hidden="true" /><span>Solo en Ávila capital</span></li>
    </ul>
  </section>
</template>

<style scoped>
.hero-scene { position: relative; isolation: isolate; overflow: hidden; }
.hero-header { position: relative; z-index: 2; padding: 24px 5%; }
.hero-copy { position: relative; z-index: 2; padding: 32px 5% 36px; }
.hero-title { font-size: clamp(2.75rem, 6vw, 6rem); font-weight: 800; line-height: 1.04; letter-spacing: -0.04em; }
.hero-description { max-width: 35ch; margin-top: 24px; font-size: 18px; line-height: 1.6; }
.hero-photograph img { display: block; width: 100%; height: auto; }
.hero-trust { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px 40px; padding: 24px 5%; border-top: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent); font-size: 14px; line-height: 1.5; }
.hero-trust li { display: flex; align-items: center; gap: 14px; text-align: center; }
.hero-trust :deep(svg) { display: block; flex-shrink: 0; }
@media (min-width: 1024px) {
  .hero-scene { min-height: clamp(580px, 43vw, 690px); }
  .hero-scene::after { content: ''; position: absolute; z-index: 1; inset: 0; pointer-events: none; background: linear-gradient(90deg, var(--color-cream) 0%, var(--color-cream) 29%, rgb(250 253 252 / 97%) 39%, rgb(250 253 252 / 80%) 48%, transparent 66%); }
  .hero-copy { padding-top: clamp(35px, 4vw, 72px); padding-bottom: 64px; }
  .hero-title { width: max-content; max-width: 95%; font-size: clamp(3.25rem, 5.4vw, 6rem); }
  .hero-description { display: none; }
  .hero-copy .landing-actions { margin-top: 32px; }
  .hero-photograph { position: absolute; z-index: 0; inset: 0 0 0 26%; }
  .hero-photograph img { height: 100%; object-fit: cover; object-position: 56% center; }
  .hero-trust { gap: 0; padding-block: 26px; }
  .hero-trust li { padding-inline: 40px; }
  .hero-trust li + li { border-left: 1px solid color-mix(in srgb, var(--color-coral) 65%, transparent); }
}
@media (max-width: 599px) {
  .hero-header { padding-block: 20px; }
  .hero-copy { padding-top: 20px; }
  .hero-title { max-width: 13ch; font-size: clamp(2.5rem, 9vw, 3.5rem); }
  .hero-trust { flex-direction: column; align-items: flex-start; gap: 10px; }
  .hero-trust li { text-align: left; }
}
</style>
