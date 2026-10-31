<script setup lang="ts">
import { marketingOffer, marketingPrice, marketingFirstSessionPrice } from '#shared/marketing-offer'

withDefaults(defineProps<{ showDuration?: boolean }>(), { showDuration: true })
</script>

<template>
  <div class="mt-6 leading-relaxed">
    <p class="text-xl font-bold"><template v-if="showDuration">{{ marketingOffer.durationMinutes }} minutos <span aria-hidden="true">·</span> </template>{{ marketingPrice }}</p>
    <p class="mt-1 text-base">Primera sesión: <strong>{{ marketingFirstSessionPrice }}</strong></p>
  </div>
</template>
