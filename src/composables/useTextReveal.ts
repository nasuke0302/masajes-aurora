import { onMounted, onUnmounted, type Ref } from 'vue'

/** Reveal each text block once, leaving content visible without animation support. */
export function useTextReveal(root: Ref<HTMLElement | null>) {
  let observer: IntersectionObserver | undefined
  let motionPreference: MediaQueryList | undefined
  const animations = new Map<HTMLElement, Animation>()

  const stopAnimations = () => {
    animations.forEach((animation) => animation.cancel())
    animations.clear()
  }
  const onMotionChange = () => {
    if (motionPreference?.matches) stopAnimations()
  }
  const onFocus = (event: FocusEvent) => {
    if (!(event.target instanceof HTMLElement)) return
    animations.forEach((animation, element) => {
      if (element.contains(event.target as HTMLElement)) {
        animation.cancel()
        animations.delete(element)
      }
    })
  }

  onMounted(() => {
    if (!root.value || !('IntersectionObserver' in window)) return
    motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionPreference.addEventListener('change', onMotionChange)
    root.value.addEventListener('focusin', onFocus)

    observer = new IntersectionObserver(
      (entries) => {
        let stagger = 0
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const element = entry.target as HTMLElement
          observer?.unobserve(element)
          if (
            motionPreference?.matches ||
            !element.animate ||
            element.contains(document.activeElement)
          )
            continue

          const animation = element.animate(
            [
              { opacity: 0, transform: 'translateY(10px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            {
              duration: 550,
              delay: Math.min(stagger++ * 45, 180),
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              fill: 'backwards',
            },
          )
          animations.set(element, animation)
          animation.onfinish = () => animations.delete(element)
        }
      },
      { threshold: 0.08 },
    )

    // Animate parent text blocks, not their nested emphasis or decorative spans.
    root.value
      .querySelectorAll<HTMLElement>(
        'header a, header label, main h1, main h2, main h3, main p, main a, footer p, footer a',
      )
      .forEach((element) => observer?.observe(element))
  })

  onUnmounted(() => {
    observer?.disconnect()
    motionPreference?.removeEventListener('change', onMotionChange)
    root.value?.removeEventListener('focusin', onFocus)
    stopAnimations()
  })
}
