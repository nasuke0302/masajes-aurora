<script setup lang="ts">
import { marketingOffer, marketingPrice, marketingFirstSessionPrice } from '#shared/marketing-offer'

withDefaults(defineProps<{ showDuration?: boolean }>(), { showDuration: true })
</script>

<template>
  <div class="offer-summary">
    <p class="offer-price"><template v-if="showDuration">{{ marketingOffer.durationMinutes }} minutos <span aria-hidden="true">·</span> </template>{{ marketingPrice }}</p>
    <p class="offer-welcome">Primera sesión: <strong>{{ marketingFirstSessionPrice }}</strong></p>
  </div>
</template>

<style scoped>
.offer-summary { margin-top: 1.5rem; line-height: 1.6; }
.offer-price { font-size: 1.25rem; font-weight: 700; }
.offer-welcome { margin-top: .25rem; font-size: 1rem; }
</style>
