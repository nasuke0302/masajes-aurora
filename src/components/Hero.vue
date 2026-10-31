<script setup lang="ts">
import ContactButton from './ContactButton.vue'
import Image from './atoms/Image.vue'
import Phone from '@primeicons/vue/phone'
import Verified from '@primeicons/vue/verified'
import Sliders from '@primeicons/vue/sliders-h'
import MapMarker from '@primeicons/vue/map-marker'

const artwork = '/images/masaje-cuerpo-completo-hero-952.webp'
const artworkSrcset = [480, 768, 952]
  .map(width => `/images/masaje-cuerpo-completo-hero-${width}.webp ${width}w`)
  .join(', ')
const bookingEnabled = !!import.meta.env.AURORA_BOOKING_ENABLED
</script>

<template>
  <section id="home" aria-labelledby="hero-title" class="bg-cream">
    <div class="relative isolate overflow-hidden lg:min-h-[clamp(580px,43vw,690px)]">
      <header class="relative z-[2] px-[5%] py-5 min-[600px]:py-6">
        <BrandLogo />
      </header>
      <div class="relative z-[2] px-[5%] pt-5 pb-9 min-[600px]:pt-8 lg:pt-[clamp(35px,4vw,72px)] lg:pb-16">
        <h1 id="hero-title" class="max-w-[13ch] text-[clamp(2.5rem,9vw,3.5rem)] leading-[1.04] font-extrabold tracking-[-.04em] min-[600px]:max-w-none min-[600px]:text-[clamp(2.75rem,6vw,6rem)] lg:w-max lg:max-w-[95%] lg:text-[clamp(3.25rem,5.4vw,6rem)]">
          Un masaje a tu ritmo.<br /><span class="text-coral">En tu casa.</span>
        </h1>
        <p class="mt-6 max-w-[35ch] text-lg leading-relaxed lg:hidden">Masajes de bienestar a domicilio, exclusivamente en Ávila capital.</p>
        <div class="landing-actions lg:mt-8">
          <NuxtLink v-if="bookingEnabled" to="/reservar" class="landing-button">Reservar una sesión</NuxtLink>
          <ContactButton />
        </div>
        <a href="tel:+34644517187" class="contact-phone mt-3">
          <Phone :size="20" class="block shrink-0" aria-hidden="true" /><span>+34 644 51 71 87</span>
        </a>
      </div>
      <div class="lg:absolute lg:inset-y-0 lg:right-0 lg:left-[26%] lg:z-0">
        <Image :src="artwork" alt="Imagen ilustrativa de un masaje de espalda en una camilla a domicilio."
          :srcset="artworkSrcset" :w="952" :h="528" sizes="(min-width: 1800px) 1332px, (min-width: 1024px) 74vw, 100vw"
          class="block h-auto w-full lg:h-full lg:object-cover lg:object-[56%_center]" eager />
      </div>
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-[1] hidden bg-[linear-gradient(90deg,#fafdfc_0%,#fafdfc_29%,#fafdfcf7_39%,#fafdfccc_48%,transparent_66%)] lg:block"></div>
    </div>
    <ul class="flex flex-col items-start gap-2.5 border-t border-ink/15 px-[5%] py-6 text-sm leading-normal min-[600px]:flex-row min-[600px]:flex-wrap min-[600px]:items-center min-[600px]:justify-center min-[600px]:gap-x-10 min-[600px]:gap-y-4 lg:gap-0 lg:py-[26px]" aria-label="Sobre el servicio">
      <li class="flex items-center gap-3.5 text-left min-[600px]:text-center lg:px-10">
        <Verified :size="24" class="block shrink-0" aria-hidden="true" /><span>Más de 20 años de experiencia</span>
      </li>
      <li class="flex items-center gap-3.5 text-left min-[600px]:text-center lg:border-l lg:border-coral/65 lg:px-10">
        <Sliders :size="24" class="block shrink-0" aria-hidden="true" /><span>Adaptado a tus preferencias</span>
      </li>
      <li class="flex items-center gap-3.5 text-left min-[600px]:text-center lg:border-l lg:border-coral/65 lg:px-10">
        <MapMarker :size="24" class="block shrink-0" aria-hidden="true" /><span>Solo en Ávila capital</span>
      </li>
    </ul>
  </section>
</template>
