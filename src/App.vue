<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTextReveal } from './composables/useTextReveal'
import Hero from './components/Hero.vue'
import MassageDetails from './components/MassageDetails.vue'
import Services from './components/Services.vue'
import Contact from './components/Contact.vue'
import Footer from './components/Footer.vue'

const page = ref<HTMLElement | null>(null)

useTextReveal(page)

const { t, locale } = useI18n()

watch(
  locale,
  (value) => {
    document.documentElement.lang = value
    document.title = t('meta.title')
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t('meta.description'))
  },
  { immediate: true },
)
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
