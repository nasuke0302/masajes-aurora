<script setup lang="ts">
import WhatsApp from '@primeicons/vue/whatsapp';

const bookingEnabled = !!import.meta.env.AURORA_BOOKING_ENABLED
const contactUrl = `https://wa.me/34644517187?${new URLSearchParams({ text: 'Hola. Me gustaría reservar una sesión.' })}`
</script>

<template>
  <a class="landing-button justify-start" :class="{ secondary: bookingEnabled }" :href="contactUrl" target="_blank"
    rel="noopener noreferrer">
    <WhatsApp :size="20" class="block shrink-0" aria-hidden="true" />
    <span>{{ bookingEnabled ? 'Consultar por WhatsApp' : 'Reservar por WhatsApp' }}</span>

    <span class="sr-only">(se abre en una nueva pestaña)</span>
  </a>
</template>
