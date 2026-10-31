export default defineEventHandler((event) => {
  setHeader(event, "Content-Type", "application/xml");
  const origin = useRuntimeConfig().public.siteUrl;
  return (
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    ["/", "/blog", "/blog/masaje-relajante-avila", "/blog/masajes-relajacion-bienestar", "/aviso-legal", "/privacidad", "/cookies", "/condiciones-reserva"]
      .map((path) => "<url><loc>" + new URL(path, origin).href + "</loc></url>")
      .join("") +
    "</urlset>"
  );
});
