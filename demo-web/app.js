// Shipping Station. Keyboard only. Enter moves on; Enter on the last field
// ships the package and prints the label. There is no print button, and
// nothing for the user to configure.
//
// The one line that matters is in print(): if window.deviceBridge exists (we are
// inside the Electron shell) the label goes over IPC; otherwise the page
// does what a web page can do, a fetch straight at the printer, and the
// browser decides whether to allow it.

const $ = (id) => document.getElementById(id)
const fields = ['shipmentId', 'weight', 'len', 'wid', 'hgt'].map($)
const settings = { host: $('printerHost'), port: $('printerPort') }
let shipment = null
let t0 = 0
let timerHandle = 0

// --- bridge detection ------------------------------------------------------
const bridge = typeof window.deviceBridge?.print === 'function' ? window.deviceBridge : null
$('bridge').textContent = bridge ? `bridge ${bridge.version}` : 'no bridge (browser tab)'
$('bridge').className = `pill ${bridge ? 'on' : 'off'}`
log(bridge ? 'window.deviceBridge found: print goes over IPC to Node.' : 'window.deviceBridge missing: print will be a fetch() from this page to the printer.')

// --- settings (localStorage) -----------------------------------------------
const saved = JSON.parse(localStorage.getItem('printer') ?? '{}')
// ?printer=192.168.1.50:9101 sets the printer once per origin (localStorage is per origin).
const qp = new URLSearchParams(location.search).get('printer')
if (qp) {
  const [h, p] = qp.split(':')
  saved.host = h
  if (p) saved.port = p
  localStorage.setItem('printer', JSON.stringify(saved))
}
settings.host.value = saved.host ?? ''
settings.port.value = saved.port ?? ''
for (const el of Object.values(settings)) el.addEventListener('change', saveSettings)
function saveSettings() {
  localStorage.setItem('printer', JSON.stringify({ host: settings.host.value.trim(), port: settings.port.value.trim() }))
}
// Port is per origin, like the host. Inside the shell it is the raw TCP port
// (9100 on a Zebra); in a browser tab it is the printer's HTTP port (80 on a
// Zebra, 9101 on the mock printer).
function printer() {
  const host = settings.host.value.trim()
  const port = Number(settings.port.value) || (bridge ? 9100 : 80)
  return { host, port }
}

// --- keyboard flow -----------------------------------------------------------
$('ship').addEventListener('submit', (e) => e.preventDefault())
for (const [i, el] of fields.entries()) {
  el.addEventListener('keydown', async (e) => {
    if (e.key === 'Escape') return reset()
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (i === 0) return loadShipment(el.value.trim())
    if (i < fields.length - 1) return fields[i + 1].focus()
    await ship()
  })
}

function reset() {
  shipment = null
  for (const el of fields) el.value = ''
  $('details').hidden = true
  $('pkg').disabled = true
  stopTimer(false)
  fields[0].focus()
}

// --- fake backend -------------------------------------------------------------
// In the real system this came from IFS; the label came from ShipEngine.
// Here it is deterministic from the shipment ID so any ID "exists".
const NAMES = ['Acme Fleet Supply', 'Northwind Trucking', 'Blue Ridge Marine', 'Sunset RV Center', 'Great Lakes Transit']
const CITIES = ['Columbus, OH', 'Des Moines, IA', 'Chattanooga, TN', 'Boise, ID', 'Scranton, PA']
const SERVICES = ['UPS Ground', 'FedEx Home Delivery', 'USPS Priority']
function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }

async function loadShipment(id) {
  if (!id) return
  startTimer()
  log(`loading shipment ${id}…`)
  await sleep(250)
  const h = hash(id)
  shipment = {
    id,
    order: `SO-${100000 + (h % 90000)}`,
    name: NAMES[h % NAMES.length],
    city: CITIES[(h >> 3) % CITIES.length],
    service: SERVICES[(h >> 6) % SERVICES.length],
    tracking: `1Z${(h % 1e9).toString().padStart(9, '0')}${((h >> 2) % 1e7).toString().padStart(7, '0')}`,
  }
  $('order').textContent = shipment.order
  $('shipTo').textContent = `${shipment.name} · ${shipment.city}`
  $('service').textContent = shipment.service
  $('details').hidden = false
  $('pkg').disabled = false
  $('weight').focus()
  log(`shipment ${id} loaded: ${shipment.order}, ${shipment.service}`)
}

async function ship() {
  if (!shipment) return
  const pkg = { weight: $('weight').value || '0', len: $('len').value || '0', wid: $('wid').value || '0', hgt: $('hgt').value || '0' }
  setStatus('purchasing label…')
  await sleep(300) // ShipEngine, in spirit
  log(`label purchased: ${shipment.tracking}`)
  const zpl = buildZpl(shipment, pkg)
  const result = await print(zpl)
  if (result.ok) {
    stopTimer(true)
    setStatus(`Printed. ${result.detail}`, 'ok')
    await sleep(1200)
    reset()
  } else {
    stopTimer(false)
    setStatus(`Print failed: ${result.detail}`, 'bad')
  }
}

// --- the line that matters -----------------------------------------------------
async function print(zpl) {
  const p = printer()
  if (!p.host) {
    log('no printer host set. Use the printer box (bottom right) or ?printer=HOST:PORT', true)
    return { ok: false, detail: 'no printer host set' }
  }
  if (bridge) {
    log(`deviceBridge.print → tcp://${p.host}:${p.port}`)
    const r = await bridge.print({ host: p.host, port: p.port, data: zpl })
    if (r.ok) return { ok: true, detail: `${r.bytes} bytes over IPC → raw TCP` }
    log(r.error, true)
    return { ok: false, detail: r.error }
  }
  // No bridge: try what a web page can try. no-cors, because a printer sends
  // no CORS headers and we do not need to read its reply. From http://localhost
  // this goes through and the printer prints. From an https:// page the
  // browser blocks it before it is sent: mixed content. Open the console.
  const url = `http://${p.host}:${p.port}/pstprnt`
  // ?tas=1 adds targetAddressSpace, which Chrome documents as a way for an
  // https page to reach a private address at the cost of a permission prompt.
  // It is here so we can test whether current Chrome honors it.
  const opts = { method: 'POST', body: zpl, mode: 'no-cors' }
  if (new URLSearchParams(location.search).get('tas')) opts.targetAddressSpace = 'local'
  log(`fetch POST ${url}${opts.targetAddressSpace ? ' (targetAddressSpace: local)' : ''}`)
  try {
    const res = await fetch(url, opts)
    return { ok: true, detail: `fetch → ${res.type} response (the printer got it; the page cannot read the reply)` }
  } catch (e) {
    log(`${e.name}: ${e.message}  (see the console for the real reason)`, true)
    return { ok: false, detail: `${e.name}: ${e.message}` }
  }
}

// --- ZPL ------------------------------------------------------------------------
function buildZpl(s, pkg) {
  const esc = (t) => String(t).replace(/[\^~]/g, ' ')
  return [
    '^XA', '^MNW', '^PW812', '^LL1218', '^CI28',
    `^FO40,40^A0N,36,36^FD${esc(s.service)}^FS`,
    `^FO40,90^A0N,28,28^FD${esc(s.id)} · ${esc(s.order)}^FS`,
    '^FO40,130^GB732,3,3^FS',
    '^FO40,160^A0N,28,28^FDSHIP TO:^FS',
    `^FO40,200^A0N,48,48^FD${esc(s.name)}^FS`,
    `^FO40,260^A0N,40,40^FD${esc(s.city)}^FS`,
    `^FO40,340^A0N,28,28^FD${esc(pkg.weight)} lb · ${esc(pkg.len)}x${esc(pkg.wid)}x${esc(pkg.hgt)} in^FS`,
    '^FO40,400^GB732,3,3^FS',
    `^FO60,460^BY3^BCN,220,Y,N,N^FD${esc(s.tracking)}^FS`,
    '^FO40,1120^A0N,24,24^FDcyc26 · Shipping Station · printed automatically^FS',
    '^XZ',
  ].join('\n')
}

// --- ui bits --------------------------------------------------------------------
function startTimer() {
  t0 = performance.now()
  $('timer').className = 'timer running'
  clearInterval(timerHandle)
  timerHandle = setInterval(() => ($('timer').textContent = `${((performance.now() - t0) / 1000).toFixed(1)} s`), 100)
}
function stopTimer(ok) {
  clearInterval(timerHandle)
  if (t0) $('timer').textContent = `${((performance.now() - t0) / 1000).toFixed(1)} s`
  $('timer').className = `timer ${ok ? 'done' : ''}`
  t0 = 0
}
function setStatus(text, cls = '') {
  $('statusLine').textContent = text
  $('statusLine').className = `status-line ${cls}`
}
function log(text, isErr = false) {
  const el = $('log')
  const line = document.createElement('div')
  line.textContent = `${new Date().toISOString().slice(11, 19)}  ${text}`
  if (isErr) { line.className = 'err'; console.error(text) } else console.log(text)
  el.appendChild(line)
  el.scrollTop = el.scrollHeight
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ?auto=SH-1001 runs the whole flow on load. Handy for rehearsal and smoke tests.
const auto = new URLSearchParams(location.search).get('auto')
if (auto) {
  ;(async () => {
    fields[0].value = auto
    await loadShipment(auto)
    $('weight').value = '12.4'; $('len').value = '18'; $('wid').value = '12'; $('hgt').value = '10'
    await ship()
  })()
}
