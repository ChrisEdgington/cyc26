// Turns slides.md into a plain read-through: docs/script.md
// One section per slide: what is on the screen, then the notes.
import fs from 'node:fs'

const src = fs.readFileSync(new URL('./slides.md', import.meta.url), 'utf8')
const blocks = src.split(/^---$/m)
// blocks[0] is empty, [1] is the headmatter, then alternating frontmatter / content
const slides = []
for (let i = 2; i < blocks.length; i += 2) {
  const fm = blocks[i - 1] ?? ''
  const body = blocks[i] ?? ''
  const clock = fm.match(/clock:\s*"([^"]+)"/)?.[1]
  slides.push({ clock, body })
}
// the first slide is headmatter + first content block
slides.unshift({ clock: blocks[1].match(/clock:\s*"([^"]+)"/)?.[1], body: blocks[2] })
slides.splice(1, 1)

const strip = (s) =>
  s
    .replace(/<img[^>]*alt="([^"]*)"[^>]*>/g, '[picture: $1]')
    .replace(/<p v-click>|<p class="sub[^"]*">|<p>/g, '')
    .replace(/<\/p>/g, '')
    .replace(/<b>|<\/b>/g, '')
    .replace(/<span class="tag">([^<]*)<\/span>/g, '($1)')
    .replace(/<v-clicks>|<\/v-clicks>|<div[^>]*>|<\/div>/g, '')
    .replace(/<br>/g, ' ')
    .replace(/```mermaid[\s\S]*?```/g, '[diagram: web app → Electron window → IPC → Node → printer]')
    .replace(/<table[\s\S]*?<\/table>/g, (t) =>
      t
        .split('\n')
        .filter((l) => l.startsWith('<tr>'))
        .map((l) => '  ' + l.replace(/<\/t[dh]><t[dh]>/g, ' | ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&'))
        .join('\n'),
    )
    .replace(/\n{3,}/g, '\n\n')
    .trim()

let out = '# Read-through script\n\nGenerated from slides/slides.md by `node slides/script.mjs`. Edit the slides, not this file.\n\n'
slides.forEach((s, i) => {
  const n = i + 1
  const notes = s.body.match(/<!--([\s\S]*?)-->/)?.[1].trim() ?? ''
  const screen = strip(s.body.replace(/<!--[\s\S]*?-->/, ''))
  out += `---\n\n## ${n}${s.clock ? `  ·  clock ${s.clock}` : ''}\n\n`
  out += '**On the screen**\n\n' + screen.replace(/^/gm, '> ') + '\n\n'
  out += '**Say**\n\n' + notes + '\n\n'
})
fs.writeFileSync(new URL('../docs/script.md', import.meta.url), out)
console.log(`wrote docs/script.md, ${slides.length} slides`)

// Also write a plain HTML version so it can be read in a browser.
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const html = out
  .split('\n')
  .map((l) => {
    if (l === '---') return '<hr>'
    if (l.startsWith('## ')) return `<h2>${esc(l.slice(3))}</h2>`
    if (l.startsWith('# ')) return `<h1>${esc(l.slice(2))}</h1>`
    if (l.startsWith('**On the screen**')) return '<h3>On the screen</h3>'
    if (l.startsWith('**Say**')) return '<h3>Say</h3>'
    if (l.startsWith('> # ')) return `<blockquote class="big">${esc(l.slice(4))}</blockquote>`
    if (l.startsWith('> ')) return `<blockquote>${esc(l.slice(2))}</blockquote>`
    if (l.trim() === '' || l === '>') return ''
    return `<p>${esc(l)}</p>`
  })
  .join('\n')
const page = `<!doctype html><meta charset="utf-8"><title>Read-through script</title>
<style>
body{max-width:52rem;margin:3rem auto;padding:0 1.5rem;font:19px/1.55 -apple-system,system-ui,sans-serif;color:#1a1a1a;background:#fbfbf9}
h1{font-size:1.6rem} h2{margin-top:2.5rem;font-size:1.1rem;color:#666;font-weight:600;letter-spacing:.04em}
h3{font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;color:#999;margin:1.2rem 0 .3rem}
blockquote{margin:.15rem 0;padding:.1rem 0 .1rem 1rem;border-left:3px solid #ddd;color:#333;white-space:pre-wrap}
blockquote.big{font-size:1.5rem;font-weight:700;color:#000}
hr{border:0;border-top:1px solid #e5e5e5;margin:2.5rem 0} p{margin:.5rem 0}
</style>
${html}`
fs.writeFileSync(new URL('../docs/script.html', import.meta.url), page)
// Slidev serves public/ at the site root, so this is http://localhost:3030/script.html while `pnpm slides` runs.
fs.writeFileSync(new URL('./public/script.html', import.meta.url), page)
console.log('wrote docs/script.html and slides/public/script.html')
