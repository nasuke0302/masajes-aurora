<script setup lang="ts">
const {data:authMode}=await useFetch<{access:boolean}>('/api/auth-mode')
if(authMode.value?.access)await navigateTo('/admin')
const email=ref(''),message=ref(''),error=ref(''),busy=ref(false),link=ref('')
useSeoMeta({title:'Acceso de Aurora · Aurora Masajista',robots:'noindex, nofollow'})
onMounted(()=>{link.value=window.location.hash.slice(1);if(link.value)window.history.replaceState(null,'','/admin/acceso')})
async function login(){busy.value=true;error.value='';try{if(link.value){await $fetch('/api/admin/consume',{method:'POST',body:{token:link.value}});await navigateTo('/admin')}else{const r=await $fetch<{message:string}>('/api/admin/login',{method:'POST',body:{email:email.value}});message.value=r.message}}catch(e){error.value=apiError(e)}finally{busy.value=false}}
</script>
<template><div class="page-shell narrow"><header class="page-header"><BrandLogo /></header><main><h1 class="page-title">Tu agenda, Aurora.</h1><p class="page-intro">Acceso privado para gestionar las reservas.</p><form class="surface space-y-5" @submit.prevent="login"><label v-if="!link" class="field">Email autorizado<input v-model="email" type="email" autocomplete="email" required /></label><p v-else>El enlace de acceso es válido durante 15 minutos y solo se puede utilizar una vez.</p><p v-if="message" class="notice" role="status">{{ message }}</p><p v-if="error" class="notice" role="alert">{{ error }}</p><button type="submit" class="action" :disabled="busy">{{ busy?'Comprobando…':link?'Entrar en el panel':'Recibir enlace de acceso' }}</button></form></main></div></template>

