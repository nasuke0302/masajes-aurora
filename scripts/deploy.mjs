import {spawn} from 'node:child_process'
import {resolve,dirname,join} from 'node:path'
import {mkdir,writeFile,unlink} from 'node:fs/promises'
import {createRequire} from 'node:module'
import {ensureAccess} from './setup-access.mjs'
const require=createRequire(import.meta.url)
try{process.loadEnvFile('.env.local')}catch(e){if(e.code!=='ENOENT')throw e}
const mode=process.argv.includes('--production')?'production':'staging'
const required=['SITE_URL','D1_DATABASE_ID','ADMIN_EMAIL','EMAIL_FROM','NOTIFICATIONS_QUEUE','RESEND_API_KEY','TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY']
const missing=required.filter(k=>!process.env[k])
if(missing.length)throw new Error('Configure before deployment: '+missing.join(', '))
if(!process.env.SITE_URL.startsWith('https://')||process.env.D1_DATABASE_ID==='00000000-0000-0000-0000-000000000001')throw new Error('INVALID_DEPLOYMENT_TARGET')
if(mode==='production'&&process.env.DEPLOY_PRODUCTION!=='true')throw new Error('Set DEPLOY_PRODUCTION=true after staging verification')
if(mode==='production'&&process.env.NOTIFICATIONS_QUEUE.endsWith('-staging'))throw new Error('PRODUCTION_QUEUE_MUST_BE_SEPARATE')
const cli=join(dirname(require.resolve('cf/package.json')),'bin/cf')
async function run(args){await new Promise((res,rej)=>{const p=spawn(process.execPath,args,{stdio:'inherit',env:{...process.env,CF_SEND_TELEMETRY:'false',DEBUG:''}});p.on('error',rej);p.on('exit',code=>code===0?res():rej(new Error('DEPLOY_COMMAND_FAILED')))})}
if(mode==='staging'){const access=await ensureAccess(false);if(new URL(process.env.SITE_URL).hostname!==access.host||process.env.WORKER_DOMAIN!==access.host)throw new Error('ACCESS_HOST_MISMATCH')}
await run(['--import','tsx','scripts/build-cloudflare.mjs',...(mode==='production'?['--production']:[])])
// Upload only the explicitly selected secrets to each Worker.
let secretFile,mailSecretFile
try{
 await mkdir('.data',{recursive:true});mailSecretFile=resolve('.data','email-secrets-'+crypto.randomUUID()+'.json')
 await writeFile(mailSecretFile,JSON.stringify({RESEND_API_KEY:process.env.RESEND_API_KEY}),{mode:0o600})
 secretFile=resolve('.data','deploy-secrets-'+crypto.randomUUID()+'.json')
 await writeFile(secretFile,JSON.stringify({TURNSTILE_SECRET_KEY:process.env.TURNSTILE_SECRET_KEY}),{mode:0o600})
// Uploaded Worker secrets are managed with cf; .env.local is never sent as a secrets file.
await run([cli,'deploy','--mode',mode,'--prebuilt','--worker',mode==='production'?'masajes-aurora-email':'masajes-aurora-email-staging','--secrets-file',mailSecretFile])
await run([cli,'deploy','--mode',mode,'--prebuilt',...(secretFile?['--secrets-file',secretFile]:[])])
}finally{if(secretFile)await unlink(secretFile);if(mailSecretFile)await unlink(mailSecretFile)}

