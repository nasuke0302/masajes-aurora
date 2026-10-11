import { bindings, defineConfig, defineWorker, triggers } from 'cf/config'
import {readFileSync,existsSync} from 'node:fs'
const accessPath=new URL('./config/access.json',import.meta.url)
const access=existsSync(accessPath)?JSON.parse(readFileSync(accessPath,'utf8')):{}
export default defineConfig(({ mode }) => ({
 worker: defineWorker({
  name: mode === 'production' ? 'masajes-aurora' : 'masajes-aurora-staging',
  workersDev:false, previewUrls:false,
  domains: process.env.WORKER_DOMAIN ? [process.env.WORKER_DOMAIN] : undefined,
  entrypoint: './.output/server/index.mjs', compatibilityDate: '2026-10-11', compatibilityFlags: ['nodejs_compat'],
  assets: { runWorkerFirst: true },
  observability: { enabled: true, redactQueryString: true, traces: { enabled: true, headSamplingRate: 0.1 } },
  triggers: [triggers.scheduled({ schedule: '* * * * *' })],
  env: {
   LOCAL_DEV:bindings.text('false'),
   ACCESS_TEAM_DOMAIN:bindings.text(access.teamDomain||''), ACCESS_AUD:bindings.text(access.audience||''), ACCESS_EMAIL:bindings.text(access.email||''),
   ASSETS: bindings.assets(),
   DB: bindings.d1({ id: process.env.D1_DATABASE_ID || '00000000-0000-0000-0000-000000000001', dev: { remote: false } }),
   NOTIFICATIONS: bindings.queue<{ id: string }>({ name: process.env.NOTIFICATIONS_QUEUE || 'masajes-aurora-notifications-staging' }),
   SITE_URL: bindings.text(process.env.SITE_URL || 'http://localhost:3000'),
   ADMIN_EMAIL: bindings.text(process.env.ADMIN_EMAIL || ''), EMAIL_FROM: bindings.text(process.env.EMAIL_FROM || ''),
   STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? bindings.secret() : bindings.text(''), STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? bindings.secret() : bindings.text(''), STRIPE_PAYMENT_CONFIGURATION: bindings.text(process.env.STRIPE_PAYMENT_CONFIGURATION || '')
  }
 })
}))

