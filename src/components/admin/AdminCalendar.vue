<script setup lang="ts">
import {localDate,localLabel,dayInstants,type Hours} from '#shared/booking'
import {agendaRange,clockMinute,dayMassageCount,occupiesAgenda,type AgendaReservation,type AgendaBlock} from '#shared/admin-calendar'
const props=defineProps<{dates:string[];rows:AgendaReservation[];blocks:AgendaBlock[];hours:Hours[];selectedId:string|null;loading:boolean}>()
defineEmits<{select:[reservation:AgendaReservation]}>()
const range=computed(()=>agendaRange(props.hours,props.rows))
const ticks=computed(()=>Array.from({length:(range.value.end-range.value.start)/60+1},(_,i)=>range.value.start+i*60))
const height=computed(()=>(range.value.end-range.value.start)*1.35)
function position(start:number,end:number){const top=Math.max(range.value.start,start),bottom=Math.min(range.value.end,end);return {top:(top-range.value.start)*1.35+'px',height:Math.max(0,(bottom-top)*1.35)+'px'}}
function eventStyle(r:AgendaReservation){const start=clockMinute(r.start_at);return position(start,start+(r.end_at-r.start_at)/60)}
function reservations(date:string){return props.rows.filter(r=>r.service_date===date&&occupiesAgenda(r.status))}
function dayLabel(date:string){return new Intl.DateTimeFormat('es-ES',{weekday:'short',day:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'))}
function closed(date:string){const weekday=new Date(date+'T12:00:00Z').getUTCDay();const windows=props.hours.filter(h=>h.weekday===weekday).sort((a,b)=>a.open_minute-b.open_minute);const gaps:{start:number;end:number}[]=[];let cursor=range.value.start;for(const w of windows){if(w.open_minute>cursor)gaps.push({start:cursor,end:w.open_minute});cursor=Math.max(cursor,w.close_minute)}if(cursor<range.value.end)gaps.push({start:cursor,end:range.value.end});return gaps}
function blocked(date:string){const instants=dayInstants(date);if(!instants.length)return [];const start=instants[0]!.epoch,end=instants.at(-1)!.epoch+600;return props.blocks.filter(b=>b.start_at<end&&b.end_at>start).map(b=>({...b,start:b.start_at<=start?0:clockMinute(b.start_at),end:b.end_at>=end?1440:clockMinute(b.end_at)}))}
function lineLabel(r:AgendaReservation){return (JSON.parse(r.lines_json) as {quantity:number;minutes:number}[]).map(l=>l.quantity+' × '+l.minutes+' min').join(' · ')}
</script>
<template><div class="calendar-scroll" :aria-busy="loading" tabindex="0" aria-label="Agenda. Desplázate para ver todas las horas y días.">
 <div class="calendar-grid" :class="{'calendar-day':dates.length===1}" :style="{'--calendar-days':dates.length}">
  <div class="calendar-corner" aria-hidden="true"></div>
  <div v-for="date in dates" :key="date" class="calendar-day-heading" :class="{'is-current-day':date===localDate(Date.now()/1000)}"><h3>{{ dayLabel(date) }}</h3><span>{{ dayMassageCount(rows,date) }} {{ dayMassageCount(rows,date)===1?'masaje':'masajes' }}</span></div>
  <div class="calendar-times" :style="{height:height+'px'}" aria-hidden="true"><span v-for="tick in ticks" :key="tick" :style="{top:(tick-range.start)*1.35+'px'}">{{ String(Math.floor(tick/60)).padStart(2,'0') }}:00</span></div>
  <div v-for="date in dates" :key="date+'-column'" class="calendar-column" :style="{height:height+'px'}">
   <div v-for="gap in closed(date)" :key="'closed'+gap.start" class="calendar-closed" :style="position(gap.start,gap.end)" title="Fuera de jornada"></div>
   <div v-for="b in blocked(date)" :key="b.id" class="calendar-block" :style="position(b.start,b.end)" :title="b.reason||'Periodo bloqueado'"><span>Bloqueado</span></div>
   <div v-for="tick in ticks" :key="'tick'+tick" class="calendar-hour-line" :style="{top:(tick-range.start)*1.35+'px'}"></div>
   <template v-for="r in reservations(date)" :key="r.id">
    <div class="calendar-buffer" :style="position(clockMinute(r.start_at)+(r.end_at-r.start_at)/60,clockMinute(r.start_at)+(r.end_at-r.start_at)/60+30)" title="30 minutos entre visitas" aria-hidden="true"><span>30 min</span></div>
    <button class="calendar-reservation" :class="{'is-selected':selectedId===r.id,'is-held':r.status==='held','is-completed':r.status==='completed'}" :style="eventStyle(r)" :aria-pressed="selectedId===r.id" :aria-label="dayLabel(date)+', '+localLabel(r.start_at)+' a '+localLabel(r.end_at)+', '+r.name+', '+lineLabel(r)+', '+(r.status==='held'?'En espera de pago':r.status==='completed'?'Realizada':'Confirmada')" @click="$emit('select',r)"><span class="event-time">{{ localLabel(r.start_at) }}–{{ localLabel(r.end_at) }}</span><strong>{{ r.name }}</strong><span class="event-massages">{{ lineLabel(r) }}</span></button>
   </template>
  </div>
 </div>
 </div></template>
