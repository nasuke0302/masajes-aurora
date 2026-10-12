<script setup lang="ts">
import {money,localLabel} from '#shared/booking'
import {type AgendaReservation} from '#shared/admin-calendar'
const props=defineProps<{reservation:AgendaReservation;busy:boolean;now:number}>()
defineEmits<{action:[action:'cancel'|'complete'|'cash-paid'];hold:[hold:boolean]}>()
const labels:Record<string,string>={confirmed:'Confirmada',completed:'Realizada',cancelled:'Cancelada',pending:'Pendiente de pago',paid:'Pagado'}
const paymentLabel=computed(()=>props.reservation.payment_status==='pending'&&props.reservation.method==='cash'?'Pendiente de cobro':labels[props.reservation.payment_status]||props.reservation.payment_status)
const lines=computed(()=>JSON.parse(props.reservation.lines_json) as {id:string;quantity:number;name:string;minutes:number}[])
const dateLabel=computed(()=>new Intl.DateTimeFormat('es-ES',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(props.reservation.service_date+'T12:00:00Z')))
</script>
<template><div class="reservation-detail">
 <p class="detail-reference" aria-label="Código de reserva">{{ reservation.reference }}</p>
 <h2 class="detail-date">{{ dateLabel }} · <span class="whitespace-nowrap">{{ localLabel(reservation.start_at) }}–{{ localLabel(reservation.end_at) }}</span></h2>
 <p class="detail-client">{{ reservation.name }}</p>
 <div class="detail-lines"><p v-for="line in lines" :key="line.id">{{ line.quantity }} × {{ line.minutes }} min</p><span>{{ (reservation.end_at-reservation.start_at)/60 }} min en total</span></div>
 <div class="status-tags"><span class="status-tag" :class="{'status-muted':reservation.status==='cancelled'}">{{ labels[reservation.status] || reservation.status }}</span><span class="status-tag" :class="{'status-pending':reservation.payment_status==='pending'}">{{ paymentLabel }}</span></div>
 <dl class="detail-contact">
  <div><dt><AdminIcon name="pin" /><span class="sr-only">Dirección</span></dt><dd>{{ reservation.address }}</dd></div>
  <div><dt><AdminIcon name="phone" /><span class="sr-only">Teléfono</span></dt><dd><a :href="'tel:'+reservation.phone">{{ reservation.phone }}</a></dd></div>
  <div><dt><AdminIcon name="mail" /><span class="sr-only">Email del cliente</span></dt><dd><a :href="'mailto:'+reservation.email">{{ reservation.email }}</a></dd></div>
  <div v-if="reservation.notes"><dt><AdminIcon name="note" /><span class="sr-only">Notas</span></dt><dd class="whitespace-pre-wrap">{{ reservation.notes }}</dd></div>
 </dl>
 <dl class="detail-total"><div><dt>Sesión completa</dt><dd>{{ money(reservation.amount_cents) }}</dd></div></dl>
 <div class="mt-5 mb-5"><p class="text-sm text-muted mb-3">Los datos se eliminan 12 meses después de la cita. Marca la excepción solo para una reclamación abierta y retírala al resolverla.</p><button class="admin-button secondary" :disabled="busy" :aria-pressed="!!reservation.retention_hold" @click="$emit('hold',!reservation.retention_hold)">{{ reservation.retention_hold?'Reclamación resuelta: retirar conservación':'Conservar por reclamación abierta' }}</button></div>
 <div class="detail-actions">
  <a class="admin-button secondary" :href="'tel:'+reservation.phone"><AdminIcon name="phone" />Llamar</a>
  <button v-if="reservation.payment_status==='pending'&&['confirmed','completed'].includes(reservation.status)" class="admin-button primary" :disabled="busy" @click="$emit('action','cash-paid')">Marcar cobrado</button>
  <button v-if="reservation.status==='confirmed'&&reservation.end_at<=now" class="admin-button secondary" :disabled="busy" @click="$emit('action','complete')"><AdminIcon name="check" />Marcar realizada</button>
  <button v-if="reservation.status==='confirmed'" class="admin-button danger" :disabled="busy" @click="$emit('action','cancel')">Cancelar reserva</button>
 </div>
 </div></template>
