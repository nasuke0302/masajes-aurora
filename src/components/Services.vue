<script setup lang="ts">
import ContactButton from './ContactButton.vue'
</script>
<template>
  <section
    id="experience"
    aria-labelledby="experience-title"
    class="grid gap-10 px-[5%] py-16 md:grid-cols-2 md:gap-[10%] lg:py-24"
  >
    <h2
      id="experience-title"
      class="max-w-[15ch] font-display text-[clamp(2rem,4vw,4.5rem)] font-bold leading-[1.08] tracking-[-0.04em]"
    >
      Tú eliges cómo.<br /><span class="text-coral">Yo voy a tu casa.</span>
    </h2>
    <div>
      <p class="text-xl leading-relaxed">
        El masaje se adapta a tus preferencias. Podemos dedicar la sesión a todo el cuerpo o
        centrarnos en zonas como la espalda y los hombros.
      </p>
      <p class="mt-5 text-lg leading-relaxed text-muted">
        Masajes de bienestar para personas de todas las edades. No son tratamientos terapéuticos.
      </p>
      <p class="mt-5 text-lg leading-relaxed text-muted">
        Disponible los siete días de la semana, siempre con reserva previa. Acordamos contigo el
        día, la hora y los detalles de la sesión.
      </p>
      <ContactButton class="mt-7" />
    </div>
  </section>
</template>
