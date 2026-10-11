declare module 'v-lazy-image' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{
    src: string
    srcPlaceholder?: string
    srcset?: string
    intersectionOptions?: IntersectionObserverInit
    usePicture?: boolean
  }>
  export default component
}
