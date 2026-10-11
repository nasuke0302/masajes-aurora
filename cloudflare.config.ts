import { bindings, defineConfig, defineWorker, triggers } from 'cf/config'
export default defineConfig(({ mode }) => ({
 worker: defineWorker({
  name: mode === 'production' ? 'masajes-aurora' : 'masajes-aurora-staging',
  domains: process.env.WORKER_DOMAIN ? [process.env.WORKER_DOMAIN] : undefined,
  entrypoint: './.output/server/index.mjs', compatibilityDate: '2026-10-11', compatibilityFlags: ['nodejs_compat'],
  assets: { runWorkerFirst: true },
  observability: { enabled: true, redactQueryString: true, traces: { enabled: true, headSamplingRate: 0.1 } },
  triggers: [triggers.scheduled({ schedule: '* * * * *' })],
  env: {
   ASSETS: bindings.assets(),
   DB: bindings.d1({ id: process.env.D1_DATABASE_ID || '00000000-0000-0000-0000-000000000001', dev: { remote: false } }),
   NOTIFICATIONS: bindings.queue<{ id: string }>({ name: process.env.NOTIFICATIONS_QUEUE || 'masajes-aurora-notifications-staging' }),
   SITE_URL: bindings.text(process.env.SITE_URL || 'http://localhost:3000'),
   ADMIN_EMAIL: bindings.text(process.env.ADMIN_EMAIL || ''), EMAIL_FROM: bindings.text(process.env.EMAIL_FROM || ''),
   STRIPE_SECRET_KEY: bindings.secret(), STRIPE_WEBHOOK_SECRET: bindings.secret(), STRIPE_PAYMENT_CONFIGURATION: bindings.text(process.env.STRIPE_PAYMENT_CONFIGURATION || '')
  }
 })
}))

