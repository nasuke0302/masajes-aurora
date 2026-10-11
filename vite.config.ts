import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "SITE_URL");
  const configuredUrl = (process.env.SITE_URL ?? env.SITE_URL ?? "").trim();
  let siteUrl: string | undefined;
  if (configuredUrl) {
    const parsed = new URL(configuredUrl);
    if (
      !["https:", "http:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash
    ) {
      throw new Error(
        "SITE_URL must be an absolute HTTP(S) URL without credentials, query, or fragment.",
      );
    }
    siteUrl = parsed.href.replace(/\/$/, "") + "/";
  }
  const escapeXml = (value: string) =>
    value.replace(
      /[<>&"']/g,
      (char) =>
        ({
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          '"': "&quot;",
          "'": "&apos;",
        })[char]!,
    );

  return {
    plugins: [
      tailwindcss(),
      vue(),
      vueDevTools(),
      {
        name: "site-seo",
        transformIndexHtml() {
          if (!siteUrl) return [];
          return [
            {
              tag: "link",
              attrs: { rel: "canonical", href: siteUrl },
              injectTo: "head",
            },
            {
              tag: "meta",
              attrs: { property: "og:url", content: siteUrl },
              injectTo: "head",
            },
            {
              tag: "meta",
              attrs: {
                property: "og:image",
                content: new URL("images/melba-massages-hero-2.png", siteUrl)
                  .href,
              },
              injectTo: "head",
            },
          ];
        },
        generateBundle() {
          this.emitFile({
            type: "asset",
            fileName: "robots.txt",
            source:
              "User-agent: *\nAllow: /\n" +
              (siteUrl
                ? `\nSitemap: ${new URL("sitemap.xml", siteUrl).href}\n`
                : ""),
          });
          if (siteUrl) {
            this.emitFile({
              type: "asset",
              fileName: "sitemap.xml",
              source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeXml(siteUrl)}</loc></url></urlset>\n`,
            });
          }
        },
      },
    ],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
  };
});
