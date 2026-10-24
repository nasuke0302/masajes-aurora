import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
const profile = process.env.AURORA_PROFILE || "staging";
if (!["production", "staging"].includes(profile))
  throw new Error("INVALID_AURORA_PROFILE");
const marketing = profile === "production";
export default defineNuxtConfig({
  buildDir: marketing ? ".nuxt-production" : ".nuxt",
  compatibilityDate: "2026-10-11",
  devtools: { enabled: false },
  srcDir: "src/",
  serverDir: marketing ? "server-marketing" : "server",
  css: [
    "@fontsource/urbanist/latin-400.css",
    "@fontsource/urbanist/latin-500.css",
    "@fontsource/urbanist/latin-600.css",
    "@fontsource/urbanist/latin-700.css",
    "@fontsource/urbanist/latin-800.css",
    "~/style.css",
  ],
  ignore: marketing
    ? [
        "**/pages/admin/**",
        "**/pages/reserva/**",
        "**/pages/reservar.vue",
        "**/components/Booking*.vue",
        "**/components/admin/**",
      ]
    : [],
  hooks: {
    "pages:extend"(pages) {
      if (marketing) {
        const allowed = new Set([
          "/",
          "/aviso-legal",
          "/privacidad",
          "/cookies",
          "/condiciones-reserva",
        ]);
        for (let i = pages.length - 1; i >= 0; i--) {
          const page = pages[i]!;
          if (!allowed.has(page.path)) {
            pages.splice(i, 1);
            continue;
          }
          if (
            ["/privacidad", "/cookies", "/condiciones-reserva"].includes(
              page.path,
            )
          )
            page.file = resolve("src/marketing" + page.path + ".vue");
        }
      }
    },
  },
  components: [{ path: "~/components", pathPrefix: false }],
  vite: {
    plugins: [tailwindcss()],
    define: {
      "import.meta.env.AURORA_BOOKING_ENABLED": JSON.stringify(!marketing),
    },
  },
  nitro: {
    preset: marketing
      ? "static"
      : process.env.NODE_ENV === "development"
        ? "node-server"
        : "cloudflare_module",
    plugins:
      !marketing && process.env.NODE_ENV === "development"
        ? ["./dev/local.ts"]
        : [],
    cloudflare: { deployConfig: false, nodeCompat: true },
    ...(marketing
      ? {
          output: {
            dir: resolve(".output-production"),
            publicDir: resolve(".output-production/public"),
            serverDir: resolve(".output-production/server"),
          },
          prerender: {
            crawlLinks: false,
            failOnError: true,
            routes: [
              "/",
              "/aviso-legal",
              "/privacidad",
              "/cookies",
              "/condiciones-reserva",
              "/sitemap.xml",
              "/robots.txt",
            ],
          },
        }
      : {}),
  },
  runtimeConfig: {
    public: {
      bookingEnabled: !marketing,
      turnstileSiteKey: marketing ? "" : process.env.TURNSTILE_SITE_KEY || "",
      siteUrl: process.env.SITE_URL || "",
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: "es" },
      title: "Aurora Masajista · Masajes a domicilio en Ávila",
      meta: [
        { name: "theme-color", content: "#064f58" },
        {
          name: "description",
          content:
            "Masajes a domicilio en Ávila capital. Reserva una sesión para ti o para varias personas, sin crear una cuenta.",
        },
      ],
      link: [{ rel: "icon", href: "/favicon.svg" }],
    },
  },
  typescript: { typeCheck: false, strict: true },
  routeRules: {
    "/admin/**": {
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-store",
      },
    },
    "/reserva/**": {
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    },
    "/api/**": { headers: { "Cache-Control": "no-store" } },
  },
});
