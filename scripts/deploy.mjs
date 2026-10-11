import {spawn} from 'node:child_process'
import {resolve,dirname,join} from 'node:path'
import {mkdir,writeFile,unlink} from 'node:fs/promises'
import {createRequire} from 'node:module'
const require=createRequire(import.meta.url)
try{process.loadEnvFile('.env.local')}catch(e){if(e.code!=='ENOENT')throw e}
const mode=process.argv.includes('--production')?'production':'staging'
const required=['SITE_URL','D1_DATABASE_ID','ADMIN_EMAIL','EMAIL_FROM','NOTIFICATIONS_QUEUE']
const missing=required.filter(k=>!process.env[k])
if(missing.length)throw new Error('Configure before deployment: '+missing.join(', '))
if(!process.env.SITE_URL.startsWith('https://')||process.env.D1_DATABASE_ID==='00000000-0000-0000-0000-000000000001')throw new Error('INVALID_DEPLOYMENT_TARGET')
if(mode==='production'&&process.env.DEPLOY_PRODUCTION!=='true')throw new Error('Set DEPLOY_PRODUCTION=true after staging verification')
if(mode==='production'&&process.env.NOTIFICATIONS_QUEUE.endsWith('-staging'))throw new Error('PRODUCTION_QUEUE_MUST_BE_SEPARATE')
const keys=['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_PAYMENT_CONFIGURATION']
if(keys.some(k=>process.env[k])&&!keys.every(k=>process.env[k]))throw new Error('Configure all Stripe variables, or none for cash-only launch')
if(process.env.STRIPE_SECRET_KEY&&!new RegExp('^(sk|rk)_'+(mode==='production'?'live':'test')+'_').test(process.env.STRIPE_SECRET_KEY))throw new Error('STRIPE_MODE_MISMATCH')
const cli=join(dirname(require.resolve('cf/package.json')),'bin/cf')
async function run(args){await new Promise((res,rej)=>{const p=spawn(process.execPath,args,{stdio:'inherit',env:{...process.env,CF_SEND_TELEMETRY:'false',DEBUG:''}});p.on('error',rej);p.on('exit',code=>code===0?res():rej(new Error('DEPLOY_COMMAND_FAILED')))})}
await run(['--import','tsx','scripts/build-cloudflare.mjs',...(mode==='production'?['--production']:[])])
// Only payment secrets are uploaded; other local variables never enter the secret file.
let secretFile
try{
 if(keys.every(k=>process.env[k])){
  await mkdir('.data',{recursive:true});secretFile=resolve('.data','deploy-secrets-'+crypto.randomUUID()+'.json')
  await writeFile(secretFile,JSON.stringify({STRIPE_SECRET_KEY:process.env.STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET:process.env.STRIPE_WEBHOOK_SECRET}),{mode:0o600})
 }
// Uploaded Worker secrets are managed with cf; .env.local is never sent as a secrets file.
await run([cli,'deploy','--mode',mode,'--prebuilt','--worker',mode==='production'?'masajes-aurora-email':'masajes-aurora-email-staging'])
await run([cli,'deploy','--mode',mode,'--prebuilt',...(secretFile?['--secrets-file',secretFile]:[])])
}finally{if(secretFile)await unlink(secretFile)}

