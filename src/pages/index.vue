<script setup lang="ts">
import { ref } from 'vue'
import { useTextReveal } from '../composables/useTextReveal'
import Hero from '../components/Hero.vue'
import MassageDetails from '../components/MassageDetails.vue'
import Services from '../components/Services.vue'
import Contact from '../components/Contact.vue'
import Footer from '../components/Footer.vue'

const page = ref<HTMLElement | null>(null)

useTextReveal(page)

const description = 'Dedícate un momento con Aurora Masajista. Masajes a domicilio exclusivamente en Ávila capital. Contacta por WhatsApp para reservar.'

const config = useRuntimeConfig()
useSeoMeta({
  title: 'Aurora Masajista · Masajes a domicilio en Ávila',
  ogTitle: 'Aurora Masajista',
  ogDescription: description,
  ogImage: config.public.siteUrl ? new URL('/images/masaje-cuerpo-completo-hero.png', config.public.siteUrl).href : undefined
})
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Aurora Masajista',
      telephone: '+34644517187',
      areaServed: {
        '@type': 'City',
        name: 'Ávila'
      },
      openingHours: "Mo-Sa 11:00-19:00",
      priceRange: "€€",
      ...(config.public.siteUrl ? { url: config.public.siteUrl } : {}),
      description
    })
  }],
  link: config.public.siteUrl ? [{ rel: 'canonical', href: config.public.siteUrl }] : []
})
</script>

<template>
  <div ref="page" class="mx-auto max-w-[1800px]">
    <a class="absolute -top-24 left-5 z-10 bg-cream p-3 focus:top-3" href="#main">
      Saltar al contenido
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
