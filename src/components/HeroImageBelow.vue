<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ContactButton from './ContactButton.vue'
import Image from './atoms/Image.vue'

const { t } = useI18n()
const accent = 'font-serif font-normal text-sage'
const heroImage = `${import.meta.env.BASE_URL}images/melba-massages-hero.png`
</script>

<template>
  <section
    id="home"
    class="scroll-mt-6 px-[6%] pt-16 pb-12 md:pt-[88px] md:pb-[66px]"
    aria-labelledby="hero-title"
  >
    <h1
      id="hero-title"
      class="mb-9 font-display text-[clamp(24px,7.2vw,42px)] font-normal leading-[1.1] tracking-[-1px] md:mb-[58px] md:text-[clamp(42px,7.2vw,108px)] md:tracking-[-4.5px]"
    >
      {{ t('hero.title') }}<br />{{ t('hero.subtitle') }}
      <em :class="accent">{{ t('hero.accent') }}</em>
    </h1>
    <div class="grid items-end gap-8 md:grid-cols-2 md:gap-10">
      <div class="max-w-[440px]">
        <p class="mb-[26px] text-base leading-[1.8] md:text-[17px]">
          {{ t('hero.description') }}
        </p>
        <ContactButton />
      </div>
    </div>
    <Image
      class="mt-10 aspect-[4/3] w-full object-cover object-center md:mt-14 md:aspect-[1672/941]"
      :src="heroImage"
      :alt="t('hero.alt')"
      :w="1672"
      :h="941"
      sizes="(min-width: 1800px) 1584px, 88vw"
    />
  </section>
</template>
