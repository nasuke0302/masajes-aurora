<script setup lang="ts">
import ContactButton from '../components/ContactButton.vue'
import { marketingPrice, marketingFirstSessionPrice, marketingFacialPrice, marketingCombinedPrice, marketingFirstCombinedPrice } from '#shared/marketing-offer'

const title = 'Masaje relajante en Ávila a domicilio | Aurora Masajista'
const headline = 'Masaje relajante en Ávila: una pausa de bienestar en tu casa'
const description = 'Qué esperar de un masaje relajante a domicilio en Ávila capital: sesión de 60 minutos, preferencias y cómo reservar con Aurora por WhatsApp.'
const published = '2026-10-25'
const modified = '2026-10-31'
const artworkSrcset = [480, 768, 952].map(width => `/images/masaje-cuerpo-completo-hero-${width}.webp ${width}w`).join(', ')
const origin = useRuntimeConfig().public.siteUrl || 'https://auroramasajista.com'
const canonical = new URL('/masaje-relajante-avila', origin).href
const home = new URL('/', origin).href
const image = new URL('/images/masaje-cuerpo-completo-hero.png', origin).href
const sections = [
  { id: 'que-es', label: 'Qué esperar del masaje' },
  { id: 'a-domicilio', label: 'Una sesión en tu casa' },
  { id: 'duracion', label: 'Duración y opciones' },
  { id: 'antes-de-la-visita', label: 'Antes de la visita' },
  { id: 'preguntas-frecuentes', label: 'Preguntas frecuentes' },
  { id: 'reservar', label: 'Acordar tu cita' },
]
useSeoMeta({
  title, description, ogTitle: title, ogDescription: description,
  ogType: 'article', ogUrl: canonical, ogImage: image,
  ogImageAlt: 'Imagen ilustrativa de un masaje de bienestar en un entorno doméstico.',
  twitterCard: 'summary_large_image', twitterTitle: title,
  twitterDescription: description, twitterImage: image,
  articlePublishedTime: published, articleModifiedTime: modified,
})
useHead({
  link: [{ rel: 'canonical', href: canonical }],
  script: [{
    type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@graph': [
        {
          '@type': 'BlogPosting', '@id': canonical + '#articulo',
          headline, description, image: [image], datePublished: published,
          dateModified: modified, inLanguage: 'es-ES', mainEntityOfPage: canonical,
          author: { '@type': 'Organization', name: 'Aurora Masajista', url: home },
          publisher: { '@type': 'Organization', name: 'Aurora Masajista', url: home },
        },
        {
          '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: home },
            { '@type': 'ListItem', position: 2, name: 'Masaje relajante en Ávila', item: canonical },
          ],
        },
      ],
    }).replace(/</g, '\\u003c')
  }],
})
</script>

<template>
  <div class="guide-page">
    <a class="guide-skip" href="#contenido">Saltar al contenido</a>
    <header class="guide-header guide-shell">
      <BrandLogo />
      <NuxtLink to="/" class="text-link">Volver a la web</NuxtLink>
    </header>
    <main id="contenido">
      <div class="guide-shell">
        <nav class="guide-breadcrumb" aria-label="Ruta de navegación">
          <NuxtLink to="/">Inicio</NuxtLink><span aria-hidden="true">/</span>
          <span aria-current="page">Masaje relajante en Ávila</span>
        </nav>
        <div class="guide-hero">
          <div>
            <h1>Masaje relajante en Ávila: <span>una pausa de bienestar en tu casa</span></h1>
            <p class="guide-lead">No siempre hace falta salir para dedicarte un momento. Un masaje a domicilio te
              permite acordar una sesión de bienestar en tu propio espacio, sin añadir desplazamientos a tu día.</p>
            <p class="guide-intro">En esta guía encontrarás qué puedes esperar, cómo preparar la visita y cómo reservar
              con Aurora. El servicio se realiza exclusivamente en Ávila capital, con cita previa.</p>
            <OfferSummary />
            <p class="guide-byline">
              <NuxtLink to="/#aurora">Aurora Masajista</NuxtLink><span aria-hidden="true">·</span>Actualizado el <time
                :datetime="modified">31 de octubre de 2026</time>
            </p>
            <ContactButton />
          </div>
          <figure class="guide-figure">
            <img src="/images/masaje-cuerpo-completo-hero-952.webp" :srcset="artworkSrcset"
              sizes="(max-width: 960px) 92vw, 520px" width="952" height="528"
              alt="Imagen ilustrativa de una sesión de masaje en un entorno doméstico luminoso." fetchpriority="high"
              decoding="async" />
            <figcaption>El bienestar también puede tener lugar en casa. Imagen ilustrativa.</figcaption>
          </figure>
        </div>
      </div>
      <div class="guide-reading guide-shell">
        <aside class="guide-index">
          <nav aria-labelledby="guide-index-title">
            <h2 id="guide-index-title">En esta guía</h2>
            <ul>
              <li v-for="section in sections" :key="section.id"><a :href="'#' + section.id">{{ section.label }}</a></li>
            </ul>
          </nav>
        </aside>
        <article class="guide-copy" aria-label="Guía de masaje relajante a domicilio">
          <section id="que-es">
            <h2>Qué esperar de un masaje relajante</h2>
            <p>Un masaje relajante de bienestar propone hacer una pausa y prestar atención a cómo te sientes. No se
              trata de seguir una intensidad fija: antes de empezar puedes explicar tus preferencias y, durante la
              sesión, comentar si quieres que se adapte el ritmo o la presión.</p>
            <p>Aurora ofrece masajes de bienestar, sin asistencia sanitaria, diagnóstico ni tratamiento médico. La
              sesión no sustituye una consulta ni se presenta como una forma de tratar lesiones. Lo que se acuerda es un
              tiempo de cuidado personal.</p>
          </section>
          <section id="a-domicilio">
            <h2>Cómo es una sesión a domicilio en Ávila</h2>
            <p>Todo empieza con una conversación. Contactas con Aurora, comentas qué sesión te interesa y acordáis el
              día, la hora y una dirección. La disponibilidad se confirma directamente; abrir
              WhatsApp o enviar una consulta no reserva un horario por sí solo.</p>
            <p>Antes del masaje hay un momento para hablar de tus preferencias. Puedes dedicar la sesión al cuerpo
              completo o dar más atención a zonas como la espalda y los hombros. La idea es que conozcas lo que vais a
              hacer y puedas comunicarte con tranquilidad en todo momento.</p>
            <p>Al realizarse en tu domicilio, no necesitas organizar un desplazamiento a un centro. Sí conviene elegir
              un momento en el que puedas disponer del espacio y del tiempo acordados, sin otras tareas pendientes
              durante la visita.</p>
          </section>
          <section id="duracion">
            <h2>Una sesión de 60 minutos</h2>
            <p>Es una sesión de bienestar que se adapta a las preferencias que comentes con Aurora; no un recorrido que
              tengas que aceptar
              sin poder pedir cambios.</p>
            <p>Si quieres completar ese momento, puedes consultar por el <strong>masaje facial opcional de 10 minutos
                extra</strong>. Se ofrece como complemento a la sesión de cuerpo completo, no como una reserva
              independiente.</p>
            <p>El facial cuesta <strong>{{ marketingFacialPrice }}</strong> y no tiene descuento.
              La sesión de 60 minutos con el facial suma 70 minutos y cuesta {{ marketingCombinedPrice }}, o {{
                marketingFirstCombinedPrice }} si es tu primera sesión.</p>
            <p>También puedes preguntar por una visita para varias personas en una misma dirección. Los masajes
              se realizan consecutivamente y es necesario acordar la duración total y la disponibilidad antes de
              confirmar. Puedes ver la <NuxtLink to="/#massage">presentación de los masajes</NuxtLink> en la portada.
            </p>
          </section>
          <section id="antes-de-la-visita">
            <h2>Qué conviene acordar antes de la visita</h2>
            <p>Una breve conversación previa ayuda a que el encuentro encaje en tu día. No necesitas decidirlo todo
              antes de escribir, pero sí dejar claros estos puntos al confirmar:</p>
            <ul>
              <li><strong>El horario y la duración.</strong> Indica qué días te vienen bien y si te interesa añadir el
                complemento facial.</li>
              <li><strong>La dirección y el acceso.</strong> Confirma que el domicilio está en Ávila capital y comenta
                las indicaciones necesarias para llegar.</li>
              <li><strong>El espacio.</strong> Prepara una zona libre de aproximadamente 3 × 2 metros. Aurora lleva todo
                lo necesario para el masaje.</li>
              <li><strong>Los productos.</strong> Si tienes alergia o sensibilidad a algún producto, coméntalo antes de
                reservar para revisar los ingredientes contigo.</li>
            </ul>
            <p>El precio total y los detalles de la visita se acuerdan antes de confirmar. Para cambiar o cancelar la
              cita, contacta con Aurora cuanto antes. Encontrarás más información en las <NuxtLink
                to="/condiciones-reserva">condiciones de reserva</NuxtLink>.</p>
          </section>
          <section id="preguntas-frecuentes">
            <h2>Preguntas frecuentes</h2>
            <h3>¿El servicio cubre toda la provincia de Ávila?</h3>
            <p>No. El servicio se realiza exclusivamente en Ávila capital. Al consultar, indica tu dirección
              para acordar los detalles de la visita.</p>
            <h3>¿Qué horarios hay disponibles?</h3>
            <p>El horario es de lunes a sábado, de 11:00 a 19:00, con flexibilidad horaria y siempre con
              reserva previa. La disponibilidad concreta se confirma directamente con Aurora.</p>
            <h3>¿Cuál es el precio de un masaje relajante a domicilio?</h3>
            <p>La sesión de 60 minutos cuesta <strong>{{ marketingPrice }}</strong>. En tu
              primera sesión pagas <strong>{{ marketingFirstSessionPrice }}</strong>. Los
              impuestos y el desplazamiento dentro de Ávila capital están incluidos. El facial opcional de 10 minutos
              cuesta {{ marketingFacialPrice }} adicionales y no tiene descuento.</p>

            <h3>¿Puedo reservar para varias personas?</h3>
            <p>Puedes consultar por varias personas en una misma dirección. Las sesiones se realizan una después
              de otra, por lo que es importante acordar el tiempo completo de la visita.</p>
            <p>La primera sesión de 60 minutos de cada persona cuesta {{ marketingFirstSessionPrice }}, tanto en reservas individuales como de grupo.</p>
            <h3>¿Necesito tener camilla o productos en casa?</h3>
            <p>No, solo necesitas preparar un
              espacio libre de aproximadamente 3 × 2 metros.</p>
            <h3>¿Cómo reservo?</h3>
            <p>Escribe por WhatsApp o llama al <a href="tel:+34644517187">+34 644 51 71 87</a>. La cita queda acordada
              cuando Aurora confirma contigo el servicio, el horario, la dirección y el importe.</p>
          </section>
          <section id="reservar" class="guide-booking">
            <h2>Tu próxima pausa empieza con una conversación</h2>
            <p>Si buscas un masaje relajante en Ávila capital y prefieres recibirlo en casa, cuéntale a Aurora qué día
              te viene bien. Podrás resolver tus dudas y acordar la sesión antes de reservar.</p>
            <OfferSummary />
            <ContactButton />
            <p class="guide-booking-contact">¿Prefieres llamar? <a href="tel:+34644517187">+34 644 51 71 87</a></p>
          </section>
        </article>
      </div>
    </main>
    <footer class="guide-footer guide-shell">
      <NuxtLink to="/" class="text-link">Volver a Aurora Masajista</NuxtLink>
      <LegalLinks />
    </footer>
  </div>
</template>

<style scoped>
.guide-page {
  overflow-wrap: break-word;
}

.guide-shell {
  width: min(100%, 80rem);
  margin-inline: auto;
  padding-inline: clamp(1.25rem, 4vw, 3rem);
}

.guide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding-block: 2rem;
}

.guide-skip {
  position: absolute;
  top: -6rem;
  left: 1.25rem;
  z-index: 10;
  padding: .75rem;
  background: var(--color-cream);
}

.guide-skip:focus {
  top: .75rem;
}

.guide-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  padding-block: 1rem;
  font-size: .875rem;
  color: var(--color-muted);
}

.guide-breadcrumb a,
.guide-byline a {
  text-decoration: underline;
  text-underline-offset: .2em;
}

.guide-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
  padding-block: 2rem 4.5rem;
}

h1 {
  max-width: 23ch;
  font-size: clamp(2.25rem, 4vw, 3.5rem);
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -.035em;
  text-wrap: balance;
}

h1 span {
  color: var(--color-coral);
}

.guide-lead {
  margin-top: 1.5rem;
  font-size: 1.25rem;
  line-height: 1.65;
}

.guide-intro {
  margin-top: 1rem;
  line-height: 1.7;
  color: var(--color-muted);
}

.guide-byline {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  margin-block: 1.5rem;
  font-size: .875rem;
  color: var(--color-muted);
}

.guide-figure {
  min-width: 0;
  margin: 0;
}

.guide-figure img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: 65% center;
  border-radius: 1rem;
}

.guide-figure figcaption {
  margin-top: .75rem;
  font-size: .8125rem;
  line-height: 1.6;
  color: var(--color-muted);
}

.guide-reading {
  display: grid;
  grid-template-columns: 14rem minmax(0, 70ch);
  gap: clamp(2rem, 6vw, 6rem);
  align-items: start;
  padding-block: 3rem 5rem;
  border-top: 1px solid #064f5826;
}

.guide-index {
  position: sticky;
  top: 2rem;
}

.guide-index h2 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.guide-index li+li {
  margin-top: .25rem;
}

.guide-index a {
  display: block;
  padding-block: .5rem;
  line-height: 1.5;
  text-decoration: underline;
  text-underline-offset: .2em;
  color: var(--color-muted);
}

.guide-index a:hover {
  color: var(--color-ink);
}

.guide-copy {
  min-width: 0;
  font-size: 1.125rem;
  line-height: 1.8;
  text-align: left;
}

.guide-copy section {
  scroll-margin-top: 2rem;
}

.guide-copy section+section {
  margin-top: 3.5rem;
}

.guide-copy h2 {
  margin-bottom: 1.25rem;
  font-size: clamp(1.625rem, 2.5vw, 2rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -.02em;
  text-wrap: balance;
}

.guide-copy h3 {
  margin-top: 2rem;
  font-size: 1.1875rem;
  font-weight: 700;
  line-height: 1.4;
}

.guide-copy p+p,
.guide-copy h3+p {
  margin-top: 1rem;
}

.guide-copy ul {
  margin-block: 1.5rem;
  padding-left: 1.25rem;
  list-style: disc;
}

.guide-copy li+li {
  margin-top: 1rem;
}

.guide-copy a:not(.landing-button) {
  text-decoration: underline;
  text-underline-offset: .2em;
}

.guide-booking {
  border-top: 1px solid #064f5826;
  padding-top: 2.5rem;
}

.guide-booking .landing-button {
  margin-top: 1.5rem;
}

.guide-copy .guide-booking-contact {
  margin-top: 1rem;
  font-size: 1rem;
}

.guide-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding-block: 2rem;
  border-top: 1px solid #064f5826;
}

@media (max-width: 60rem) {
  .guide-hero {
    grid-template-columns: 1fr;
  }

  h1 {
    max-width: 27ch;
  }

  .guide-figure img {
    aspect-ratio: 16 / 9;
  }

  .guide-reading {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .guide-index {
    position: static;
  }

  .guide-index ul {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 1.5rem;
  }

  .guide-copy {
    max-width: 70ch;
  }
}

@media (max-width: 36rem) {
  .guide-header {
    padding-block: 1.25rem;
  }

  .guide-header>.text-link {
    font-size: .875rem;
  }

  .guide-hero {
    padding-block: 1.5rem 3rem;
  }

  .guide-index ul {
    grid-template-columns: 1fr;
  }

  .guide-reading {
    padding-block: 2rem 3rem;
  }
}
</style>
