<script setup lang="ts">import {legalLinks} from '#shared/legal'</script>
<template><nav class="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Información legal"><NuxtLink v-for="link in legalLinks" :key="link.to" :to="link.to" class="inline-flex min-h-11 items-center underline underline-offset-4">{{ link.label }}</NuxtLink></nav></template>
