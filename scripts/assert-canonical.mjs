import assert from 'node:assert/strict'

export function assertCanonical(html, expected) {
  const tags = [...html.matchAll(/<link\b[^>]*\brel="canonical"[^>]*>/g)]
  assert.equal(tags.length, 1, `Expected one canonical for ${expected}`)
  const href = tags[0][0].match(/\bhref="([^"]+)"/)?.[1]
  assert(href, `Missing canonical href for ${expected}`)
  assert.equal(new URL(href).href, new URL(expected).href)
}
