import {defineConfig,defineWorker} from 'cf/config'
export default defineConfig(()=>({worker:defineWorker({
 name:'masajes-aurora',workersDev:false,previewUrls:false,
 domains:['auroramasajista.com','www.auroramasajista.com'],
 compatibilityDate:'2026-10-11',
 assets:{runWorkerFirst:false,notFoundHandling:'404-page',htmlHandling:'drop-trailing-slash'},
 observability:{enabled:false,traces:{enabled:false}},
 triggers:[],env:{}
})}))
