<script setup lang="ts">
withDefaults(defineProps<{name:string;size?:number}>(),{size:20})
const paths:Record<string,string>={calendar:'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z',left:'m14 6-6 6 6 6',right:'m10 6 6 6-6 6',mail:'M3 5h18v14H3Zm0 0 9 7 9-7',phone:'M7 3H3v4c0 7.7 6.3 14 14 14h4v-4l-5-2-2 2a12 12 0 0 1-7-7l2-2Z',pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',plus:'M12 5v14M5 12h14',close:'m6 6 12 12M6 18 18 6',check:'m5 12 4 4L19 6',clock:'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',note:'M5 3h14v18H5Zm4 5h6m-6 4h6m-6 4h4',logout:'M9 3H3v18h6m6-15 6 6-6 6m-6-6h12'}
</script>
<template><svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="block shrink-0"><path :d="paths[name] || paths.note" /></svg></template>
