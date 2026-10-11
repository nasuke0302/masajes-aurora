<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import WhatsApp from '@primeicons/vue/whatsapp';

const { t } = useI18n()
const contactUrl = computed(
  () => `https://wa.me/34644798063?${new URLSearchParams({ text: t('contact.message') })}`,
)
</script>

<template>
  <a class="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-ink px-6 py-3 text-center text-base font-medium lg:px-8 lg:py-4 lg:text-xl text-white transition-[background-color,transform] duration-200 hover:bg-[#08767b] active:translate-y-px motion-reduce:transform-none motion-reduce:transition-none sm:w-auto"
    :href="contactUrl" target="_blank" rel="noopener noreferrer">
    <WhatsApp :size="32" />
    {{ t('contact.button') }}

    <span class="sr-only">{{ t('contact.newTab') }}</span>
  </a>
</template>
