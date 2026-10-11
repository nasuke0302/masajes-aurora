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
      <div class="flex flex-col items-center gap-4 md:items-start">
        <a class="flex gap-3 min-h-11 justify-center items-center text-xl font-semibold underline-offset-4 hover:underline"
          href="tel:+34644798063">
          <Phone /> +34 644 798 063
        </a>
        <ContactButton />
        <p class="text-sm text-muted">La reserva se confirma directamente con Melba.</p>
      </div>
    </div>
  </section>
</template>
