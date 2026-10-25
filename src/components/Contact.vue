<script setup lang="ts">
import ContactWidget from './ContactWidget.vue'
</script>
<template>
  <section id="aurora" aria-labelledby="about-title" class="scroll-mt-6">
    <div class="landing-columns gap-y-8 bg-[#d7eee8] px-[5%] py-16 lg:py-20">
      <h2 id="about-title"
        class="font-display text-[clamp(2.5rem,5vw,5rem)] font-bold leading-[1.08] tracking-[-0.04em]">
        Hola,<br />soy Aurora.
      </h2>
      <div class="max-w-[58ch]">
        <p class="text-2xl font-medium leading-snug">
          Más de 20 años de experiencia, y una forma de trabajar que empieza por escucharte.
        </p>
        <p class="mt-6 text-lg leading-relaxed text-muted">
          Quiero dedicarte un tiempo que encaje en tu día a día. Por eso llevo el masaje a tu
          domicilio. Antes de empezar, hablamos de tus preferencias para que la sesión se adapte a
          ti.
        </p>
      </div>
    </div>
    <ContactWidget />
  </section>
</template>
