<template>
 <NuxtLink to="/" class="brand-logo" aria-label="Aurora · Masajes a domicilio en Ávila capital · Inicio">
  <span class="brand-logo-name">Aurora<span class="brand-logo-line" aria-hidden="true"></span></span>
  <span class="brand-logo-description">Masajes a domicilio<br />en Ávila capital</span>
 </NuxtLink>
</template>

<style scoped>
.brand-logo { display:inline-flex; align-items:center; gap:20px; color:var(--color-ink, #064f58); text-decoration:none; flex-shrink:0; }
.brand-logo-name { font-family:Urbanist,sans-serif; font-size:60px; font-weight:600; line-height:1; letter-spacing:-0.04em; }
.brand-logo-line { display:block; width:64px; height:4px; margin-top:2px; border-radius:999px; background:var(--color-coral, #c95349); }
.brand-logo-description { border-left:1px solid #064f584d; padding-left:20px; font-size:18px; line-height:1.4; font-weight:400; letter-spacing:normal; }
.brand-logo:focus-visible { outline:2px solid currentColor; outline-offset:6px; border-radius:2px; }
@media(max-width:599px) {
 .brand-logo { gap:12px; }
 .brand-logo-name { font-size:40px; }
 .brand-logo-line { width:44px; height:3px; }
 .brand-logo-description { padding-left:12px; font-size:13px; }
}
</style>
