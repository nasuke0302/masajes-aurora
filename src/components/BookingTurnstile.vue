<script setup lang="ts">
import {loadTurnstile} from '~/utils/turnstile'
const emit=defineEmits<{verified:[token:string|null]}>()
const container=ref<HTMLElement|null>(null),loading=ref(true),error=ref('')
const sitekey=useRuntimeConfig().public.turnstileSiteKey
let api:Awaited<ReturnType<typeof loadTurnstile>>|undefined,widget:string|undefined,disposed=false
async function setup(){
 emit('verified',null);loading.value=true;error.value=''
 try{
  if(!sitekey)throw new Error('MISSING_SITEKEY')
  api=await loadTurnstile();if(disposed||!container.value)return
  if(widget!==undefined)api.remove(widget)
  widget=api.render(container.value,{sitekey,action:'booking_create',theme:'light',size:'compact',language:'es',callback:(token:string)=>{loading.value=false;error.value='';emit('verified',token)},'expired-callback':()=>{emit('verified',null);if(widget!==undefined)api?.reset(widget)},'error-callback':()=>{loading.value=false;emit('verified',null);error.value='No se pudo verificar. Inténtalo de nuevo.'},'timeout-callback':()=>{loading.value=false;emit('verified',null);error.value='La verificación ha caducado. Inténtalo de nuevo.'}})
 }catch{loading.value=false;error.value='No se pudo cargar la verificación. Inténtalo de nuevo.'}
}
onMounted(setup)
onBeforeUnmount(()=>{disposed=true;emit('verified',null);if(widget!==undefined)api?.remove(widget)})
</script>
<template><div class="mt-5"><div ref="container" aria-label="Verificación de seguridad"></div><p v-if="loading" class="text-sm text-muted" role="status">Verificando…</p><p v-if="error" class="text-sm mt-2" role="alert">{{ error }} <button type="button" class="text-link" @click="setup">Reintentar</button></p></div></template>
