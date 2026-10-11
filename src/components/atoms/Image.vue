<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import VLazyImage from 'v-lazy-image'
import { canOptimizeImage, getImageSrc, getImageSrcset } from '@/helpers/helpers'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    src: string
    w?: number | string
    h?: number | string
    alt?: string
    sizes?: string
    srcPlaceholder?: string
    eager?: boolean
  }>(),
  { w: 400, h: 400, alt: '', sizes: '100vw', eager: false },
)

const width = computed(() => Math.max(1, Number(props.w) || 400))
const height = computed(() => Math.max(1, Number(props.h) || 400))
const source = computed(() => getImageSrc({ src: props.src, w: width.value }))
const failure = ref<'none' | 'original' | 'unavailable'>('none')
watch(source, () => {
  failure.value = 'none'
})
const fallback = computed(
  () =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width.value}" height="${height.value}" viewBox="0 0 100 100"><rect width="100" height="100" fill="#e9ecdf"/><path d="M30 65 45 45l10 12 8-8 12 16" fill="none" stroke="#707b56" stroke-width="2"/></svg>`)}`,
)
const displaySource = computed(() =>
  failure.value === 'unavailable'
    ? fallback.value
    : failure.value === 'original'
      ? props.src
      : source.value,
)
function onError() {
  if (failure.value === 'none' && source.value !== props.src) failure.value = 'original'
  else failure.value = 'unavailable'
}
const srcset = computed(() => getImageSrcset(props.src, width.value))
const placeholder = computed(
  () =>
    props.srcPlaceholder ??
    (canOptimizeImage(props.src) ? getImageSrc({ src: props.src, w: 40, q: 30 }) : undefined),
)
const useLazy = computed(
  () => !props.eager && typeof window !== 'undefined' && 'IntersectionObserver' in window,
)
const intersectionOptions = { rootMargin: '150px 0px' }
</script>

<template>
  <VLazyImage
    v-if="src && useLazy && failure === 'none'"
    :key="source"
    v-bind="$attrs"
    :src="source"
    :srcset="srcset"
    :sizes="sizes"
    :src-placeholder="placeholder"
    :intersection-options="intersectionOptions"
    :width="width"
    :height="height"
    :alt="alt"
    :class="{ 'progressive-image': !!placeholder }"
    decoding="async"
    @error="onError"
  />
  <img
    v-else-if="src"
    v-bind="$attrs"
    :src="displaySource"
    :srcset="failure === 'none' ? srcset : undefined"
    :sizes="sizes"
    :width="width"
    :height="height"
    :alt="alt"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : 'auto'"
    decoding="async"
    @error="onError"
  />
</template>

<style scoped>
.progressive-image {
  filter: blur(8px);
  transition: filter 300ms ease;
}
.progressive-image.v-lazy-image-loaded {
  filter: blur(0);
}
@media (prefers-reduced-motion: reduce) {
  .progressive-image {
    transition: none;
  }
}
</style>
