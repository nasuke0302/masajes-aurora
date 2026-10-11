import {Miniflare} from 'miniflare'
import {readFile} from 'node:fs/promises'
import {resolve} from 'node:path'
const mf=new Miniflare({workers:[{config:{name:'local',compatibilityDate:'2026-10-11',env:{DB:{type:'d1',id:'00000000-0000-0000-0000-000000000001'}},manifest:{mainModule:'index.mjs',modules:{'index.mjs':{type:'esm',contents:'export default {fetch(){return new Response("local")}}'}}}}}],resourcePersistencePath:resolve('.data/d1')})
try{const db=await mf.getD1Database('DB');if(!await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'").first())await db.exec((await readFile('migrations/0001_booking.sql','utf8')).replace(/\n/g,' '));console.log('Local database ready. Booking remains closed until prices and hours are configured.')}finally{await mf.dispose()}

