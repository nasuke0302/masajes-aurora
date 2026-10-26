import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

// Resolve against the project, including when Nuxt is invoked from another directory.
const source = fileURLToPath(new URL('../public/images/masaje-cuerpo-completo-hero.png', import.meta.url))

export async function optimizeHeroImages() {
  await Promise.all([480, 768, 952].map(async width => {
    const destination = fileURLToPath(new URL(`../public/images/masaje-cuerpo-completo-hero-${width}.webp`, import.meta.url))
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(destination)
  }))
}
