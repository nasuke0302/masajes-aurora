<script setup lang="ts">
defineProps<{title:string;description:string}>()
</script>
<template>
 <div class="page-shell narrow">
  <header class="page-header"><BrandLogo /><NuxtLink to="/" class="text-link">Volver a la web</NuxtLink></header>
  <main><h1 class="page-title">{{ title }}</h1><p class="page-intro max-w-none text-justify hyphens-auto">{{ description }}</p><article class="w-full text-justify leading-7 hyphens-auto [overflow-wrap:anywhere] [&_h2]:my-10 [&_h2]:text-start [&_h2]:text-2xl [&_h2]:leading-[1.3] [&_h2]:font-bold [&_h2]:text-balance [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_dl]:my-4 [&_li]:my-2 [&_dt]:mt-4 [&_dt]:font-bold [&_a]:underline [&_a]:underline-offset-4"><slot /></article></main>
  <footer class="page-footer flex flex-wrap items-center justify-between gap-5"><FooterLinks /></footer>
 </div>
</template>
