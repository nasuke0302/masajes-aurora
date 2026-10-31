<script setup lang="ts">
import { legalLinks } from '#shared/legal'
</script>

<template>
  <nav class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm" aria-label="Enlaces del pie de página">
    <NuxtLink to="/blog" class="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-coral">Blog</NuxtLink>
    <NuxtLink v-for="link in legalLinks" :key="link.to" :to="link.to" class="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-coral">{{ link.label }}</NuxtLink>
  </nav>
</template>
