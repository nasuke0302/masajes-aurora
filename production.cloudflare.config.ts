import {bindings,defineConfig,defineWorker} from 'cf/config'
export default defineConfig(()=>({worker:defineWorker({
 name:'masajes-aurora',workersDev:false,previewUrls:false,
 domains:['auroramasajista.com','www.auroramasajista.com'],
 entrypoint:'./workers/marketing.mjs',compatibilityDate:'2026-10-11',
 assets:{runWorkerFirst:true,notFoundHandling:'404-page',htmlHandling:'drop-trailing-slash'},
 observability:{enabled:true,redactQueryString:true,traces:{enabled:true,headSamplingRate:0.1}},
 triggers:[],env:{ASSETS:bindings.assets()}
})}))
