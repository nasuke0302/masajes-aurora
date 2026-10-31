<script setup lang="ts">
const title = "Masajes de relajación y bienestar: guía para elegir | Aurora Masajista";
const headline = "Masajes de relajación y bienestar: qué son, qué esperar y qué tipos hay";
const description = [
  "Descubre qué es un masaje de bienestar, cómo suele ser una sesión,",
  "qué beneficios se le atribuyen y en qué se diferencian los principales tipos.",
].join(" ");
const published = "2026-10-31";
const origin = useRuntimeConfig().public.siteUrl || "https://auroramasajista.com";
const canonical = new URL("/blog/masajes-relajacion-bienestar", origin).href;
const home = new URL("/", origin).href;
const image = new URL("/images/masaje-cuerpo-completo-hero.png", origin).href;
const sourceUrls = {
  mayo: "https://www.mayoclinic.org/tests-procedures/massage-therapy/about/pac-20384595",
  anxiety: "https://www.nccih.nih.gov/health/anxiety-and-complementary-health-approaches",
  aromatherapy: "https://www.betterhealth.vic.gov.au/health/conditionsandtreatments/aromatherapy",
};

const sections = [
  { id: "que-son", label: "Qué son y qué no son" },
  { id: "que-esperar", label: "Qué esperar" },
  { id: "beneficios", label: "Beneficios atribuidos" },
  { id: "tipos", label: "Tipos de masaje" },
  { id: "fuentes", label: "Fuentes" },
];

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: "article",
  ogUrl: canonical,
  ogImage: image,
  ogImageAlt: "Imagen ilustrativa de un masaje de bienestar en un entorno doméstico.",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  articlePublishedTime: published,
  articleModifiedTime: published,
});
useHead({
  link: [{ rel: "canonical", href: canonical }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BlogPosting",
            "@id": canonical + "#articulo",
            headline,
            description,
            image: [image],
            datePublished: published,
            dateModified: published,
            inLanguage: "es-ES",
            mainEntityOfPage: canonical,
            author: { "@type": "Organization", name: "Aurora Masajista", url: home },
            publisher: { "@type": "Organization", name: "Aurora Masajista", url: home },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Inicio", item: home },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: new URL("/blog", origin).href,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Masajes de relajación y bienestar",
                item: canonical,
              },
            ],
          },
        ],
      }).replace(/</g, "\\u003c"),
    },
  ],
});
</script>

<template>
  <div class="break-words">
    <a class="absolute -top-24 left-5 z-10 bg-cream p-3 focus:top-3" href="#contenido">Saltar al contenido</a>
    <header :class="[
      'mx-auto flex w-full max-w-7xl flex-wrap items-center',
      'justify-between gap-6 px-5 py-5 sm:px-8 sm:py-8 lg:px-12',
    ]">
      <BrandLogo />
      <NuxtLink to="/" class="text-sm underline underline-offset-4 hover:text-coral sm:text-base">Volver a la web
      </NuxtLink>
    </header>

    <main id="contenido" class="text-justify">
      <div class="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <nav class="flex flex-wrap gap-2 py-4 text-sm text-muted" aria-label="Ruta de navegación">
          <NuxtLink to="/" class="underline underline-offset-4 hover:text-ink">Inicio</NuxtLink><span
            aria-hidden="true">/</span>
          <NuxtLink to="/blog" class="underline underline-offset-4 hover:text-ink">Blog</NuxtLink><span
            aria-hidden="true">/</span>
          <span aria-current="page">Masajes de relajación y bienestar</span>
        </nav>
        <div :class="[
          'grid gap-8 py-6 pb-12',
          'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center',
          'lg:gap-16 lg:py-8 lg:pb-16',
        ]">
          <div>
            <p class="mb-5 text-sm font-bold uppercase tracking-widest text-coral">
              Guía de bienestar
            </p>
            <h1 :class="[
              'max-w-[25ch] text-[clamp(2.4rem,4vw,3.6rem)] leading-[1.08]',
              'font-extrabold tracking-[-.035em] text-balance',
            ]">
              Masajes de relajación y bienestar:
              <span class="text-coral">qué son, qué esperar y qué tipos hay</span>
            </h1>
            <p class="mt-6 max-w-[56ch] text-xl leading-relaxed">
              Un masaje de relajación puede ser una forma de reservar un rato para ti y bajar el
              ritmo. Si nunca has recibido uno, esta guía te ayudará a elegir con más tranquilidad.
            </p>
            <p class="mt-6 text-sm text-muted">
              Aurora Masajista
              <span class="mx-1" aria-hidden="true">·</span>
              <time :datetime="published">octubre de 2026</time>
            </p>
          </div>
          <figure class="min-w-0">
            <img :class="[
              'block aspect-video h-auto w-full rounded-2xl object-cover',
              'object-[65%_center] lg:aspect-[4/5]',
            ]" src="/images/masaje-cuerpo-completo-hero-952.webp" width="952" height="528"
              alt="Imagen ilustrativa de un masaje de bienestar en casa." fetchpriority="high" />
            <figcaption class="mt-3 text-sm text-muted">Imagen ilustrativa.</figcaption>
          </figure>
        </div>
      </div>

      <div :class="[
        'mx-auto grid w-full max-w-7xl gap-8 border-t border-ink/15 px-5',
        'py-8 sm:px-8 lg:grid-cols-[14rem_minmax(0,70ch)] lg:items-start',
        'lg:gap-16 lg:px-12 lg:py-12',
      ]">
        <aside class="lg:sticky lg:top-8">
          <nav aria-labelledby="index-title">
            <h2 id="index-title" class="mb-4 text-base font-bold">
              En este artículo
            </h2>
            <ul class="grid gap-x-6 sm:grid-cols-2 lg:block">
              <li v-for="section in sections" :key="section.id">
                <a :class="[
                  'block py-2 leading-normal text-muted underline underline-offset-4',
                  'hover:text-ink',
                ]" :href="'#' + section.id">{{ section.label }}</a>
              </li>
            </ul>
          </nav>
        </aside>

        <article :class="[
          'min-w-0 max-w-[70ch] space-y-14 text-lg leading-[1.8]',
          '[&_section]:scroll-mt-8 [&_h2]:mb-5',
          '[&_h2]:text-[clamp(1.625rem,2.5vw,2rem)] [&_h2]:leading-tight',
          '[&_h2]:font-bold [&_h2]:tracking-tight [&_p+p]:mt-4 [&_ul]:my-6',
          '[&_ul]:list-disc [&_ul]:pl-5 [&_li+li]:mt-4',
          '[&_a:not(.landing-button)]:underline',
          '[&_a:not(.landing-button)]:underline-offset-4',
        ]">
          <section id="que-son">
            <h2>¿Qué son los masajes de relajación y bienestar? ¿Y qué no son?</h2>
            <p>
              Un masaje consiste en trabajar con las manos sobre tejidos blandos, como la piel y los
              músculos. Los movimientos y la presión varían según la técnica y la persona. Cuando el
              objetivo es el bienestar, se busca una experiencia cómoda y agradable, adaptada a tus
              preferencias. El
              <a href="https://www.nccih.nih.gov/health/massage-therapy-what-you-need-to-know">Centro Nacional de Salud
                Complementaria e Integral de Estados Unidos (NCCIH)</a>
              distingue entre el uso del masaje para favorecer el bienestar y su estudio en
              contextos de atención sanitaria.
            </p>
            <p>
              Un masaje de bienestar no es un diagnóstico ni sustituye la valoración de un
              profesional sanitario. Tampoco tienes que soportar dolor para que «funcione»: puedes
              pedir menos presión o detener la sesión si algo te incomoda. Si buscas atención por
              una lesión, dolor persistente u otro problema de salud, conviene acudir al profesional
              sanitario adecuado. El
              <a href="https://www.nccih.nih.gov/health/massage-therapy-what-you-need-to-know">NCCIH</a>
              aconseja no aplazar una consulta médica por recibir un masaje.
            </p>
          </section>

          <section id="que-esperar">
            <h2>¿Qué puedes esperar de una sesión?</h2>
            <p>
              Lo habitual es empezar hablando de las zonas que prefieres trabajar o evitar y de la
              presión que te resulta agradable. También conviene comunicar si tienes sensibilidad a
              algún producto o una circunstancia de salud que pueda influir en la sesión. Puedes
              pedir un cambio de ritmo o presión en cualquier momento. Se recomienda comunicar estas
              preferencias y no continuar con una presión que cause dolor intenso.
            </p>
            <p>
              En un masaje corporal puedes recibir atención general o dedicar más tiempo a
              determinadas zonas, según lo acordado. Antes de empezar deberían explicarte cómo
              acomodarte y qué productos se utilizarán. Al terminar, tómate el tiempo que necesites
              para incorporarte.
            </p>
          </section>

          <section id="beneficios">
            <h2>¿Qué beneficios se atribuyen a los masajes de bienestar?</h2>
            <p>
              Muchas personas buscan un masaje para sentirse más tranquilas, descansar un rato o
              notar menos tensión. La relajación es uno de sus posibles beneficios, aunque la
              experiencia varía de una persona a otra.
              <a :href="sourceUrls.mayo">Mayo Clinic</a>
              también recoge el alivio del estrés entre los efectos que se estudian.
            </p>
            <p>
              El masaje también puede ofrecer un momento para prestar atención a las zonas donde
              notas más tensión. Según
              <a :href="sourceUrls.mayo">Mayo Clinic</a>, entre sus posibles beneficios está el
              alivio de la rigidez muscular. La experiencia varía de una persona a otra, por lo que
              puedes indicar qué zonas prefieres trabajar y qué presión te resulta cómoda.
            </p>
          </section>

          <section id="tipos">
            <h2>¿Qué tipos de masaje hay?</h2>
            <p>
              «Masaje» reúne técnicas y objetivos diferentes. Conocer sus nombres ayuda a preguntar
              qué incluye cada servicio. Esta lista describe modalidades existentes:
            </p>
            <ul>
              <li>
                <strong>Relajante o clásico occidental.</strong> Suele combinar movimientos fluidos
                y una presión ajustable para favorecer una experiencia de calma. El
                <a href="https://www.nccih.nih.gov/health/massage-therapy-what-you-need-to-know">NCCIH</a>
                identifica el masaje sueco o clásico como una de las formas más comunes en países
                occidentales.
              </li>
              <li>
                <strong>Localizado.</strong> Dedica más atención a una zona, como espalda, cuello u
                hombros. Describe dónde se trabaja, más que una técnica concreta. Un masaje
                localizado no tiene por qué ser intenso.
              </li>
              <li>
                <strong>Con aromaterapia.</strong> Incorpora aceites aromáticos. Antes de recibirlo,
                pregunta qué productos se usarán y comunica alergias o sensibilidad a los aromas.
                Los aceites esenciales pueden irritar la piel y no son adecuados para todo el mundo,
                según <a :href="sourceUrls.aromatherapy">Better Health Channel</a>.
              </li>
              <li>
                <strong>Shiatsu y otras tradiciones orientales.</strong> Emplean formas de presión y
                secuencias propias, distintas de las del masaje clásico. El
                <a href="https://www.nccih.nih.gov/health/massage-therapy-what-you-need-to-know">NCCIH</a>
                las incluye entre los estilos de masaje.
              </li>
              <li>
                <strong>De tejido profundo o deportivo.</strong> Tienen enfoques diferentes de una
                sesión orientada principalmente a relajarse. La intensidad y la conveniencia de
                recibirlos deben valorarse individualmente: el masaje vigoroso puede implicar más
                riesgo para algunas personas, advierte el
                <a href="https://www.nccih.nih.gov/health/massage-therapy-what-you-need-to-know">NCCIH</a>.
              </li>
            </ul>
            <p>
              Reserva una sesión con Aurora y descubre en primera persona todos los beneficios de
              un masaje de bienestar.
            </p>
          </section>

          <section class="rounded-2xl bg-sage-light p-6 sm:p-8" aria-labelledby="contact-title">
            <h2 id="contact-title">Una sesión a tu ritmo, en tu casa</h2>
            <p>
              Si quieres recibir un masaje de bienestar en Ávila capital, habla con Aurora por
              WhatsApp para resolver tus dudas y acordar una cita.
            </p>
            <div class="mt-6">
              <ContactButton />
            </div>
          </section>

          <section id="fuentes" class="border-t border-ink/15 pt-8">
            <h2>Fuentes</h2>
            <ul class="text-base">
              <li>
                <a href="https://www.nccih.nih.gov/health/massage-therapy-what-you-need-to-know">NCCIH: masaje,
                  técnicas, evidencia y seguridad</a>.
              </li>
              <li><a :href="sourceUrls.anxiety">NCCIH: ansiedad y enfoques complementarios</a>.</li>
              <li>
                <a :href="sourceUrls.mayo">Mayo Clinic: masaje, beneficios y precauciones</a>.
              </li>
              <li>
                <a :href="sourceUrls.aromatherapy">Better Health Channel: aromaterapia y riesgos</a>.
              </li>
            </ul>
          </section>
        </article>
      </div>
    </main>

    <footer :class="[
      'mx-auto flex w-full max-w-7xl flex-wrap items-center',
      'justify-between gap-6 border-t border-ink/15 px-5 py-8 sm:px-8',
      'lg:px-12',
    ]">
      <NuxtLink to="/" class="underline underline-offset-4 hover:text-coral">Volver a Aurora Masajista</NuxtLink>
      <FooterLinks />
    </footer>
  </div>
</template>
