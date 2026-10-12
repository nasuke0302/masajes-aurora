<script setup lang="ts">
import {ref,useId,onBeforeUnmount,nextTick} from 'vue'
type Candidate={id:string;portal:string;street:string;label:string}
defineProps<{disabled:boolean}>()
const emit=defineEmits<{selected:[value:Candidate|null]}>()
const query=ref(''),results=ref<Candidate[]>([]),loading=ref(false),error=ref(''),active=ref(-1),selected=ref(false),listId=useId()
let timer:ReturnType<typeof setTimeout>|undefined,controller:AbortController|undefined
function input(event:Event){
 query.value=(event.target as HTMLInputElement).value;selected.value=false;emit('selected',null);results.value=[];active.value=-1;error.value='';loading.value=false;clearTimeout(timer);controller?.abort()
 if(query.value.trim().length<3)return
 timer=setTimeout(async()=>{controller=new AbortController();const current=controller;loading.value=true
 try{const values=await $fetch<Candidate[]>('/api/addresses/search',{query:{q:query.value},signal:current.signal});if(!current.signal.aborted){results.value=values;if(!values.length)error.value='No encontramos un portal en el núcleo de Ávila. Comprueba la calle y el número o consulta por WhatsApp.'}}
 catch(e){if(!current.signal.aborted)error.value=apiError(e)}finally{if(!current.signal.aborted)loading.value=false}
 },350)
}
function choose(value:Candidate){clearTimeout(timer);controller?.abort();query.value=value.label;selected.value=true;results.value=[];active.value=-1;loading.value=false;error.value='';emit('selected',value)}
function move(delta:number){if(results.value.length){active.value=active.value<0?(delta>0?0:results.value.length-1):(active.value+delta+results.value.length)%results.value.length;void nextTick(()=>document.getElementById(listId+'-'+active.value)?.scrollIntoView({block:'nearest',inline:'nearest'}))}}
onBeforeUnmount(()=>{clearTimeout(timer);controller?.abort()})
</script>
<template><div class="mt-5"><div class="relative"><label class="field"><span>Calle y número <span class="text-coral" aria-hidden="true">*</span></span><input :value="query" type="text" autocomplete="off" placeholder="Escribe la calle y el número" required maxlength="150" :disabled="disabled" role="combobox" aria-autocomplete="list" :aria-expanded="!!results.length" :aria-controls="listId" :aria-activedescendant="active>=0?listId+'-'+active:undefined" @input="input" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent="active>=0&&choose(results[active]!)" @keydown.esc="results=[];active=-1" /></label>
 <ul v-if="results.length" :id="listId" role="listbox" aria-label="Direcciones de Ávila" class="absolute top-full inset-x-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-ink/30 bg-cream"><li v-for="(value,i) in results" :id="listId+'-'+i" :key="value.id+value.portal" role="option" :aria-selected="active===i"><button type="button" class="w-full text-left px-4 py-3 hover:bg-sage-light focus-visible:outline-2 focus-visible:outline-ink" :class="{'bg-sage-light':active===i}" :disabled="disabled" @click="choose(value)">{{ value.label }}</button></li></ul></div>
 <p v-if="loading" class="text-sm mt-2 text-muted" role="status">Buscando direcciones…</p><p v-if="error" class="text-sm mt-2" role="alert">{{ error }} <a href="https://wa.me/34644798063" class="underline">WhatsApp</a></p>
 <p class="text-xs text-muted mt-2">Direcciones de <a href="https://www.cartociudad.es/" target="_blank" rel="noopener noreferrer" class="underline">CartoCiudad · IGN/CNIG</a></p>
</div></template>
