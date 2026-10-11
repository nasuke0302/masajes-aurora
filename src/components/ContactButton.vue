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
  <a class="landing-button secondary"
    :href="contactUrl" target="_blank" rel="noopener noreferrer">
    <WhatsApp :size="20" />
    {{ t('contact.button') }}

    <span class="sr-only">{{ t('contact.newTab') }}</span>
  </a>
</template>
