<script setup lang="ts">
import { marketingFirstSessionPrice, marketingFacialPrice } from '#shared/marketing-offer'

const sessions = [
  {
    duration: '60 min',
    title: 'Cuerpo completo',
    description: 'Una sesión completa de masaje de bienestar, adaptable a tus preferencias.',
    icon: 'waves',
  },
  {
    duration: '10 min extras',
    title: 'Masaje facial',
    description: 'Añade diez minutos de cuidado para tu rostro como complemento a la sesión de cuerpo completo.',
    icon: 'face',
  },
]
</script>
<template>
  <section id="massage" aria-labelledby="massage-title" class="scroll-mt-6 bg-sage-light px-[5%] py-12 lg:py-14">
    <div class="landing-columns">
      <div>
        <h2 id="massage-title"
          class="font-display text-[clamp(2rem,3.5vw,3.8rem)] font-bold leading-[1.08] tracking-[-0.04em]">
          Masajes pensados<br />para <span class="text-coral">tu bienestar.</span>
        </h2>
        <p class="mt-5 max-w-[42ch] text-lg leading-relaxed">
          Sesiones en la comodidad de tu hogar, para que disfrutes de un momento solo para ti, sin
          prisas.
        </p>
        <span class="mt-7 block h-0.5 w-12 bg-coral" aria-hidden="true"></span>
      </div>
      <div class="grid gap-7 sm:grid-cols-2 sm:gap-0">
        <article v-for="(session, index) in sessions" :key="session.duration"
          class="border-ink/15 sm:border-l sm:px-6 sm:first:border-0 sm:first:pl-0 sm:last:pr-0">
          <div class="flex items-center gap-4 sm:block">
            <span class="flex size-16 shrink-0 items-center justify-center rounded-full sm:mb-4"
              :class="index === 1 ? 'bg-[#fbded9]' : 'bg-[#cceae3]'">
              <svg class="size-9" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" aria-hidden="true">
                <template v-if="session.icon === 'face'">
                  <path d="M10 12q4 4 8 0M24 12q4 4 8 0M10 25q11 12 22 0" />
                </template>
                <template v-else>
                  <path d="M4 20q8-7 16 0t16 0" />
                  <path v-if="session.icon === 'waves'" d="M4 13q8-7 16 0t16 0M4 27q8-7 16 0t16 0" />
                </template>
              </svg>
            </span>
            <h3 class="text-xl font-bold leading-snug">
              <span class="block">{{ session.duration }}</span>{{ session.title }}
            </h3>
          </div>
          <p class="mt-3 text-base leading-relaxed text-muted">{{ session.description }}</p>
          <OfferSummary v-if="index === 0" :show-duration="false" />
          <p v-else class="mt-4 font-semibold">Complemento: {{ marketingFacialPrice }}</p>
        </article>
      </div>
    </div>
    <div class="landing-columns mt-6">
      <div class="text-sm leading-relaxed md:col-start-2">
        <p class="mb-4">Impuestos y desplazamiento en Ávila capital incluidos. La primera sesión
          de 60 minutos de cada persona cuesta {{ marketingFirstSessionPrice }}, también si reserváis en grupo. El
          facial
          se cobra aparte.</p>
        <p class="rounded-2xl bg-[#d7eee8] px-6 py-4">
          <strong>Cremas neutras.</strong> Si tienes alergias o sensibilidad a algún producto,
          coméntamelo antes de reservar para revisar los ingredientes contigo.
        </p>
      </div>
    </div>
  </section>
</template>
