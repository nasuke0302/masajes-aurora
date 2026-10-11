<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(defineProps<{ src: string; position?: 'center' | 'right' }>(), { position: 'center' })
const canvas = ref<HTMLCanvasElement | null>(null)
const ready = ref(false)
const status = ref('loading')
let dispose = () => {}

onMounted(() => {
  const el = canvas.value
  if (!el) return
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  // The underlying image is always present, including on unsupported devices.
  const gl = el.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' })
  if (!gl) { status.value = 'webgl-unavailable'; return }
  const shaders: WebGLShader[] = []
  const program = gl.createProgram()
  if (!program) return
  function compile(type: number, source: string) {
    const shader = gl!.createShader(type)
    if (!shader) throw new Error('Shader allocation failed')
    shaders.push(shader)
    gl!.shaderSource(shader, source)
    gl!.compileShader(shader)
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(shader) || 'Shader compilation failed')
    gl!.attachShader(program!, shader)
  }
  try {
    compile(gl.VERTEX_SHADER, `
      precision mediump float;
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() { v_uv = a_position * .5 + .5; gl_Position = vec4(a_position, 0., 1.); }
    `)
    compile(gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying vec2 v_uv;
      uniform sampler2D u_image;
      uniform vec2 u_view;
      uniform vec2 u_imageSize;
      uniform float u_time;
      uniform float u_right;
      // A conservative interior corridor follows the existing ribbon.
      // Its soft mask leaves the silhouette, photograph and white ground untouched.
      float center(float x) {
        float y = .82;
        y += .02 * smoothstep(0., .10, x);
        y -= .02 * smoothstep(.10, .20, x);
        y -= .09 * smoothstep(.20, .30, x);
        y -= .18 * smoothstep(.30, .40, x);
        y -= .01 * smoothstep(.40, .50, x);
        y -= .22 * smoothstep(.50, .60, x);
        y -= .13 * smoothstep(.60, .70, x);
        y += .05 * smoothstep(.70, .80, x);
        y += .04 * smoothstep(.80, .90, x);
        y -= .06 * smoothstep(.90, 1., x);
        return y;
      }
      void main() {
        float scale = max(u_view.x / u_imageSize.x, u_view.y / u_imageSize.y);
        vec2 visible = u_view / (u_imageSize * scale);
        vec2 origin = (1. - visible) * vec2(mix(.5, 1., u_right), .5);
        vec2 uv = origin + vec2(v_uv.x, 1. - v_uv.y) * visible;
        vec4 original = texture2D(u_image, uv);
        float corridor = 1. - smoothstep(.012, .035, abs(uv.y - center(uv.x)));
        float t = u_time * .62831853;
        vec2 drift = vec2(sin(uv.y * 65. + t) + .4 * sin(uv.x * 43. - t),
                          cos(uv.x * 58. - t) + .3 * sin(uv.y * 47. + t));
        vec2 offset = drift * vec2(.006, .008) * corridor;
        vec4 moved = texture2D(u_image, clamp(uv + offset, 0., 1.));
        gl_FragColor = mix(original, moved, corridor);
      }
    `)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Shader link failed')
  } catch (error) {
    status.value = 'shader-error'
    console.warn('[MarbleMotion] Static fallback:', error)
    shaders.forEach((shader) => gl.deleteShader(shader))
    gl.deleteProgram(program)
    return
  }
  const buffer = gl.createBuffer()
  const texture = gl.createTexture()
  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
  const attribute = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(attribute)
  gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0)
  const view = gl.getUniformLocation(program, 'u_view')
  const time = gl.getUniformLocation(program, 'u_time')
  let frame = 0
  let last = 0
  let elapsed = 0
  let visible = false
  let loaded = false
  let destroyed = false
  let lost = false
  const img = new window.Image()
  function draw(now: number) {
    if (destroyed) return
    if (now - last >= 1000 / 30) {
      elapsed += last ? Math.min((now - last) / 1000, .1) : 0
      last = now
      gl!.uniform1f(time, elapsed)
      gl!.drawArrays(gl!.TRIANGLES, 0, 6)
      ready.value = true
      status.value = 'running'
    }
    frame = requestAnimationFrame(draw)
  }
  function sync() {
    cancelAnimationFrame(frame)
    last = 0
    const active = loaded && visible && !document.hidden && !preference.matches && !lost
    status.value = lost ? 'context-lost' : preference.matches ? 'reduced-motion' : !loaded ? 'loading' : active ? 'running' : 'paused'
    if (preference.matches || lost) ready.value = false
    if (active) frame = requestAnimationFrame(draw)
  }
  function resize() {
    const rect = el!.getBoundingClientRect()
    visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
    el!.width = Math.max(1, Math.round(rect.width * ratio))
    el!.height = Math.max(1, Math.round(rect.height * ratio))
    gl!.viewport(0, 0, el!.width, el!.height)
    gl!.uniform2f(view, el!.width, el!.height)
    sync()
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting && el!.clientWidth > 0
    sync()
  })
  const sizing = new ResizeObserver(resize)
  observer.observe(el)
  sizing.observe(el)
  const onLoss = () => { lost = true; sync() }
  el.addEventListener('webglcontextlost', onLoss)
  document.addEventListener('visibilitychange', sync)
  preference.addEventListener('change', sync)
  img.onload = () => {
    if (destroyed || lost) return
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    gl.uniform2f(gl.getUniformLocation(program, 'u_imageSize'), img.naturalWidth, img.naturalHeight)
    gl.uniform1f(gl.getUniformLocation(program, 'u_right'), props.position === 'right' ? 1 : 0)
    loaded = true
    resize()
  }
  img.onerror = () => { status.value = 'image-error' }
  img.src = props.src
  dispose = () => {
    destroyed = true
    img.onload = null
    img.onerror = null
    cancelAnimationFrame(frame)
    observer.disconnect()
    sizing.disconnect()
    preference.removeEventListener('change', sync)
    document.removeEventListener('visibilitychange', sync)
    el.removeEventListener('webglcontextlost', onLoss)
    gl.deleteTexture(texture)
    gl.deleteBuffer(buffer)
    shaders.forEach((shader) => gl.deleteShader(shader))
    gl.deleteProgram(program)
  }
})
onUnmounted(() => dispose())
</script>

<template>
  <canvas ref="canvas" aria-hidden="true" :data-motion-status="status" class="pointer-events-none" :style="{ opacity: ready ? 1 : 0 }" />
</template>
