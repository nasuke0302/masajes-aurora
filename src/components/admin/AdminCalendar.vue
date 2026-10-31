<script setup lang="ts">
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import {datePlus,localDate,localLabel,type Hours} from '#shared/booking'
import {agendaRange,calendarWallTime,calendarInstant,calendarDateText,closedHours,dayMassageCount,occupiesAgenda,type AgendaReservation,type AgendaBlock} from '#shared/admin-calendar'
const props=defineProps<{anchor:string;view:'week'|'month';dates:string[];rows:AgendaReservation[];blocks:AgendaBlock[];hours:Hours[];selectedId:string|null;loading:boolean;revision:number}>()
const emit=defineEmits<{select:[reservation:AgendaReservation];create:[startAt:number];move:[reservation:AgendaReservation,startAt:number];invalid:[message:string]}>()
const range=computed(()=>agendaRange(props.hours,props.rows))
const calendarRoot=ref<HTMLElement|null>(null)
const dragPreview=ref<{day:string;time:string}|null>(null)
let dragged:{row:AgendaReservation;grab:number}|null=null
function clearDrag(){dragged=null;dragPreview.value=null}
watch(()=>[props.view,props.anchor,props.revision,props.loading],clearDrag)
function startDrag(e:DragEvent){
 clearDrag()
 if(props.view!=='week'||props.loading||!e.dataTransfer)return
 try{
  const event=JSON.parse(e.dataTransfer.getData('event')) as {id:string}
  const row=props.rows.find(r=>r.id===event.id)
  if(row&&row.status==='confirmed'&&row.start_at>Date.now()/1000)dragged={row,grab:Number(e.dataTransfer.getData('cursor-grab-at'))||0}
 }catch{/* Ignore unrelated native drags. */}
}
function previewDrag(e:DragEvent){
 if(!dragged||!calendarRoot.value)return
 const cell=(e.target as Element).closest<HTMLElement>('.vuecal__cell')
 const cells=Array.from(calendarRoot.value.querySelectorAll<HTMLElement>('.vuecal__cell'))
 const date=cell?props.dates[cells.indexOf(cell)]:undefined
 if(!cell||!date){dragPreview.value=null;return}
 // Match Vue Cal's drop calculation, including where the event was grabbed.
 // Its cellsEl is the common parent of the weekly cells, inside the scroll area.
 const top=cell.parentElement!.getBoundingClientRect().top
 const minute=Math.max(Math.round((e.clientY-top-dragged.grab)*60/81+range.value.start),0)
 const snapped=Math.floor((minute+5)/10)*10
 const start=new Date(date+'T00:00:00');start.setMinutes(snapped)
 const end=new Date(start);end.setMinutes(end.getMinutes()+(dragged.row.end_at-dragged.row.start_at)/60)
 const clock=(d:Date)=>String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')
 dragPreview.value={day:new Intl.DateTimeFormat('es-ES',{weekday:'short',day:'numeric',month:'short'}).format(start),time:clock(start)+'–'+clock(end)}
}
function leaveDrag(e:DragEvent){
 const bounds=calendarRoot.value?.getBoundingClientRect()
 if(bounds&&(e.clientX<=bounds.left||e.clientX>=bounds.right||e.clientY<=bounds.top||e.clientY>=bounds.bottom))dragPreview.value=null
}
type CalendarEvent={id:string;start:string;end:string;title:string;class:string;background?:boolean;draggable:boolean;resizable:boolean;deletable:boolean}
const events=computed(()=>{
 const result:CalendarEvent[]=props.rows.filter(r=>occupiesAgenda(r.status)).map(r=>({id:r.id,start:calendarWallTime(r.start_at),end:calendarWallTime(r.end_at),title:r.name,class:['aurora-session',r.status==='completed'?'is-completed':'',props.selectedId===r.id?'is-selected':''].join(' '),draggable:props.view==='week'&&!props.loading&&r.status==='confirmed'&&r.start_at>Date.now()/1000,resizable:false,deletable:false}))
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
function create(date:Date){if(props.loading)return;try{const chosen=new Date(date);if(props.view==='month'){const first=props.hours.filter(h=>h.weekday===chosen.getDay()).sort((a,b)=>a.open_minute-b.open_minute)[0];if(!first)throw new Error('Aurora no tiene jornada disponible ese día.');chosen.setHours(0,first.open_minute,0,0)}emit('create',calendarInstant(chosen))}catch(e){emit('invalid',(e as Error).message)}}
function move({event}:{event:{id:string;start:Date}}){const row=props.rows.find(r=>r.id===event.id);if(!row)return;try{emit('move',row,calendarInstant(event.start))}catch(e){emit('invalid',(e as Error).message)}}
</script>
<template>
 <div ref="calendarRoot" class="calendar-scroll h-[620px] max-h-[70vh] min-[601px]:h-[720px] min-[601px]:max-h-[75vh]
   [&_.vuecal]:min-w-[720px] [&_.vuecal]:font-[inherit] [&_.vuecal]:shadow-none [&_.vuecal]:text-ink
   [&_.vuecal__heading]:min-h-12 [&_.vuecal__heading]:bg-sage-light
   [&_.vuecal__cell--today]:bg-[#edf8f566]
   [&_.vuecal__event.aurora-session]:rounded-md [&_.vuecal__event.aurora-session]:border [&_.vuecal__event.aurora-session]:border-sage [&_.vuecal__event.aurora-session]:bg-sage-light [&_.vuecal__event.aurora-session]:text-ink
   [&_.vuecal__event.is-selected]:outline-2 [&_.vuecal__event.is-selected]:-outline-offset-2 [&_.vuecal__event.is-selected]:outline-ink
   [&_.vuecal__event.is-completed]:bg-sage-light [&_.vuecal__event.is-completed]:opacity-80
   [&_.vuecal__event.aurora-unavailable]:border-y [&_.vuecal__event.aurora-unavailable]:border-[#8aaeb2] [&_.vuecal__event.aurora-unavailable]:bg-[#cbdadb] [&_.vuecal__event.aurora-unavailable]:text-[#214d53]
   [&_.aurora-unavailable_.aurora-background-label]:font-semibold
   [&_.vuecal__event.aurora-block]:bg-coral/15
   [&_.vuecal__event.aurora-buffer]:bg-sage-light [&_.vuecal__event.aurora-buffer]:text-muted
   [&_.vuecal__cell-events-count]:bg-sage
   [&_.vuecal--month-view_.vuecal__cell]:min-h-[100px]"
   @dragstart="startDrag" @dragover="previewDrag" @dragleave="leaveDrag" @drop="clearDrag" @dragend="clearDrag" :aria-busy="loading" tabindex="0" aria-label="Agenda en hora de Ávila. Doble clic para crear una reserva.">
  <ClientOnly><VueCal :key="revision+':'+view" :selected-date="anchor" :active-view="view" :disable-views="['years','year','day']" hide-view-selector hide-title-bar locale="es" :events="events" :events-on-month-view="false" :editable-events="{title:false,drag:view==='week',resize:false,create:false,delete:false}" :time-from="range.start" :time-to="range.end" :time-step="60" :time-cell-height="81" :snap-to-time="10" :dblclick-to-navigate="false" :click-to-navigate="false" :cell-click-hold="false" :drag-to-create-event="false" :transitions="false" :on-event-click="select" @cell-dblclick="create" @event-drop="move">
   <template #weekday-heading="{heading}"><span>{{ heading.label }}<template v-if="view==='week'&&heading.date"> {{ heading.date.getDate() }}<small class="block text-xs text-muted">{{ dayMassageCount(rows,calendarDateText(heading.date)) }} masajes</small></template></span></template>
   <template #cell-content="{cell,view,events}"><template v-if="view.id==='month'"><div class="vuecal__cell-date">{{ cell.content }}</div><p class="mt-2 text-[13px] leading-[1.3] text-muted tabular-nums">{{ events.length }} {{ events.length===1?'cita':'citas' }}</p></template></template>
   <template #event="{event}"><div v-if="!event.background" role="button" tabindex="0" class="flex h-full w-full cursor-grab flex-col overflow-hidden px-1.5 py-1 text-left select-none focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink [&_span]:text-xs [&_span]:tabular-nums [&_strong]:text-sm [&_strong]:leading-[1.3] [&_strong]:[overflow-wrap:anywhere]" :aria-pressed="selectedId===event.id" @click.stop="select(event)" @keydown.enter.prevent="select(event)" @keydown.space.prevent="select(event)" @dblclick.stop><span>{{ label(event.id) }}</span><strong>{{ event.title }}</strong><span>{{ massages(event.id) }}</span></div><span v-else class="aurora-background-label block px-1 py-0.5 text-xs leading-[1.3]">{{ event.title }}</span></template>
  </VueCal><template #fallback><p class="calendar-feedback">Cargando agenda…</p></template></ClientOnly>
 </div>
 <Teleport to="body"><div v-if="dragPreview" class="pointer-events-none fixed right-3 bottom-3 z-[1000] flex flex-col gap-0.5 whitespace-nowrap rounded-lg bg-ink px-3 py-2 text-white shadow-[0_4px_16px_#064f5826]"><span class="text-[11px] leading-[1.3]">{{ dragPreview.day }}</span><strong class="text-[15px] leading-[1.3] tabular-nums">{{ dragPreview.time }}</strong></div></Teleport>
</template>
