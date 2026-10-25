import {spawn} from 'node:child_process'
import {resolve,dirname,join} from 'node:path'
import {mkdir,writeFile,unlink,readFile} from 'node:fs/promises'
import {readBuildOutput} from '@cloudflare/build-output-utils'
import {createRequire} from 'node:module'
import {ensureAccess} from './setup-access.mjs'
const require=createRequire(import.meta.url)
const mode=process.argv.includes('--production')?'production':'staging'
try{process.loadEnvFile(mode==='production'?'.env.production.local':'.env.local')}catch(e){if(e.code!=='ENOENT')throw e}
const required=mode==='production'?['SITE_URL','WORKER_DOMAIN','CLOUDFLARE_ACCOUNT_ID']:['SITE_URL','D1_DATABASE_ID','ADMIN_EMAIL','EMAIL_FROM','NOTIFICATIONS_QUEUE','RESEND_API_KEY','TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY']
const missing=required.filter(k=>!process.env[k])
if(missing.length)throw new Error('Configure before deployment: '+missing.join(', '))
if(!process.env.SITE_URL.startsWith('https://')||process.env.D1_DATABASE_ID==='00000000-0000-0000-0000-000000000001')throw new Error('INVALID_DEPLOYMENT_TARGET')
if(mode==='production'&&process.env.DEPLOY_PRODUCTION!=='true')throw new Error('Set DEPLOY_PRODUCTION=true after staging verification')
if(mode==='production'&&new URL(process.env.SITE_URL).hostname!==process.env.WORKER_DOMAIN)throw new Error('PRODUCTION_HOST_MISMATCH')
const cli=join(dirname(require.resolve('cf/package.json')),'bin/cf')
async function run(args,cwd=process.cwd()){await new Promise((res,rej)=>{const p=spawn(process.execPath,args,{cwd,stdio:'inherit',env:{...process.env,CF_SEND_TELEMETRY:'false',DEBUG:''}});p.on('error',rej);p.on('exit',code=>code===0?res():rej(new Error('DEPLOY_COMMAND_FAILED')))})}
if(mode==='staging'){const access=await ensureAccess(false);if(new URL(process.env.SITE_URL).hostname!==access.host||process.env.WORKER_DOMAIN!==access.host)throw new Error('ACCESS_HOST_MISMATCH')}
await run(['--import','tsx','scripts/build-cloudflare.mjs',...(mode==='production'?['--production']:[])])
if(mode==='production'){
 const packageRoot=resolve('.cloudflare/production'),built=await readBuildOutput(packageRoot)
 if(JSON.parse(await readFile(join(packageRoot,'profile.json'),'utf8')).profile!=='production'||Object.keys(built.workers).length!==1||built.workers.default.config.name!=='masajes-aurora')throw new Error('WRONG_PRODUCTION_ARTIFACT')
 await run([resolve('scripts/test-production.mjs')])
 // The assets-only artifact relies on the edge redirect and abuse rules; do not deploy without them.
 await run([resolve('scripts/setup-production-security.mjs')])
 await run([cli,'deploy','--mode','production','--prebuilt'],packageRoot)
 process.exit(0)
}
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

