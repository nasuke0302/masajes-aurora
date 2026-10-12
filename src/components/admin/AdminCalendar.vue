<script setup lang="ts">
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import {datePlus,localDate,localLabel,type Hours} from '#shared/booking'
import {agendaRange,calendarWallTime,calendarInstant,calendarDateText,closedHours,dayMassageCount,occupiesAgenda,type AgendaReservation,type AgendaBlock} from '#shared/admin-calendar'
const props=defineProps<{anchor:string;view:'week'|'month';dates:string[];rows:AgendaReservation[];blocks:AgendaBlock[];hours:Hours[];selectedId:string|null;loading:boolean;revision:number}>()
const emit=defineEmits<{select:[reservation:AgendaReservation];create:[startAt:number];move:[reservation:AgendaReservation,startAt:number];invalid:[message:string]}>()
const range=computed(()=>agendaRange(props.hours,props.rows))
type CalendarEvent={id:string;start:string;end:string;title:string;class:string;background?:boolean;draggable:boolean;resizable:boolean;deletable:boolean}
const events=computed(()=>{
 const result:CalendarEvent[]=props.rows.filter(r=>occupiesAgenda(r.status)).map(r=>({id:r.id,start:calendarWallTime(r.start_at),end:calendarWallTime(r.end_at),title:r.name,class:['aurora-session',r.status==='completed'?'is-completed':'',props.selectedId===r.id?'is-selected':''].join(' '),draggable:!props.loading&&r.status==='confirmed'&&r.start_at>Date.now()/1000,resizable:false,deletable:false}))
 if(props.view==='month')return result
 const add=(id:string,start:string,end:string,title:string,css:string)=>result.push({id,start,end,title,class:css,background:true,draggable:false,resizable:false,deletable:false})
 const time=(date:string,m:number)=>m===1440?datePlus(date,1)+' 00:00':date+' '+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')
 for(const date of props.dates){
  for(const gap of closedHours(date,props.hours))add('closed:'+date+':'+gap.start,time(date,gap.start),time(date,gap.end),'Fuera de jornada','aurora-unavailable')
  for(const b of props.blocks){const start=calendarWallTime(b.start_at),end=calendarWallTime(b.end_at);if(localDate(b.start_at)<=date&&localDate(b.end_at)>=date)add('block:'+b.id+':'+date,start<date+' 00:00'?date+' 00:00':start,end>datePlus(date,1)+' 00:00'?datePlus(date,1)+' 00:00':end,b.reason||'Bloqueado','aurora-block')}
 }
 for(const r of props.rows.filter(r=>occupiesAgenda(r.status)))add('buffer:'+r.id,calendarWallTime(r.end_at),calendarWallTime(r.end_at+1800),'30 min entre visitas','aurora-buffer')
 return result
})
function select(event:{id:string}){const row=props.rows.find(r=>r.id===event.id);if(row)emit('select',row)}
function label(id:string){const row=props.rows.find(r=>r.id===id);return row?localLabel(row.start_at)+'–'+localLabel(row.end_at):''}
function massages(id:string){const row=props.rows.find(r=>r.id===id);return row?(JSON.parse(row.lines_json) as {quantity:number;minutes:number}[]).map(l=>l.quantity+' × '+l.minutes+' min').join(' · '):''}
function monthHours(date:string){const weekday=new Date(date+'T12:00:00Z').getUTCDay(),windows=props.hours.filter(h=>h.weekday===weekday);const time=(m:number)=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');return windows.length?'Jornada '+windows.map(h=>time(h.open_minute)+'–'+time(h.close_minute)).join(', '):'Fuera de jornada'}
function monthBlocks(date:string){return props.blocks.filter(b=>calendarWallTime(b.start_at)<datePlus(date,1)+' 00:00'&&calendarWallTime(b.end_at)>date+' 00:00').length}
function create(date:Date){if(props.loading)return;try{const chosen=new Date(date);if(props.view==='month'){const first=props.hours.filter(h=>h.weekday===chosen.getDay()).sort((a,b)=>a.open_minute-b.open_minute)[0];if(!first)throw new Error('Melba no tiene jornada disponible ese día.');chosen.setHours(0,first.open_minute,0,0)}emit('create',calendarInstant(chosen))}catch(e){emit('invalid',(e as Error).message)}}
function move({event}:{event:{id:string;start:Date}}){const row=props.rows.find(r=>r.id===event.id);if(!row)return;try{emit('move',row,calendarInstant(event.start))}catch(e){emit('invalid',(e as Error).message)}}
</script>
<template>
 <div class="calendar-scroll aurora-vuecal" :aria-busy="loading" tabindex="0" aria-label="Agenda en hora de Ávila. Doble clic para crear una reserva.">
  <ClientOnly><VueCal :key="revision" :selected-date="anchor" :active-view="view" :disable-views="['years','year','day']" hide-view-selector hide-title-bar locale="es" :events="events" events-on-month-view="short" :editable-events="{title:false,drag:!loading&&view==='week',resize:false,create:false,delete:false}" :time-from="range.start" :time-to="range.end" :time-step="60" :time-cell-height="81" :snap-to-time="10" :dblclick-to-navigate="false" :click-to-navigate="false" :cell-click-hold="false" :drag-to-create-event="false" :transitions="false" :on-event-click="select" @cell-dblclick="create" @event-drop="move">
   <template #weekday-heading="{heading}"><span>{{ heading.label }}<template v-if="view==='week'&&heading.date"> {{ heading.date.getDate() }}<small class="aurora-day-count">{{ dayMassageCount(rows,calendarDateText(heading.date)) }} masajes</small></template></span></template>
   <template #cell-content="{cell,view}"><template v-if="view.id==='month'"><div class="vuecal__cell-date">{{ cell.content }}</div><p class="aurora-month-availability">{{ monthHours(cell.formattedDate) }}<span v-if="monthBlocks(cell.formattedDate)"> · {{ monthBlocks(cell.formattedDate) }} bloqueo(s)</span></p></template></template>
   <template #event="{event}"><button v-if="!event.background" type="button" class="aurora-event-button" :aria-pressed="selectedId===event.id" @click.stop="select(event)" @dblclick.stop><span>{{ label(event.id) }}</span><strong>{{ event.title }}</strong><span>{{ massages(event.id) }}</span></button><span v-else class="aurora-background-label">{{ event.title }}</span></template>
  </VueCal><template #fallback><p class="calendar-feedback">Cargando agenda…</p></template></ClientOnly>
 </div>
</template>
<style>
.aurora-vuecal {height:720px;max-height:75vh;}
.aurora-vuecal .vuecal {min-width:720px;font-family:inherit;box-shadow:none;color:#064f58;}
.aurora-vuecal .vuecal__heading {background:#edf8f5;min-height:48px;}
.aurora-vuecal .vuecal__cell--today {background:#edf8f566;}
.aurora-vuecal .vuecal__event.aurora-session {background:#edf8f5;color:#064f58;border:1px solid #08767b;border-radius:6px;}
.aurora-vuecal .vuecal__event.is-selected {outline:2px solid #064f58;outline-offset:-2px;}
.aurora-vuecal .vuecal__event.is-completed {background:#edf8f5;opacity:.8;}
.aurora-vuecal .vuecal__event.aurora-unavailable {background:#38636918;}
.aurora-vuecal .vuecal__event.aurora-block {background:#c9534920;}
.aurora-vuecal .vuecal__event.aurora-buffer {background:#edf8f5;color:#386369;}
.aurora-background-label {font-size:12px;line-height:1.3;padding:2px 4px;display:block;}
.calendar-help {font-size:12px;color:#386369;padding:12px 16px;}
.aurora-month-availability {font-size:12px;line-height:1.3;color:#386369;padding:3px;overflow-wrap:anywhere;}
.aurora-day-count {display:block;font-size:12px;color:#386369;}
.aurora-event-button {width:100%;height:100%;padding:4px 6px;text-align:left;display:flex;flex-direction:column;overflow:hidden;cursor:grab;}
.aurora-event-button span {font-size:12px;font-variant-numeric:tabular-nums;}
.aurora-event-button strong {font-size:14px;line-height:1.3;overflow-wrap:anywhere;}
.aurora-event-button:focus-visible {outline:2px solid #064f58;outline-offset:-2px;}
.aurora-vuecal .vuecal__cell-events-count {background:#08767b;}
.aurora-vuecal .vuecal--month-view .vuecal__cell {min-height:100px;}
@media(max-width:600px){.aurora-vuecal{height:620px;max-height:70vh;}}
</style>
