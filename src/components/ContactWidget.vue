<script setup lang="ts">
import ContactButton from './ContactButton.vue'
import Phone from '@primeicons/vue/phone'
const bookingEnabled=!!import.meta.env.AURORA_BOOKING_ENABLED

</script>

<template>
  <section id="contact" aria-labelledby="contact-title" class="scroll-mt-6 px-[5%] py-16 lg:py-24">
    <div class="landing-columns items-center">
      <div>
        <h2 id="contact-title"
          class="font-display text-[clamp(2rem,4vw,4rem)] font-bold leading-[1.1] tracking-[-0.04em]">
          Tu próximo momento<br /><span class="text-coral">empieza aquí.</span>
        </h2>
        <p class="mt-5 max-w-[45ch] text-lg leading-relaxed text-muted">
          Escríbeme por WhatsApp para consultar disponibilidad y acordar tu cita. Servicio
          exclusivamente en Ávila capital.
        </p>
        <OfferSummary />
      </div>
      <div class="flex flex-col items-start gap-3">
        <a class="contact-phone"
          href="tel:+34644517187">
          <Phone :size="20" class="block shrink-0" aria-hidden="true" /><span>+34 644 51 71 87</span>
        </a>
        <div class="landing-actions contact-actions">
          <NuxtLink v-if="bookingEnabled" to="/reservar" class="landing-button">Reservar una sesión</NuxtLink>
          <ContactButton />
        </div>
        <p v-if="bookingEnabled" class="max-w-[38ch] text-xs leading-relaxed text-muted">Recibirás la confirmación de tu reserva por email.</p>
      </div>
    </div>
  </section>
</template>
