# melba-massage

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

## Production SEO

Copy `.env.example` to `.env.local` and set `SITE_URL` to the final public URL (including `https://`), or define it in the deployment environment. Rebuild after changing it.

The build generates a canonical link, Open Graph URL/image, `sitemap.xml`, and a sitemap reference in `robots.txt`. Without `SITE_URL`, domain-dependent metadata and the sitemap are omitted to avoid indexing a placeholder domain. If deploying under a subpath, configure Vite's `base` to match it as well.

After deployment, verify the domain in Google Search Console and submit `/sitemap.xml`. Create or verify a Google Business Profile for the at-home service in Ávila capital; do not advertise a customer-facing address unless customers are actually received there. Keep the business name, phone number, and service area consistent.

The requested meta keywords are included, but Google ignores them for indexing and ranking. Metadata and structured data do not guarantee search visibility or rankings.

## Image loading

Use `src/components/atoms/Image.vue` with `w` and `h` set to the original image dimensions and `sizes` describing its rendered width. These reserve the correct aspect ratio; responsive Netlify candidates never exceed `w`.

```vue
<Image src="/images/photo.png" :w="1672" :h="941" sizes="(min-width: 768px) 50vw, 88vw" />
```

Images are lazy-loaded with a 150px prefetch margin and a tiny, proportional Netlify placeholder. Pass `src-placeholder` to override it (an empty string disables the generated preview). Add `eager` for an above-the-fold/LCP image: it uses a native image with high fetch priority and no placeholder or blur delay. The hero uses one image node for desktop and mobile, avoiding two competing requests.

Localhost, loopback, and private LAN previews use original files. Public deployments assume Netlify Image CDN; other hosts need a different image provider. External image sources require Netlify's `images.remote_images` allowlist. Netlify negotiates output format automatically. Confirm transfer sizes and LCP on the deployed site; local development cannot measure CDN transformations.

Run image helper checks with `node --test tests/images.test.mjs`.
