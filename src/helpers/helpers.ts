export const isLocalhost = () => {
  if (typeof window === 'undefined') return true
  const host = window.location.hostname.toLowerCase()
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '[::1]' ||
    host === '::1' ||
    /^127\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^10\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  )
}

export const canOptimizeImage = (src: string) =>
  !isLocalhost() && !/^(?:data:|blob:)/i.test(src) && !src.startsWith('/.netlify/images')

export const getImageSrc = ({
  src,
  w,
  h,
  q = 75,
}: {
  src: string
  w?: number | string
  h?: number | string
  q?: number
}) => {
  if (!src || !canOptimizeImage(src)) return src
  const params = new URLSearchParams({ url: src })
  for (const [key, value] of Object.entries({ w, h })) {
    const dimension = Number(value)
    if (Number.isFinite(dimension) && dimension > 0) params.set(key, String(Math.round(dimension)))
  }
  params.set('q', String(Math.max(1, Math.min(100, Math.round(q)))))
  // Netlify negotiates WebP/AVIF; omitting height preserves the source ratio.
  return `/.netlify/images?${params}`
}

export const getImageSrcset = (src: string, width: number) => {
  if (!canOptimizeImage(src)) return undefined
  const widths = [
    ...new Set([320, 480, 640, 960, 1280, 1600, width].filter((value) => value <= width)),
  ].sort((a, b) => a - b)
  return widths.map((w) => `${getImageSrc({ src, w })} ${w}w`).join(', ')
}
