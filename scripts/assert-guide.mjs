import assert from 'node:assert/strict'
export function assertGuide(html,origin='https://auroramasajista.com'){
 const url=new URL('/blog/masaje-relajante-avila',origin).href
 const headings=[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)]
 assert.equal(headings.length,1,'The guide must have one H1')
 assert.equal(headings[0][1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(),'Masaje relajante en Ávila: una pausa de bienestar en tu casa')
 assert.match(html,/<title>Masaje relajante en Ávila a domicilio \| Aurora Masajista<\/title>/)
 assert([...html.matchAll(/<link\b[^>]*>/g)].some(([tag])=>tag.includes('rel="canonical"')&&tag.includes('href="'+url+'"')),'Canonical must identify the guide, not the home page')
 assert.doesNotMatch(html,/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/)
 const schemas=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>{const value=JSON.parse(m[1]);return value['@graph']||[value]})
 const article=schemas.find(s=>s['@type']==='BlogPosting'),breadcrumb=schemas.find(s=>s['@type']==='BreadcrumbList')
 assert(article);assert(breadcrumb);assert.equal(article.mainEntityOfPage,url);assert.equal(article.author.name,'Aurora Masajista');assert.equal(article.datePublished,'2026-10-25');assert.equal(article.dateModified,'2026-10-31')
 assert.equal(article.image[0],new URL('/images/masaje-cuerpo-completo-hero.png',origin).href)
 assert.equal(breadcrumb.itemListElement[1].item,new URL('/blog',origin).href)
 assert.equal(breadcrumb.itemListElement[2].item,url)
 for(const id of ['que-es','a-domicilio','duracion','antes-de-la-visita','preguntas-frecuentes','reservar']){assert(html.includes('id="'+id+'"'));assert(html.includes('href="#'+id+'"'))}
 for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert(html.includes('id="'+id+'"'),'Missing guide anchor: '+id)
 assert.match(html,/60 minutos/);assert.match(html,/10 minutos/);assert.match(html,/Ávila capital/);assert.match(html,/https:\/\/wa.me\/34644517187/)
 assert.match(html,/tel:\+34644517187/);assert.match(html,/datetime="2026-10-31"/)
 assert(html.includes('href="/#aurora"'));assert(html.includes('href="/#massage"'))
 assert.doesNotMatch(html,/href="\/reservar"|href="\/admin/)
}
