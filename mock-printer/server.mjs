// A mock label printer. Zero dependencies.
//
//   TCP  :9100  raw bytes, like a Zebra
//   HTTP :9101  POST /pstprnt, like a Zebra Link-OS printer
//   HTTP :9102  the panel: shows the last job, renders it via Labelary when online
//
// Forwarding: if forward.json exists (or PBX_HOST/PBX_TAG/PBX_KEY are set),
// every job is also POSTed to a proxybox print route so a real printer
// prints it. That is how the USB Zebra on stage gets the label without the
// shell knowing anything about USB.

import net from 'node:net'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const TCP_PORT = Number(process.env.MOCK_TCP_PORT ?? 9100)
const HTTP_PORT = Number(process.env.MOCK_HTTP_PORT ?? 9101)
const PANEL_PORT = Number(process.env.MOCK_PANEL_PORT ?? 9102)

const forward = loadForward()
const jobs = [] // newest first
let seq = 0

function loadForward() {
  const fromEnv =
    process.env.PBX_HOST && process.env.PBX_TAG && process.env.PBX_KEY
      ? { host: process.env.PBX_HOST, tag: process.env.PBX_TAG, apiKey: process.env.PBX_KEY }
      : null
  const file = path.join(here, 'forward.json')
  if (fromEnv) return fromEnv
  if (fs.existsSync(file)) {
    try {
      const f = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (f.host && f.tag && f.apiKey && f.apiKey !== 'REPLACE_ME') return f
    } catch (e) {
      console.error('[forward] bad forward.json:', e.message)
    }
  }
  return null
}

async function received(source, data, remote) {
  const job = {
    id: ++seq,
    at: new Date().toISOString(),
    source,
    remote,
    bytes: data.length,
    zpl: data.toString('utf8'),
    forwarded: null,
    render: null,
  }
  jobs.unshift(job)
  if (jobs.length > 20) jobs.pop()
  banner(job)
  // Do not await these; the "printer" has already accepted the job.
  forwardJob(job).catch((e) => console.error('[forward]', e.message))
  renderJob(job).catch(() => {})
  return job
}

function banner(job) {
  const line = '='.repeat(60)
  console.log(`\n${line}\n  PRINTED  #${job.id}  via ${job.source}  from ${job.remote}  ${job.bytes} bytes\n${line}`)
  console.log(job.zpl.trim().slice(0, 800))
  console.log(line)
}

async function forwardJob(job) {
  if (!forward) return
  const url = `https://${forward.host}/api/v1/print/${forward.tag}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-API-Key': forward.apiKey,
      'User-Agent': 'cyc26-mock-printer/0.1',
    },
    body: job.zpl,
    signal: AbortSignal.timeout(15000),
  })
  const text = await res.text()
  job.forwarded = { status: res.status, body: text.slice(0, 500) }
  console.log(`[forward] #${job.id} → ${url} : ${res.status}`)
}

// Labelary turns ZPL into a PNG. Purely cosmetic, and it needs internet, so
// it fails quietly and the panel shows the raw ZPL instead.
async function renderJob(job) {
  const res = await fetch('https://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/', {
    method: 'POST',
    headers: { Accept: 'image/png', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: job.zpl,
    signal: AbortSignal.timeout(4000),
  })
  if (!res.ok) return
  const buf = Buffer.from(await res.arrayBuffer())
  job.render = `data:image/png;base64,${buf.toString('base64')}`
}

// --- TCP 9100 -------------------------------------------------------------
net
  .createServer((socket) => {
    const chunks = []
    const remote = `${socket.remoteAddress}:${socket.remotePort}`
    socket.on('data', (c) => chunks.push(c))
    socket.on('end', () => {
      if (chunks.length) received('tcp:9100', Buffer.concat(chunks), remote)
    })
    socket.on('error', (e) => console.error('[tcp]', e.message))
  })
  .listen(TCP_PORT, '0.0.0.0', () => console.log(`[mock-printer] raw TCP on :${TCP_PORT}`))

// --- HTTP 9101 (POST /pstprnt) -------------------------------------------
http
  .createServer((req, res) => {
    // A real Zebra sends no CORS headers. Neither do we. That is the point.
    // Log every request, including preflights, so a blocked attempt is visible.
    const h = req.headers
    console.log(
      `[http] ${req.method} ${req.url} from ${req.socket.remoteAddress} origin=${h.origin ?? '-'} ` +
        `acr-method=${h['access-control-request-method'] ?? '-'} ` +
        `lna=${h['access-control-request-local-network'] ?? h['access-control-request-private-network'] ?? '-'}`,
    )
    if (req.method === 'POST') {
      const chunks = []
      req.on('data', (c) => chunks.push(c))
      req.on('end', async () => {
        await received(`http:${HTTP_PORT}${req.url}`, Buffer.concat(chunks), req.socket.remoteAddress ?? '?')
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('OK')
      })
      return
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('mock zebra. POST /pstprnt\n')
  })
  .listen(HTTP_PORT, '0.0.0.0', () => console.log(`[mock-printer] HTTP POST /pstprnt on :${HTTP_PORT}`))

// --- Panel 9102 -----------------------------------------------------------
const panelHtml = fs.readFileSync(path.join(here, 'panel.html'), 'utf8')
http
  .createServer((req, res) => {
    if (req.url === '/jobs') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      res.end(JSON.stringify({ forward: forward ? `${forward.host} → ${forward.tag}` : null, jobs }))
      return
    }
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(panelHtml)
  })
  .listen(PANEL_PORT, '127.0.0.1', () => {
    console.log(`[mock-printer] panel at http://localhost:${PANEL_PORT}`)
    console.log(forward ? `[forward] on: ${forward.host} → ${forward.tag}` : '[forward] off (no forward.json / PBX_* env)')
  })
