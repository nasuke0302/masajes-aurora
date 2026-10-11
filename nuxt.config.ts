import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
 compatibilityDate: '2026-10-11', devtools: { enabled: false },
 srcDir: 'src/', serverDir: 'server', css: ['~/style.css'],
 components: [{ path: '~/components', pathPrefix: false }],
 vite: { plugins: [tailwindcss()] },
 nitro: { preset: process.env.NODE_ENV === 'development' ? 'node-server' : 'cloudflare_module', plugins: process.env.NODE_ENV === 'development' ? ['./dev/local.ts'] : [], cloudflare: { deployConfig: false, nodeCompat: true } },
 runtimeConfig: { public: { siteUrl: process.env.SITE_URL || '', animatedMarble: (process.env.ANIMATED_MARBLE || process.env.VITE_ANIMATED_MARBLE) === 'true' } },
 app: { head: { htmlAttrs: { lang: 'es' }, title: 'Masajes Aurora · Masajes a domicilio en Ávila', meta: [{ name: 'theme-color', content: '#064f58' }, { name: 'description', content: 'Masajes de 40 y 60 minutos a domicilio en Ávila capital. Reserva una sesión para ti o para varias personas, sin crear una cuenta.' }], link: [{ rel: 'icon', href: '/favicon.svg' }] } },
 typescript: { typeCheck: false, strict: true },
 routeRules: { '/admin/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' } }, '/reserva/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } }, '/api/**': { headers: { 'Cache-Control': 'no-store' } } }
})


