<script setup lang="ts">
import {money,localLabel} from '#shared/booking'
import type {AgendaReservation} from '#shared/admin-calendar'
const props=defineProps<{reservation:AgendaReservation;busy:boolean;now:number}>()
defineEmits<{action:[action:'cancel'|'complete'|'cash-paid']}>()
const labels:Record<string,string>={held:'En espera de pago',confirmed:'Confirmada',completed:'Realizada',cancelled:'Cancelada',expired:'Caducada',pending:'Pendiente de pago',paid:'Pagado',refunded:'Reembolsado',partial_refund:'Reembolso parcial'}
const paymentLabel=computed(()=>props.reservation.payment_status==='pending'&&props.reservation.method==='cash'?'Efectivo pendiente':labels[props.reservation.payment_status]||props.reservation.payment_status)
const lines=computed(()=>JSON.parse(props.reservation.lines_json) as {id:string;quantity:number;name:string;minutes:number}[])
const dateLabel=computed(()=>new Intl.DateTimeFormat('es-ES',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(props.reservation.service_date+'T12:00:00Z')))
</script>
<template><div class="reservation-detail">
 <h2 class="detail-heading">Reserva seleccionada</h2>
 <h3 class="detail-client">{{ reservation.name }}</h3>
 <p class="detail-date">{{ dateLabel }} · {{ localLabel(reservation.start_at) }}–{{ localLabel(reservation.end_at) }}</p>
 <div class="detail-lines"><p v-for="line in lines" :key="line.id">{{ line.quantity }} × {{ line.minutes }} min</p><span>{{ (reservation.end_at-reservation.start_at)/60 }} min en total</span></div>
 <div class="status-tags"><span class="status-tag" :class="{'status-muted':['cancelled','expired'].includes(reservation.status)}">{{ labels[reservation.status] || reservation.status }}</span><span class="status-tag" :class="{'status-pending':reservation.payment_status==='pending'}">{{ paymentLabel }}</span></div>
 <dl class="detail-contact">
  <div><dt><AdminIcon name="pin" /><span class="sr-only">Dirección</span></dt><dd>{{ reservation.address }}</dd></div>
  <div><dt><AdminIcon name="phone" /><span class="sr-only">Teléfono</span></dt><dd><a :href="'tel:'+reservation.phone">{{ reservation.phone }}</a></dd></div>
  <div><dt><AdminIcon name="mail" /><span class="sr-only">Email del cliente</span></dt><dd><a :href="'mailto:'+reservation.email">{{ reservation.email }}</a></dd></div>
  <div v-if="reservation.notes"><dt><AdminIcon name="note" /><span class="sr-only">Notas</span></dt><dd class="whitespace-pre-wrap">{{ reservation.notes }}</dd></div>
 </dl>
 <dl class="detail-total"><div><dt>Sesión completa</dt><dd>{{ money(reservation.amount_cents) }}</dd></div><div><dt>{{ reservation.method==='cash'?'Efectivo':'Pago adelantado' }}</dt><dd>{{ reservation.reference }}</dd></div></dl>
 <p v-if="reservation.status==='cancelled'&&reservation.method==='online'&&['paid','partial_refund'].includes(reservation.payment_status)" class="notice">Devolución pendiente en Stripe.</p>
 <div class="detail-actions">
  <a class="admin-button secondary" :href="'tel:'+reservation.phone"><AdminIcon name="phone" />Llamar</a>
  <button v-if="reservation.method==='cash'&&reservation.payment_status==='pending'&&['confirmed','completed'].includes(reservation.status)" class="admin-button primary" :disabled="busy" @click="$emit('action','cash-paid')">Marcar cobrado</button>
  <button v-if="reservation.status==='confirmed'&&reservation.end_at<=now" class="admin-button secondary" :disabled="busy" @click="$emit('action','complete')"><AdminIcon name="check" />Marcar realizada</button>
  <button v-if="reservation.status==='confirmed'" class="admin-button danger" :disabled="busy" @click="$emit('action','cancel')">Cancelar reserva</button>
 </div>
 </div></template>
