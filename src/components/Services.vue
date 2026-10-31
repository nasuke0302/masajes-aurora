<script setup lang="ts">
import ContactButton from './ContactButton.vue'
</script>
<template>
  <section id="experience" aria-labelledby="experience-title" class="landing-columns px-[5%] py-16 lg:py-24">
    <h2 id="experience-title"
      class="max-w-[15ch] font-display text-[clamp(2rem,4vw,4.5rem)] font-bold leading-[1.08] tracking-[-0.04em]">
      Tú eliges cómo.<br /><span class="text-coral">Yo voy a tu casa.</span>
    </h2>
    <div>
      <p class="text-xl leading-relaxed">
        El masaje se adapta a tus preferencias. Podemos dedicar la sesión a todo el cuerpo o
        centrarnos en zonas como la espalda y los hombros.
      </p>
      <p class="mt-5 text-lg leading-relaxed text-muted">
        Masajes de bienestar para todas las personas. No está vinculado a fisioterapia.
      </p>
      <p class="mt-5 text-lg leading-relaxed text-muted">
        De <strong>lunes a sábado, de 11:00 a 19:00</strong>, con flexibilidad horaria y siempre con reserva previa.
        Acordamos contigo el día, la hora y los detalles de la sesión.
      </p>
      <ol class="mt-7 space-y-4 border-l-2 border-coral/40 pl-5 text-base leading-relaxed">
        <li><strong>1. Cuéntame cuándo te viene bien.</strong> Escríbeme por WhatsApp o llama para consultar
          disponibilidad.</li>
        <li><strong>2. Acordamos tu visita.</strong> Confirmamos la sesión, el importe, la dirección y el horario antes
          de la cita.</li>
      </ol>
      <div class="mt-7 space-y-3 text-base leading-relaxed">
        <h3 class="text-xl font-bold">Solo necesitas preparar el espacio</h3>
        <p>Deja libre una zona de aproximadamente <strong>3 × 2 metros</strong>. Yo llevo todo lo necesario para el
          masaje.</p>
      </div>
      <ContactButton class="mt-7" />
      <p class="mt-5 text-base leading-relaxed text-muted">¿Es tu primera sesión? Lee nuestra <NuxtLink
          to="/masaje-relajante-avila" class="text-link">guía de masaje relajante en Ávila</NuxtLink> para saber qué
        esperar de una visita a domicilio.</p>
    </div>
  </section>
</template>
