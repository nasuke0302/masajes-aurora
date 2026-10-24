import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {createRequire} from 'node:module'
import {dirname,join} from 'node:path'
import {mkdir,writeFile,readFile} from 'node:fs/promises'
const execute=promisify(execFile),cli=join(dirname(createRequire(import.meta.url).resolve('cf/package.json')),'bin/cf')
export async function cf(args){try{const {stdout}=await execute(process.execPath,[cli,...args],{env:{...process.env,DEBUG:'',CF_SEND_TELEMETRY:'false'},maxBuffer:4*1024*1024});return JSON.parse(stdout)}catch{throw new Error('CF_ACCESS_COMMAND_FAILED: '+args.slice(0,4).join(' '))}}
const host='aurora-staging.geonuvia.com',email='albertoesquivelanias@gmail.com'
export async function ensureAccess(create=false){
 const apps=await cf(['zero-trust','access','applications','list'])
 const source=apps.find(a=>a.domain==='staging.geonuvia.com')
 if(!source||source.policies.length!==1||source.policies[0].decision!=='allow'||JSON.stringify(source.policies[0].include)!==JSON.stringify([{email:{email}}]))throw new Error('GEONUVIA_OWNER_POLICY_MISMATCH')
 const providers=await cf(['zero-trust','identity-providers','list'])
 const otp=providers.find(p=>p.type==='onetimepin'&&source.allowed_idps.includes(p.id))
 if(!otp)throw new Error('GEONUVIA_OTP_NOT_FOUND')
 if(apps.some(a=>a.domain.startsWith(host+'/')))throw new Error('ACCESS_SUBPATH_OVERRIDE')
 let app=apps.find(a=>a.domain===host)
 if(!app){
  if(!create)throw new Error('RUN_SETUP_ACCESS_FIRST')
  const policies=await cf(['zero-trust','access','policies','list'])
  let policy=policies.find(p=>p.name==='Aurora staging owner only')
  if(!policy)policy=await cf(['zero-trust','access','policies','create','--body',JSON.stringify({name:'Aurora staging owner only',decision:'allow',include:[{email:{email}}],exclude:[],require:[]})])
  if(policy.decision!=='allow'||JSON.stringify(policy.include)!==JSON.stringify([{email:{email}}])||!policy.reusable)throw new Error('AURORA_POLICY_MISMATCH')
  app=await cf(['zero-trust','access','applications','create','--body',JSON.stringify({name:'Aurora Masajista staging',type:'self_hosted',domain:host,self_hosted_domains:[host],allowed_idps:[otp.id],app_launcher_visible:false,session_duration:source.session_duration,http_only_cookie_attribute:true,options_preflight_bypass:false,policies:[{id:policy.id,precedence:1}]})])
 }
 app=await cf(['zero-trust','access','applications','get',app.id])
 if(app.policies.length!==1||app.policies[0].decision!=='allow'||JSON.stringify(app.policies[0].include)!==JSON.stringify([{email:{email}}])||(app.policies[0].exclude||[]).length||(app.policies[0].require||[]).length||!app.policies[0].reusable||app.allowed_idps.length!==1||app.allowed_idps[0]!==otp.id)throw new Error('AURORA_ACCESS_MISMATCH')
 const org=await cf(['zero-trust','organization','get'])
 const config={host,email,teamDomain:org.auth_domain.replace(/^https:\/\//,'').replace(/\/$/,''),audience:app.aud,applicationId:app.id}
 if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(config.teamDomain)||!config.audience)throw new Error('ACCESS_CONFIG_INVALID')
 if(create){await mkdir('config',{recursive:true});await writeFile('config/access.json',JSON.stringify(config,null,2)+'\n')}
 else {const saved=JSON.parse(await readFile('config/access.json','utf8'));if(JSON.stringify(config)!==JSON.stringify(saved))throw new Error('ACCESS_CONFIG_DRIFT')}
 console.log('Verified Aurora Access: OTP, owner only, '+host)
 return config
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/setup-access.mjs'))await ensureAccess(true)
