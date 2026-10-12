<script setup lang="ts">
defineProps<{title:string;description:string}>()
</script>
<template>
 <div class="page-shell narrow legal-page">
  <header class="page-header"><BrandLogo /><NuxtLink to="/" class="text-link">Volver a la web</NuxtLink></header>
  <main><h1 class="page-title">{{ title }}</h1><p class="page-intro">{{ description }}</p><article class="legal-copy"><slot /></article></main>
  <footer class="page-footer"><LegalLinks /></footer>
 </div>
</template>
<style scoped>
.legal-page .page-intro {max-width:none;text-align:justify;text-justify:inter-word;hyphens:auto;}
.legal-copy {width:100%;line-height:1.75;overflow-wrap:anywhere;text-align:justify;text-justify:inter-word;hyphens:auto;}
.legal-copy :deep(h2) {font-size:1.5rem;line-height:1.3;font-weight:700;margin:2.5rem 0 1rem;text-wrap:balance;text-align:start;}
.legal-copy :deep(p),.legal-copy :deep(ul),.legal-copy :deep(dl) {margin:1rem 0;}
.legal-copy :deep(ul) {list-style:disc;padding-left:1.5rem;}
.legal-copy :deep(li) {margin:.5rem 0;}
.legal-copy :deep(dt) {font-weight:700;margin-top:1rem;}
.legal-copy :deep(a) {text-decoration:underline;text-underline-offset:4px;}
</style>
