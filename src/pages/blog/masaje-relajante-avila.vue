<script setup lang="ts">
import ContactButton from "../../components/ContactButton.vue";
import {
  marketingPrice,
  marketingFirstSessionPrice,
  marketingFacialPrice,
  marketingCombinedPrice,
  marketingFirstCombinedPrice,
} from "#shared/marketing-offer";

const title = "Masaje relajante en Ávila a domicilio | Aurora Masajista";
const headline = "Masaje relajante en Ávila: una pausa de bienestar en tu casa";
const description = [
  "Qué esperar de un masaje relajante a domicilio en Ávila capital:",
  "sesión de 60 minutos, preferencias y cómo reservar con Aurora por WhatsApp.",
].join(" ");
const published = "2026-10-25";
const modified = "2026-10-31";
const artworkSrcset = [480, 768, 952]
  .map((width) => `/images/masaje-cuerpo-completo-hero-${width}.webp ${width}w`)
  .join(", ");
const origin = useRuntimeConfig().public.siteUrl || "https://auroramasajista.com";
const canonical = new URL("/blog/masaje-relajante-avila", origin).href;
const home = new URL("/", origin).href;
const image = new URL("/images/masaje-cuerpo-completo-hero.png", origin).href;
const sections = [
  { id: "que-es", label: "Qué esperar del masaje" },
  { id: "a-domicilio", label: "Una sesión en tu casa" },
  { id: "duracion", label: "Duración y opciones" },
  { id: "antes-de-la-visita", label: "Antes de la visita" },
  { id: "preguntas-frecuentes", label: "Preguntas frecuentes" },
  { id: "reservar", label: "Acordar tu cita" },
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
  articleModifiedTime: modified,
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
            dateModified: modified,
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
                name: "Masaje relajante en Ávila",
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
    <a
      class="absolute -top-24 left-5 z-10 bg-cream p-3 focus:top-3"
      href="#contenido"
      >Saltar al contenido</a
    >
    <header
      :class="[
        'mx-auto flex w-full max-w-7xl flex-wrap items-center',
        'justify-between gap-6 px-5 py-5 sm:px-8 sm:py-8 lg:px-12',
      ]"
    >
      <BrandLogo />
      <NuxtLink
        to="/"
        class="text-sm underline underline-offset-4 hover:text-coral sm:text-base"
        >Volver a la web</NuxtLink
      >
    </header>
    <main
      id="contenido"
      class="text-justify"
    >
      <div class="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <nav
          class="flex flex-wrap gap-2 py-4 text-sm text-muted"
          aria-label="Ruta de navegación"
        >
          <NuxtLink
            to="/"
            class="underline underline-offset-4 hover:text-ink"
            >Inicio</NuxtLink
          ><span aria-hidden="true">/</span>
          <NuxtLink
            to="/blog"
            class="underline underline-offset-4 hover:text-ink"
            >Blog</NuxtLink
          ><span aria-hidden="true">/</span>
          <span aria-current="page">Masaje relajante en Ávila</span>
        </nav>
        <div
          :class="[
            'grid gap-8 py-6 pb-12',
            'lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center',
            'lg:gap-16 lg:py-8 lg:pb-16',
          ]"
        >
          <div>
            <h1
              :class="[
                'max-w-[27ch] text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.08]',
                'font-extrabold tracking-[-.035em] text-balance lg:max-w-[23ch]',
              ]"
            >
              Masaje relajante en Ávila:
              <span class="text-coral">una pausa de bienestar en tu casa</span>
            </h1>
            <p class="mt-6 text-xl leading-relaxed">
              No siempre hace falta salir para dedicarte un momento. Un masaje a domicilio te
              permite acordar una sesión de bienestar en tu propio espacio, sin añadir
              desplazamientos a tu día.
            </p>
            <p class="mt-4 leading-relaxed text-muted">
              En esta guía encontrarás qué puedes esperar, cómo preparar la visita y cómo reservar
              con Aurora. El servicio se realiza exclusivamente en Ávila capital, con cita previa.
            </p>
            <OfferSummary />
            <p class="my-6 flex flex-wrap gap-2 text-sm text-muted">
              <NuxtLink
                to="/#aurora"
                class="underline underline-offset-4"
                >Aurora Masajista</NuxtLink
              ><span aria-hidden="true">·</span>Actualizado en
              <time :datetime="modified">octubre de 2026</time>
            </p>
            <ContactButton />
          </div>
          <figure class="min-w-0">
            <img
              :class="[
                'block aspect-video h-auto w-full rounded-2xl object-cover',
                'object-[65%_center] lg:aspect-[4/5]',
              ]"
              src="/images/masaje-cuerpo-completo-hero-952.webp"
              :srcset="artworkSrcset"
              sizes="(max-width: 960px) 92vw, 520px"
              width="952"
              height="528"
              alt="Imagen ilustrativa de una sesión de masaje en un entorno doméstico luminoso."
              fetchpriority="high"
              decoding="async"
            />
            <figcaption class="mt-3 text-sm leading-relaxed text-muted">
              El bienestar también puede tener lugar en casa. Imagen ilustrativa.
            </figcaption>
          </figure>
        </div>
      </div>
      <div
        :class="[
          'mx-auto grid w-full max-w-7xl gap-8 border-t border-ink/15 px-5',
          'py-8 sm:px-8 lg:grid-cols-[14rem_minmax(0,70ch)] lg:items-start',
          'lg:gap-16 lg:px-12 lg:py-12',
        ]"
      >
        <aside class="lg:sticky lg:top-8">
          <nav aria-labelledby="guide-index-title">
            <h2
              id="guide-index-title"
              class="mb-4 text-base font-bold"
            >
              En esta guía
            </h2>
            <ul class="grid gap-x-6 sm:grid-cols-2 lg:block">
              <li
                v-for="section in sections"
                :key="section.id"
              >
                <a
                  :class="[
                    'block py-2 leading-normal text-muted underline underline-offset-4',
                    'hover:text-ink',
                  ]"
                  :href="'#' + section.id"
                  >{{ section.label }}</a
                >
              </li>
            </ul>
          </nav>
        </aside>
        <article
          :class="[
            'min-w-0 max-w-[70ch] space-y-14 text-lg leading-[1.8]',
            '[&_section]:scroll-mt-8 [&_h2]:mb-5',
            '[&_h2]:text-[clamp(1.625rem,2.5vw,2rem)] [&_h2]:leading-tight',
            '[&_h2]:font-bold [&_h2]:tracking-tight [&_h3]:mt-8 [&_h3]:text-xl',
            '[&_h3]:leading-snug [&_h3]:font-bold [&_p+p]:mt-4 [&_h3+p]:mt-4',
            '[&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-5 [&_li+li]:mt-4',
            '[&_a:not(.landing-button)]:underline',
            '[&_a:not(.landing-button)]:underline-offset-4',
          ]"
          aria-label="Guía de masaje relajante a domicilio"
        >
          <section id="que-es">
            <h2>Qué esperar de un masaje relajante</h2>
            <p>
              Un masaje relajante de bienestar propone hacer una pausa y prestar atención a cómo te
              sientes. No se trata de seguir una intensidad fija: antes de empezar puedes explicar
              tus preferencias y, durante la sesión, comentar si quieres que se adapte el ritmo o la
              presión.
            </p>
            <p>
              Aurora ofrece masajes de bienestar, sin asistencia sanitaria, diagnóstico ni
              tratamiento médico. La sesión no sustituye una consulta ni se presenta como una forma
              de tratar lesiones. Lo que se acuerda es un tiempo de cuidado personal.
            </p>
          </section>
          <section id="a-domicilio">
            <h2>Cómo es una sesión a domicilio en Ávila</h2>
            <p>
              Todo empieza con una conversación. Contactas con Aurora, comentas qué sesión te
              interesa y acordáis el día, la hora y una dirección. La disponibilidad se confirma
              directamente; abrir WhatsApp o enviar una consulta no reserva un horario por sí solo.
            </p>
            <p>
              Antes del masaje hay un momento para hablar de tus preferencias. Puedes dedicar la
              sesión al cuerpo completo o dar más atención a zonas como la espalda y los hombros. La
              idea es que conozcas lo que vais a hacer y puedas comunicarte con tranquilidad en todo
              momento.
            </p>
            <p>
              Al realizarse en tu domicilio, no necesitas organizar un desplazamiento a un centro.
              Sí conviene elegir un momento en el que puedas disponer del espacio y del tiempo
              acordados, sin otras tareas pendientes durante la visita.
            </p>
          </section>
          <section id="duracion">
            <h2>Una sesión de 60 minutos</h2>
            <p>
              Es una sesión de bienestar que se adapta a las preferencias que comentes con Aurora;
              no un recorrido que tengas que aceptar sin poder pedir cambios.
            </p>
            <p>
              Si quieres completar ese momento, puedes consultar por el
              <strong>masaje facial opcional de 10 minutos extra</strong>. Se ofrece como
              complemento a la sesión de cuerpo completo, no como una reserva independiente.
            </p>
            <p>
              El facial cuesta <strong>{{ marketingFacialPrice }}</strong> y no tiene descuento. La
              sesión de 60 minutos con el facial suma 70 minutos y cuesta
              {{ marketingCombinedPrice }}, o {{ marketingFirstCombinedPrice }} si es tu primera
              sesión.
            </p>
            <p>
              También puedes preguntar por una visita para varias personas en una misma dirección.
              Los masajes se realizan consecutivamente y es necesario acordar la duración total y la
              disponibilidad antes de confirmar. Puedes ver la
              <NuxtLink to="/#massage">presentación de los masajes</NuxtLink> en la portada.
            </p>
          </section>
          <section id="antes-de-la-visita">
            <h2>Qué conviene acordar antes de la visita</h2>
            <p>
              Una breve conversación previa ayuda a que el encuentro encaje en tu día. No necesitas
              decidirlo todo antes de escribir, pero sí dejar claros estos puntos al confirmar:
            </p>
            <ul>
              <li>
                <strong>El horario y la duración.</strong> Indica qué días te vienen bien y si te
                interesa añadir el complemento facial.
              </li>
              <li>
                <strong>La dirección y el acceso.</strong> Confirma que el domicilio está en Ávila
                capital y comenta las indicaciones necesarias para llegar.
              </li>
              <li>
                <strong>El espacio.</strong> Prepara una zona libre de aproximadamente 3 × 2 metros.
                Aurora lleva todo lo necesario para el masaje.
              </li>
              <li>
                <strong>Los productos.</strong> Si tienes alergia o sensibilidad a algún producto,
                coméntalo antes de reservar para revisar los ingredientes contigo.
              </li>
            </ul>
            <p>
              El precio total y los detalles de la visita se acuerdan antes de confirmar. Para
              cambiar o cancelar la cita, contacta con Aurora cuanto antes. Encontrarás más
              información en las
              <NuxtLink to="/condiciones-reserva">condiciones de reserva</NuxtLink>.
            </p>
          </section>
          <section id="preguntas-frecuentes">
            <h2>Preguntas frecuentes</h2>
            <h3>¿El servicio cubre toda la provincia de Ávila?</h3>
            <p>
              No. El servicio se realiza exclusivamente en Ávila capital. Al consultar, indica tu
              dirección para acordar los detalles de la visita.
            </p>
            <h3>¿Qué horarios hay disponibles?</h3>
            <p>
              El horario es de lunes a sábado, de 11:00 a 19:00, con flexibilidad horaria y siempre
              con reserva previa. La disponibilidad concreta se confirma directamente con Aurora.
            </p>
            <h3>¿Cuál es el precio de un masaje relajante a domicilio?</h3>
            <p>
              La sesión de 60 minutos cuesta <strong>{{ marketingPrice }}</strong
              >. En tu primera sesión pagas <strong>{{ marketingFirstSessionPrice }}</strong
              >. Los impuestos y el desplazamiento dentro de Ávila capital están incluidos. El
              facial opcional de 10 minutos cuesta {{ marketingFacialPrice }} adicionales y no tiene
              descuento.
            </p>

            <h3>¿Puedo reservar para varias personas?</h3>
            <p>
              Puedes consultar por varias personas en una misma dirección. Las sesiones se realizan
              una después de otra, por lo que es importante acordar el tiempo completo de la visita.
            </p>
            <p>
              La primera sesión de 60 minutos de cada persona cuesta
              {{ marketingFirstSessionPrice }}, tanto en reservas individuales como de grupo.
            </p>
            <h3>¿Necesito tener camilla o productos en casa?</h3>
            <p>No, solo necesitas preparar un espacio libre de aproximadamente 3 × 2 metros.</p>
            <h3>¿Cómo reservo?</h3>
            <p>
              Escribe por WhatsApp o llama al <a href="tel:+34644517187">+34 644 51 71 87</a>. La
              cita queda acordada cuando Aurora confirma contigo el servicio, el horario, la
              dirección y el importe.
            </p>
          </section>
          <section
            id="reservar"
            class="border-t border-ink/15 pt-10"
          >
            <h2>Tu próxima pausa empieza con una conversación</h2>
            <p>
              Si buscas un masaje relajante en Ávila capital y prefieres recibirlo en casa, cuéntale
              a Aurora qué día te viene bien. Podrás resolver tus dudas y acordar la sesión antes de
              reservar.
            </p>
            <OfferSummary />
            <div class="mt-6"><ContactButton /></div>
            <p class="mt-4 text-base">
              ¿Prefieres llamar? <a href="tel:+34644517187">+34 644 51 71 87</a>
            </p>
          </section>
        </article>
      </div>
    </main>
    <footer
      :class="[
        'mx-auto flex w-full max-w-7xl flex-wrap items-center',
        'justify-between gap-6 border-t border-ink/15 px-5 py-8 sm:px-8',
        'lg:px-12',
      ]"
    >
      <NuxtLink
        to="/"
        class="underline underline-offset-4 hover:text-coral"
        >Volver a Aurora Masajista</NuxtLink
      >
      <FooterLinks />
    </footer>
  </div>
</template>
