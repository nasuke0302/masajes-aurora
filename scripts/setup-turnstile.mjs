import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {createRequire} from 'node:module'
import {dirname,join} from 'node:path'
import {readFile,writeFile} from 'node:fs/promises'
const run=promisify(execFile),cli=join(dirname(createRequire(import.meta.url).resolve('cf/package.json')),'bin/cf')
async function cf(args){try{const {stdout}=await run(process.execPath,[cli,...args],{env:{...process.env,DEBUG:'',CF_SEND_TELEMETRY:'false'},maxBuffer:4*1024*1024});return JSON.parse(stdout)}catch{throw new Error('TURNSTILE_CF_FAILED')}}
await run('git',['check-ignore','-q','.env.local'])
const domains=['aurora-staging.geonuvia.com','localhost','127.0.0.1'],name='Aurora Masajista staging bookings'
const widgets=await cf(['turnstile','widgets','list'])
let widget=widgets.find(w=>w.name===name)
if(widget)widget=await cf(['turnstile','widgets','get',widget.sitekey])
else widget=await cf(['turnstile','widgets','create','--body',JSON.stringify({name,domains,mode:'managed',clearance_level:'no_clearance'})])
if(widget.mode!=='managed'||domains.some(d=>!widget.domains.includes(d))||!widget.secret||!widget.sitekey)throw new Error('TURNSTILE_WIDGET_MISMATCH')
const result=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:widget.secret,response:'invalid-token-for-secret-check'}),signal:AbortSignal.timeout(10000)}).then(r=>r.json())
if(result.success||!result['error-codes']?.includes('invalid-input-response')||result['error-codes'].includes('invalid-input-secret'))throw new Error('TURNSTILE_SECRET_CHECK_FAILED')
let content=await readFile('.env.local','utf8')
for(const [key,value] of Object.entries({TURNSTILE_SITE_KEY:widget.sitekey,TURNSTILE_SECRET_KEY:widget.secret})){const pattern=new RegExp('^'+key+'=.*$','m');content=pattern.test(content)?content.replace(pattern,key+'='+value):content.trimEnd()+'\n'+key+'='+value+'\n'}
await writeFile('.env.local',content)
console.log('Turnstile Managed ready; secret validated and stored in ignored .env.local; sitekey: '+widget.sitekey)
