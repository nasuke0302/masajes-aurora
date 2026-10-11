<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTextReveal } from '../composables/useTextReveal'
import Hero from '../components/Hero.vue'
import MassageDetails from '../components/MassageDetails.vue'
import Services from '../components/Services.vue'
import Contact from '../components/Contact.vue'
import Footer from '../components/Footer.vue'

const page = ref<HTMLElement | null>(null)

useTextReveal(page)

const { t, locale } = useI18n()

const config = useRuntimeConfig()
useSeoMeta({ title: 'Masajes Aurora · Masajes a domicilio en Ávila', ogTitle: 'Masajes Aurora', ogDescription: t('meta.description'), ogImage: config.public.siteUrl ? new URL('/images/masaje-fluido-hero.png', config.public.siteUrl).href : undefined })
useHead({ script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'Masajes Aurora', telephone: '+34644798063', areaServed: { '@type': 'City', name: 'Ávila' }, ...(config.public.siteUrl ? {url: config.public.siteUrl} : {}), description: t('meta.description') }) }], link: config.public.siteUrl ? [{ rel: 'canonical', href: config.public.siteUrl }] : [] })
</script>

<template>
  <div ref="page" class="mx-auto max-w-[1800px]">
    <a class="absolute -top-24 left-5 z-10 bg-cream p-3 focus:top-3" href="#main">
      {{ t('skip') }}
    </a>
    <main id="main">
      <Hero />
      <MassageDetails />
      <Services />
      <Contact />
    </main>
    <Footer />
  </div>
</template>

