<script setup lang="ts">
withDefaults(defineProps<{src:string;srcset?:string;w?:number|string;h?:number|string;alt?:string;sizes?:string;eager?:boolean}>(),{alt:'',eager:false})
</script>
<template><img :src="src" :srcset="srcset" :width="w" :height="h" :alt="alt" :sizes="sizes" :loading="eager ? 'eager' : 'lazy'" :fetchpriority="eager ? 'high' : 'auto'" decoding="async" /></template>
