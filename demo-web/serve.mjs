// Plain static server for the "it worked on localhost" step. No HTTPS on
// purpose: http://localhost is what you develop against, and it is the one
// origin the browser trusts.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT ?? 8080)
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' }

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://x')
    let file = path.join(root, url.pathname === '/' ? 'index.html' : url.pathname)
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end('not found')
      return
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' })
    fs.createReadStream(file).pipe(res)
  })
  .listen(port, () => console.log(`[demo-web] http://localhost:${port}`))
