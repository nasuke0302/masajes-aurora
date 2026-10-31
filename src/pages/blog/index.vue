<script setup lang="ts">
const title = 'Blog de masajes y bienestar en Ávila | Aurora Masajista'
const description = 'Guías de Aurora sobre masajes de bienestar, relajación y sesiones a domicilio en Ávila capital.'
const origin = useRuntimeConfig().public.siteUrl || 'https://auroramasajista.com'
const canonical = new URL('/blog', origin).href
const home = new URL('/', origin).href
const posts = [
  {
    to: '/blog/masajes-relajacion-bienestar',
    category: 'Bienestar',
    title: 'Masajes de relajación y bienestar: qué son, qué esperar y qué tipos hay',
    description: 'Una guía para entender en qué consiste una sesión, qué beneficios se le atribuyen y cómo se diferencian los tipos de masaje.',
    date: '2026-10-31',
    displayDate: 'octubre de 2026',
  },
  {
    to: '/blog/masaje-relajante-avila',
    category: 'A domicilio en Ávila',
    title: 'Masaje relajante en Ávila: una pausa de bienestar en tu casa',
    description: 'Cómo es una sesión con Aurora, qué necesitas preparar en casa y qué opciones puedes acordar antes de la visita.',
    date: '2026-10-25',
    displayDate: 'octubre de 2026',
  },
] as const

useSeoMeta({
  title, description, ogTitle: title, ogDescription: description,
  ogType: 'website', ogUrl: canonical,
  twitterCard: 'summary', twitterTitle: title, twitterDescription: description,
})
useHead({
  link: [{ rel: 'canonical', href: canonical }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Blog de masajes y bienestar',
      description,
      url: canonical,
      inLanguage: 'es-ES',
      isPartOf: { '@type': 'WebSite', name: 'Aurora Masajista', url: home },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: posts.map((post, index) => ({
          '@type': 'ListItem', position: index + 1, name: post.title,
          url: new URL(post.to, origin).href,
        })),
      },
    }).replace(/</g, '\\u003c'),
  }],
})
</script>

<template>
  <div class="min-h-screen break-words">
    <a class="absolute -top-24 left-5 z-10 bg-cream p-3 focus:top-3" href="#contenido">Saltar al contenido</a>
    <header class="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-5 sm:px-8 sm:py-8 lg:px-12">
      <BrandLogo />
      <NuxtLink to="/" class="text-sm underline underline-offset-4 hover:text-coral sm:text-base">Volver a la web</NuxtLink>
    </header>

    <main id="contenido" class="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:px-12">
      <nav class="flex flex-wrap gap-2 py-4 text-sm text-muted" aria-label="Ruta de navegación">
        <NuxtLink to="/" class="underline underline-offset-4 hover:text-ink">Inicio</NuxtLink><span aria-hidden="true">/</span>
        <span aria-current="page">Blog</span>
      </nav>
      <div class="mt-6 rounded-3xl bg-sage-light px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
        <p class="mb-5 text-sm font-bold uppercase tracking-widest text-coral">El blog de Aurora</p>
        <h1 class="max-w-[18ch] text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.08] font-extrabold tracking-[-.04em] text-balance">Masajes y bienestar <span class="text-coral">para tu día a día.</span></h1>
        <p class="mt-6 max-w-[58ch] text-lg leading-relaxed text-muted sm:text-xl">Aquí encontrarás respuestas claras sobre los masajes de bienestar y cómo disfrutar de una sesión a domicilio en Ávila capital.</p>
      </div>

      <section aria-labelledby="entries-title" class="mx-auto max-w-5xl pt-14 sm:pt-20">
        <h2 id="entries-title" class="mb-8 text-2xl font-bold sm:text-3xl">Todas las entradas</h2>
        <div class="divide-y divide-ink/15 border-y border-ink/15">
          <article v-for="post in posts" :key="post.to" class="grid gap-5 py-8 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-10 sm:py-10">
            <div class="text-sm leading-relaxed text-muted">
              <p class="font-semibold text-coral">{{ post.category }}</p>
              <time :datetime="post.date">{{ post.displayDate }}</time>
            </div>
            <div>
              <h3 class="max-w-[36ch] text-[clamp(1.5rem,2.5vw,2rem)] leading-tight font-bold tracking-tight text-balance">
                <NuxtLink :to="post.to" class="underline-offset-4 hover:text-coral hover:underline">{{ post.title }}</NuxtLink>
              </h3>
              <p class="mt-4 max-w-[65ch] text-base leading-relaxed text-muted">{{ post.description }}</p>
              <NuxtLink :to="post.to" class="mt-5 inline-flex min-h-11 items-center font-semibold underline underline-offset-4 hover:text-coral" :aria-label="`Leer: ${post.title}`">Leer artículo <span aria-hidden="true" class="ml-2">→</span></NuxtLink>
            </div>
          </article>
        </div>
      </section>
    </main>

    <footer class="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-6 border-t border-ink/15 px-5 py-8 sm:px-8 lg:px-12">
      <NuxtLink to="/" class="underline underline-offset-4 hover:text-coral">Volver a Aurora Masajista</NuxtLink>
      <FooterLinks />
    </footer>
  </div>
</template>
