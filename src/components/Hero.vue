<script setup lang="ts">
import ContactButton from './ContactButton.vue'
import Image from './atoms/Image.vue'
import MarbleMotion from './MarbleMotion.vue'
import Phone from '@primeicons/vue/phone'

const artwork = `${import.meta.env.BASE_URL}images/masaje-fluido-hero.png`

const animatedMarble = import.meta.env.VITE_ANIMATED_MARBLE
</script>

<template>
  <section id="home" aria-labelledby="hero-title" class="relative isolate overflow-hidden bg-cream">
    <Image :src="artwork" alt="" :w="1536" :h="685" sizes="100vw" eager
      class="absolute inset-0 -z-10 hidden h-full w-full object-cover object-center lg:block" />
    <MarbleMotion v-if="animatedMarble" :src="artwork" class="absolute inset-0 -z-10 hidden h-full w-full lg:block" />
    <header class="relative flex items-center justify-between gap-6 px-[5%] py-5 lg:py-6">
      <div aria-label="Melba, inicio" class="flex items-center gap-5">
        <span class="font-display text-4xl font-semibold tracking-[-0.04em] lg:text-6xl">Melba<span
            class="block h-1 w-16 rounded-full bg-coral"></span></span>
        <span class="hidden border-l border-ink/30 pl-5 text-sm leading-snug sm:block lg:text-lg">Masajes a
          domicilio<br />en Ávila capital</span>
      </div>
    </header>
    <div class="px-[5%] pt-7 pb-12 lg:min-h-[min(38vw,660px)] lg:pt-5 lg:pb-[6%]">
      <h1 id="hero-title"
        class="max-w-[13ch] font-display text-[clamp(2.75rem,7.1vw,6rem)] font-extrabold leading-[1.03] tracking-[-0.04em] lg:max-w-none lg:text-[clamp(3.5rem,5.8vw,6rem)]">
        Un masaje a tu ritmo.<br /><span class="text-coral">En tu casa.</span>
      </h1>
      <p class="mt-5 max-w-[35ch] text-lg lg:hidden">
        Masajes de bienestar a domicilio, exclusivamente en Ávila capital.
      </p>
      <ul class="mt-7 flex max-w-[780px] flex-wrap gap-x-6 gap-y-3 text-sm leading-relaxed lg:mt-6 lg:text-base">
        <li class="sm:border-r sm:border-coral/60 sm:pr-6">Más de 10 años de experiencia</li>
        <li class="sm:border-r sm:border-coral/60 sm:pr-6">Adaptado a tus preferencias</li>
        <li>Solo en Ávila capital</li>
      </ul>
      <ContactButton class="mt-7 lg:mt-6 lg:px-9 lg:py-5 lg:text-xl" />
      <a href="tel:+34644798063"
        class="mt-3 mx-auto flex min-h-11 w-fit items-center gap-3 text-lg font-semibold lg:ml-7 lg:text-2xl">
        <Phone /> +34 644 798 063
      </a>
    </div>
    <div class="relative lg:hidden">
      <Image :src="artwork" alt="Detalle ilustrativo de un masaje de manos en un entorno doméstico." :w="1536" :h="685"
        sizes="100vw" eager class="block h-[260px] w-full object-cover object-right sm:h-[340px] lg:hidden" />
      <MarbleMotion :src="artwork" position="right" class="absolute inset-0 h-full w-full" />
    </div>
  </section>
</template>
