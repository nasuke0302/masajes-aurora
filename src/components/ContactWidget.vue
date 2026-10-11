<script setup lang="ts">
import ContactButton from './ContactButton.vue'
import Phone from '@primeicons/vue/phone'

</script>

<template>
  <section id="contact" aria-labelledby="contact-title" class="scroll-mt-6 px-[5%] py-16 lg:py-24">
    <div class="grid items-center gap-10 md:grid-cols-[1.4fr_1fr] md:gap-[10%]">
      <div>
        <h2 id="contact-title"
          class="font-display text-[clamp(2rem,4vw,4rem)] font-bold leading-[1.1] tracking-[-0.04em]">
          Tu próximo momento<br /><span class="text-coral">empieza aquí.</span>
        </h2>
        <p class="mt-5 max-w-[45ch] text-lg leading-relaxed text-muted">
          Escríbeme por WhatsApp para consultar disponibilidad y acordar tu cita. Servicio
          exclusivamente en Ávila capital.
        </p>
      </div>
      <div class="flex flex-col items-start gap-3">
        <a class="flex gap-2 min-h-11 items-center text-base font-semibold underline-offset-4 hover:underline"
          href="tel:+34644798063">
          <Phone :size="18" /> +34 644 798 063
        </a>
        <div class="landing-actions contact-actions">
          <NuxtLink to="/reservar" class="landing-button">Reservar una sesión</NuxtLink>
          <ContactButton />
        </div>
        <p class="max-w-[38ch] text-xs leading-relaxed text-muted">Recibirás la confirmación de tu reserva por email.</p>
      </div>
    </div>
  </section>
</template>
