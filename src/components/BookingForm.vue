<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { bookingContactSchema } from '#shared/booking-contact'
import {legalOwner,TERMS_VERSION,EARLY_SERVICE_SECONDS} from '#shared/legal'
import { money, localDate, datePlus, localLabel, totals, MAX_SESSION_MASSAGES, type Product, type Hours, type Slot } from '#shared/booking'
const props = withDefaults(defineProps<{ admin?: boolean; initialStartAt?: number | null }>(), { admin: false, initialStartAt: null })
const emit = defineEmits<{ saved: [] }>()
type Catalog = { products: Product[]; hours: Hours[]; accepting: boolean }
type Available = { slots: Slot[]; duration: number; amount: number; quantity: number }
const { data: catalog, error: catalogError } = await useFetch<Catalog>('/api/catalog')
const today = localDate(Math.floor(Date.now() / 1000)), lastDay = datePlus(today, 30)
const quantities = reactive({ massage40: 0, massage60: 1 })
const date = ref(props.initialStartAt ? localDate(props.initialStartAt) : today), startAt = ref<number | null>(null), slots = ref<Available | null>(null), loading = ref(false), busy = ref(false), error = ref(''), review = ref(false), saved = ref('')
let preferredStart = props.initialStartAt
const details = reactive({ name: '', email: '', phone: '', address: '', city: 'Ávila' as const, notes: '', addressExtra: '' })
const addressSelection = ref<{ id: string; portal: string } | null>(null)
function selectAddress(value: { id: string; portal: string; street: string } | null) { addressSelection.value = value ? { id: value.id, portal: value.portal } : null; details.address = value?.street || '' }
const turnstileToken = ref<string | null>(null)
const acceptTerms=ref(false),adultsOnly=ref(false),earlyService=ref(false),withdrawalAcknowledged=ref(false)
const legalClock=ref(Math.floor(Date.now()/1000))
const needsEarlyService=computed(()=>!!startAt.value&&startAt.value<legalClock.value+EARLY_SERVICE_SECONDS)
const legalReady=computed(()=>acceptTerms.value&&adultsOnly.value&&(!needsEarlyService.value||(earlyService.value&&withdrawalAcknowledged.value)))
let requestKey = ''
let controller: AbortController | undefined
const total = computed(() => { try { return totals(quantities, catalog.value?.products || []) } catch { return null } })
const availableSlots = computed(() => slots.value?.slots.filter(s => s.available) || [])
const selected = computed(() => slots.value?.slots.find(s => s.startAt === startAt.value && s.available))
const contactValid = computed(() => !!addressSelection.value && bookingContactSchema.safeParse(details).success)
const ready = computed(() => catalog.value?.accepting && catalog.value.products.every(p => p.price_cents !== null && p.price_cents > 0))
watch([date, () => quantities.massage40, () => quantities.massage60], async () => {
  controller?.abort(); controller = new AbortController(); const current = controller
  startAt.value = null; review.value = false; slots.value = null; error.value = ''; requestKey = ''; loading.value = false
  if (!ready.value || !total.value) return
  loading.value = true
  try { const result = await $fetch<Available>('/api/availability', { query: { date: date.value, ...quantities }, signal: current.signal }); if (!current.signal.aborted) { slots.value = result; if (preferredStart) { if (result.slots.some(s => s.startAt === preferredStart && s.available)) startAt.value = preferredStart; else error.value = 'La hora seleccionada no está disponible para esta visita. Elige otra hora.'; preferredStart = null } } } catch (e) { if (!current.signal.aborted) error.value = apiError(e) } finally { if (!current.signal.aborted) loading.value = false }
}, { immediate: true })
watch(details, () => { review.value = false; turnstileToken.value = null; requestKey = '' })
watch(review, () => { turnstileToken.value = null })
watch(startAt,()=>{earlyService.value=false;withdrawalAcknowledged.value=false})
watch([acceptTerms,adultsOnly,earlyService,withdrawalAcknowledged],()=>{requestKey=''})
function change(q: 'massage40' | 'massage60', n: number) { if (n >= 0 && n <= MAX_SESSION_MASSAGES && n + quantities[q === 'massage40' ? 'massage60' : 'massage40'] <= MAX_SESSION_MASSAGES) quantities[q] = n }
function showReview() { legalClock.value=Math.floor(Date.now()/1000);error.value = ''; if (!contactValid.value) return; if (!selected.value) { error.value = 'Selecciona una hora disponible.'; return } review.value = true }
async function submit() {
  legalClock.value=Math.floor(Date.now()/1000)
  if(!legalReady.value){error.value='Completa las confirmaciones antes de reservar.';return}
  if (!selected.value || !contactValid.value || !legalReady.value || busy.value || (!props.admin && !turnstileToken.value)) return
  busy.value = true; error.value = ''; requestKey ||= crypto.randomUUID()
  try {
    const body = { quantities: { ...quantities }, startAt: startAt.value, ...details, addressSelection: addressSelection.value, requestKey, termsVersion:TERMS_VERSION,acceptTerms:acceptTerms.value,adultsOnly:adultsOnly.value,earlyServiceRequested:earlyService.value,withdrawalAcknowledged:withdrawalAcknowledged.value,...(!props.admin ? { turnstileToken: turnstileToken.value } : {}) }
    if (props.admin) { const r = await $fetch<{ reference: string }>('/api/admin/bookings', { method: 'POST', body }); saved.value = r.reference; emit('saved') }
    else { const r = await $fetch<{ url: string }>('/api/bookings', { method: 'POST', body }); window.location.assign(r.url) }
  } catch (e) { legalClock.value=Math.floor(Date.now()/1000);error.value = apiError(e); turnstileToken.value = null; review.value = false } finally { busy.value = false }
}
</script>
<template>
  <div v-if="catalogError" class="notice" role="alert">La agenda todavía no está disponible. Puedes consultar con Aurora
    por <a href="https://wa.me/34644517187" class="underline">WhatsApp</a>.</div>
  <div v-else-if="!ready" class="notice">Estamos preparando la agenda de reservas. Mientras tanto, <a
      href="https://wa.me/34644517187" class="underline">contacta con Aurora por WhatsApp</a>.</div>
  <div v-else-if="saved" class="notice" role="status">Reserva {{ saved }} guardada. Hemos preparado los emails de
    confirmación.</div>
  <form v-else class="booking-grid" @submit.prevent="review ? submit() : showReview()">
    <div class="space-y-9">
      <fieldset>
        <legend class="sr-only">Masajes</legend>
        <div v-for="product in catalog?.products" :key="product.id" class="product-line">
          <div><label :for="product.id" class="font-semibold text-lg">{{ product.name }}</label>
            <p class="text-muted">{{ money(product.price_cents!) }} por persona</p>
          </div>
          <div class="quantity-control"><button type="button" :aria-label="'Quitar ' + product.name"
              :disabled="quantities[product.id] === 0 || busy"
              @click="change(product.id, quantities[product.id] - 1)">−</button><input :id="product.id"
              :value="quantities[product.id]" type="number" min="0" :max="MAX_SESSION_MASSAGES" readonly
              :aria-label="'Cantidad de ' + product.name" /><button type="button" :aria-label="'Añadir ' + product.name"
              :disabled="quantities.massage40 + quantities.massage60 >= MAX_SESSION_MASSAGES || busy"
              @click="change(product.id, quantities[product.id] + 1)">+</button></div>
        </div>
      </fieldset>
      <fieldset>
        <legend class="text-2xl font-bold mb-5">Elige día y hora</legend>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
          <label class="field min-w-0"><span>Día de la sesión <span class="text-coral"
                aria-hidden="true">*</span></span><input v-model="date" class="min-w-0 w-full" type="date" :min="today"
              :max="lastDay" required :disabled="busy" /></label>
          <label class="field min-w-0"><span>Hora de inicio <span class="text-coral"
                aria-hidden="true">*</span></span><select v-model="startAt" class="min-w-0 w-full"
              aria-label="Hora de inicio" required :disabled="busy || loading || !availableSlots.length"
              :aria-busy="loading" @change="review = false; requestKey = ''">
              <option :value="null" disabled>{{ loading ? 'Cargando…' : slots && !availableSlots.length ?
                'Sin horas disponibles' : 'Selecciona una hora' }}</option>
              <option v-for="slot in availableSlots" :key="slot.startAt" :value="slot.startAt">{{ slot.label }}–{{
                localLabel(slot.endAt) }}</option>
            </select></label>
        </div>
        <p v-if="loading" role="status" class="mt-5">Consultando disponibilidad…</p>
        <p v-else-if="slots && !availableSlots.length" class="mt-5 text-muted" role="status">No hay horas disponibles
          para
          esta sesión. Elige otra fecha o cambia los masajes.</p>
      </fieldset>
      <fieldset>
        <legend class="text-2xl font-bold mb-5">Los datos de la visita</legend>
        <div class="form-columns"><label class="field"><span>Nombre <span class="text-coral"
                aria-hidden="true">*</span></span><input v-model="details.name" autocomplete="name" required
              minlength="2" maxlength="100" :disabled="busy" /></label><label class="field"><span>Email <span
                class="text-coral" aria-hidden="true">*</span></span><input v-model="details.email" type="email"
              autocomplete="email" required maxlength="254" :disabled="busy" /></label><label
            class="field"><span>Teléfono <span class="text-coral" aria-hidden="true">*</span></span><input
              v-model="details.phone" type="tel" autocomplete="tel" required maxlength="20" :disabled="busy" /></label>
        </div>
        <BookingAddress :disabled="busy" @selected="selectAddress" /><label class="field mt-5"><span>Piso y puerta <span
              class="font-normal text-muted text-sm">(opcional)</span></span><input v-model="details.addressExtra"
            autocomplete="address-line2" maxlength="100" :disabled="busy" /></label><label
          class="field mt-5"><span>Indicaciones para acceder al domicilio <span class="font-normal text-muted text-sm">(opcional)</span></span><textarea
            v-model="details.notes" rows="4" maxlength="1500" placeholder="Por ejemplo, cómo encontrar el portal o usar el timbre"
            aria-describedby="booking-notes-help" :disabled="busy" /></label><p id="booking-notes-help" class="text-sm text-muted mt-2">Solo indicaciones logísticas. No incluyas enfermedades, lesiones, medicación ni otros datos de salud. Estas notas no se enviarán por email.</p>
        <p class="text-sm text-muted mt-5">Responsable: {{ legalOwner.name }}. Usaremos estos datos para gestionar la visita, sobre la base de la contratación del servicio. Puedes ejercer tus derechos en <a :href="'mailto:'+legalOwner.email" class="text-link">{{ legalOwner.email }}</a>. <NuxtLink to="/privacidad" class="text-link" target="_blank">Información completa de privacidad</NuxtLink>.</p>
      </fieldset>
    </div>
    <aside class="booking-summary">
      <h2 class="text-2xl font-bold">Tu sesión</h2>
      <dl class="summary-list">
        <div v-for="p in catalog?.products.filter(p => quantities[p.id])" :key="p.id">
          <dt>{{ quantities[p.id] }} · {{ p.name }}</dt>
          <dd>{{ money(quantities[p.id] * p.price_cents!) }}</dd>
        </div>
        <div>
          <dt>Duración total</dt>
          <dd>{{ total?.duration }} min</dd>
        </div>
        <div v-if="selected">
          <dt>{{ date }}</dt>
          <dd>{{ selected.label }}–{{ localLabel(selected.endAt) }}</dd>
        </div>
        <div class="font-bold text-xl">
          <dt>Total</dt>
          <dd>{{ money(total?.amount || 0) }}</dd>
        </div>
      </dl>
      <p class="mt-6 font-semibold">Pago en efectivo</p>
      <template v-if="review">
        <fieldset class="mt-6 space-y-3"><legend class="font-semibold mb-3">{{ admin?'Confirmaciones comunicadas por el cliente':'Antes de confirmar' }}</legend><p v-if="admin" class="text-sm text-muted">Marca estas casillas únicamente si el cliente ha recibido las condiciones y ha comunicado estas confirmaciones. Se registrará como reserva introducida por Aurora.</p>
          <label class="flex items-start gap-3 text-sm"><input v-model="acceptTerms" type="checkbox" required :disabled="busy" class="mt-1" /><span>{{ admin?'El cliente acepta las':'Acepto las' }} <NuxtLink to="/condiciones-reserva" target="_blank" class="text-link">condiciones de reserva</NuxtLink>, incluido el pago en efectivo del servicio.</span></label>
          <label class="flex items-start gap-3 text-sm"><input v-model="adultsOnly" type="checkbox" required :disabled="busy" class="mt-1" /><span>{{ admin?'El cliente confirma':'Confirmo' }} que todas las personas que recibirán un masaje son mayores de 18 años.</span></label>
          <template v-if="needsEarlyService"><label class="flex items-start gap-3 text-sm"><input v-model="earlyService" type="checkbox" required :disabled="busy" class="mt-1" /><span>{{ admin?'El cliente solicita expresamente':'Solicito expresamente' }} que el servicio comience antes de finalizar los 14 días de desistimiento.</span></label><label class="flex items-start gap-3 text-sm"><input v-model="withdrawalAcknowledged" type="checkbox" required :disabled="busy" class="mt-1" /><span>{{ admin?'El cliente reconoce':'Reconozco' }} que perderá el derecho de desistimiento cuando el servicio se haya prestado íntegramente. Puede cancelar gratuitamente antes de que empiece.</span></label></template>
        </fieldset>
        <div class="mt-6 text-sm space-y-2">
          <p class="font-bold">Revisa antes de confirmar</p>
          <p>{{ details.name }} · {{ details.email }}</p>
          <p>{{ details.address }}{{ details.addressExtra ? ', ' + details.addressExtra : '' }}, Ávila capital</p>
          <p v-if="details.notes">{{ details.notes }}</p>
        </div><button type="button" class="text-link mt-4" :disabled="busy" @click="review = false">Editar
          datos</button>
      </template>
      <ClientOnly>
        <BookingTurnstile v-if="review && !admin" @verified="turnstileToken = $event" />
      </ClientOnly>
      <p v-if="error" class="notice mt-5" role="alert">{{ error }}</p><button class="action w-full mt-6"
        :disabled="!selected || !contactValid || loading || busy || (review&&(!legalReady||(!admin&&!turnstileToken)))"
        type="submit">{{
          busy ? 'Procesando…' : review ? 'Reservar con obligación de pago' : 'Revisar reserva' }}</button>
      <p class="text-sm text-muted mt-4">Tu reserva se confirma al enviarla.</p>
    </aside>
  </form>
</template>
