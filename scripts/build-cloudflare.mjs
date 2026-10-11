import {resolve,dirname} from 'node:path'
import {readFile,cp,mkdir,rename} from 'node:fs/promises'
import {spawn} from 'node:child_process'
import {createRequire} from 'node:module'
import {loadAndParseConfig} from '@cloudflare/config'
import {cleanBuildOutputDir,writeRootConfig,writeWorkerConfig,writeAssets,getWorkerBundleDir,readBuildOutput} from '@cloudflare/build-output-utils'
import {build} from 'esbuild'
const require=createRequire(import.meta.url),root=process.cwd(),mode=process.argv.includes('--production')?'production':'staging'
try{process.loadEnvFile('.env.local')}catch(e){if(e.code!=='ENOENT')throw e}
process.env.NODE_ENV='production'
await new Promise((res,rej)=>{const p=spawn(process.execPath,[resolve('node_modules/@nuxt/cli/bin/nuxi.mjs'),'build','--dotenv','.env.local'],{stdio:'inherit',env:{...process.env,DEBUG:''}});p.on('error',rej);p.on('exit',code=>code===0?res():rej(new Error('Nuxt build failed')))})
// The fixed build directory is inside the explicitly selected project.
if(dirname(resolve(root,'.cloudflare/output'))!==resolve(root,'.cloudflare'))throw new Error('INVALID_BUILD_PATH')
await cleanBuildOutputDir(root)
const main=await loadAndParseConfig(resolve('cloudflare.config.ts'),{mode,isPreview:false})
const mail=await loadAndParseConfig(resolve('notifications.cloudflare.config.ts'),{mode,isPreview:false})
if(!main.result.success||!mail.result.success)throw new Error('INVALID_CLOUDFLARE_CONFIG')
await writeRootConfig(root,Object.fromEntries(Object.entries(main.result.data).filter(([k])=>!["worker","containers"].includes(k))),{mode,isPreview:false})
const bundle=getWorkerBundleDir(root)
await mkdir(bundle,{recursive:true});await cp(resolve('.output/server'),bundle,{recursive:true})
await rename(resolve(bundle,'index.mjs'),resolve(bundle,'nuxt.mjs'))
await cp(resolve('workers/http-guard.mjs'),resolve(bundle,'index.mjs'))
await writeAssets({root,sourceDirectory:resolve('.output/public')})
await writeWorkerConfig({root,config:main.result.data.worker,manifest:{type:'partial',mainModule:'index.mjs',modules:{}}})
const mailBundle=getWorkerBundleDir(root,'email');await mkdir(mailBundle,{recursive:true})
await build({entryPoints:['workers/notifications.ts'],outfile:resolve(mailBundle,'index.mjs'),bundle:true,format:'esm',platform:'neutral',target:'es2022'})
await writeWorkerConfig({root,directoryName:'email',config:mail.result.data.worker,manifest:{type:'complete',mainModule:'index.mjs',modules:{'index.mjs':{type:'esm'}}}})
const verified=await readBuildOutput(root)
if(Object.keys(verified.workers).length!==2)throw new Error('INCOMPLETE_BUILD')
console.log('Cloudflare package verified: web + email ('+mode+')')

