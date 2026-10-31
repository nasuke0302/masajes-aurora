# Instrucciones del proyecto

- Para cualquier cambio de interfaz en este repositorio, usa las utilidades de Tailwind CSS en el
  marcado Vue/HTML. El proyecto usa Tailwind v4 y define sus colores y tipografía en
  `src/style.css`.
- Evita crear CSS personalizado: no añadas bloques `<style>` a componentes o páginas, estilos
  inline, selectores nuevos en hojas CSS ni nuevos `@apply` para resolver maquetación, espaciado,
  tipografía o estados. Usa variantes responsivas y utilidades arbitrarias de Tailwind cuando haga
  falta.
- Conserva el CSS heredado que no forme parte de la tarea. Si modificas un componente que ya tiene
  CSS propio, convierte al menos el estilo que cambies a utilidades Tailwind; no amplíes ese CSS.
- Escribe y revisa las líneas nuevas o modificadas con un máximo de 100 caracteres. Sigue la
  configuración de Prettier; divide manualmente el texto, las cadenas y las clases de Tailwind que
  Prettier no pueda ajustar a ese límite. Ejecuta `npm run lines:check -- <archivos>` para comprobar
  los archivos modificados. No reformatees archivos ajenos a la tarea.
- Para interacciones con Cloudflare, usa la CLI `cf` salvo que el proyecto tenga un archivo de
  configuración de Wrangler.
- Hay autorización permanente para ejecutar los comandos `npm` y `npm exec` necesarios para este
  proyecto. Si el entorno exige aprobación, solicita una aprobación reutilizable para el prefijo del
  comando.
