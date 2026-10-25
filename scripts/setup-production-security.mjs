import assert from 'node:assert/strict'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {createRequire} from 'node:module'
import {dirname,join,resolve} from 'node:path'
import {mkdir,readFile,writeFile} from 'node:fs/promises'

const execute=promisify(execFile)
const cli=join(dirname(createRequire(import.meta.url).resolve('cf/package.json')),'bin/cf')
const policy=JSON.parse(await readFile(new URL('../config/production-security.json',import.meta.url),'utf8'))
assert.equal(policy.zone,'auroramasajista.com')
const apply=process.argv.includes('--apply')
const validate=process.argv.includes('--validate')
async function cf(args,{missing=false}={}){
 try{
  const {stdout}=await execute(process.execPath,[cli,...args],{env:{...process.env,CF_SEND_TELEMETRY:'false',DEBUG:''},maxBuffer:4*1024*1024})
  return stdout.trim()?JSON.parse(stdout):null
 }catch(error){
  if(missing&&/could not find entrypoint ruleset/.test(error.stderr||'')&&/404 Not Found/.test(error.stderr||''))return null
  throw new Error(`cf ${args.slice(0,4).join(' ')} failed: ${error.stderr||error.message}`)
 }
}
function writable(rule){const {version,last_updated,...rest}=rule;return rest}
function merge(current,desired){
 const rules=(current?.rules||[]).map(writable)
 for(const rule of desired){
  const i=rules.findIndex(existing=>existing.ref===rule.ref)
  if(i<0)rules.push(rule)
  else rules[i]={...rule,...(rules[i].id?{id:rules[i].id}:{})}
 }
 return rules
}
const entries=[]
for(const [phase,desired] of Object.entries(policy.phases)){
 const current=await cf(['rulesets','entrypoint','get',phase,'--zone',policy.zone],{missing:true})
 const body={name:current?.name||desired.name,rules:merge(current,desired.rules)}
 entries.push({phase,current,body,desired})
}
if(apply||validate){
 // Validate every phase before changing any of them. Never remove unrelated rules.
 for(const {phase,body} of entries)await cf(['rulesets','entrypoint','update',phase,'--zone',policy.zone,'--body',JSON.stringify(body),'--validate-only'])
 console.log('Cloudflare validated redirect, firewall and rate-limit rules')
}
if(apply){
 const backup=resolve('.data/security-backups',new Date().toISOString().replaceAll(':','-'))
 await mkdir(backup,{recursive:true})
 await writeFile(join(backup,'before.json'),JSON.stringify({zone:policy.zone,entries},null,2)+'\n')
 for(const {phase,current,body} of entries){
  const latest=await cf(['rulesets','entrypoint','get',phase,'--zone',policy.zone],{missing:true})
  assert.equal(latest?.version,current?.version,`Concurrent change in ${phase}; rerun instead of overwriting`)
  await cf(['rulesets','entrypoint','update',phase,'--zone',policy.zone,'--body',JSON.stringify(body)])
 }
 console.log('Applied Aurora-only rules; previous rules saved in '+backup)
}
if(!validate||apply){
 for(const {phase,desired} of entries){
  const live=await cf(['rulesets','entrypoint','get',phase,'--zone',policy.zone])
  for(const rule of desired.rules){
   const actual=live.rules.find(r=>r.ref===rule.ref)
   assert(actual,`Missing rule ${rule.ref}`)
   for(const key of Object.keys(rule))assert.deepEqual(actual[key],rule[key],`${rule.ref}.${key}`)
  }
  console.log('Verified '+phase+': '+desired.rules.map(r=>r.ref).join(', '))
 }
 const alerts=await cf(['alerting','policies','list'])
 assert(alerts.some(a=>a.enabled&&a.alert_type==='billing_budget_alert'&&a.filters?.total_spend_dollars?.includes('2')),'Expected existing $2 budget alert')
 console.log('Verified existing $2 usage alert (notification only, not a spending cap)')
}
