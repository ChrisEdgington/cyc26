# Status, as of Thu Sept 3, 2026, morning

Talk is Thu Sept 3, 3:30 PM, Room 2A. Read this first when resuming. Then `docs/run-of-show.md` for the stage checklist and `docs/plan.md` for the reasoning and evidence.

## Done

- **Slides**: 32 slides in `slides/slides.md` (Sept 2 afternoon: cut Enter/Enter/Enter, 11 PM, 1 AM, 3 AM; the rule slide was cut and put back; added "Without the rules" after "Every page is a stranger"; the 13:00 clock moved to the Electron diagram). Speaker notes in the HTML comments. Section clocks re-estimated Sept 3 from word counts: 0:00, 3:00, 12:30, 13:30, 19:30, 22:30, 24:00. Estimate only; confirm at rehearsal. Builds clean. Reviewed once by a second agent; all agreed changes applied. Real screenshots on slides 8 (Chrome's blocked console line), 31 (the Local Network Access popup, and the site settings row on click).
- **Electron shell** in `electron-shell/`: derived from the app-container I built for the customer. Three channels (print over raw TCP 9100, proxy, USB HID scale), origin check on every handler, allowlists in `shell.config.json`, Local Network Access switch and permission handlers, `webSecurity` on. Typechecks and builds. Verified end to end: it loaded the deployed page and printed to the fake printer over IPC.
- **Demo page** in `demo-web/`: keyboard only, `?printer=HOST:PORT` sets the printer once per site, `?auto=SH-1001` runs the whole flow on load. Deployed at https://cyc26-shipping.pages.dev (Cloudflare Pages project `cyc26-shipping`, production branch `main`, deploy with `pnpm web:deploy`). Served locally over plain HTTP on http://localhost:8080 by `pnpm web`.
- **Fake printer** in `mock-printer/`: TCP 9100, HTTP 9101 (`POST /pstprnt`), panel at http://localhost:9102, logs every HTTP request including preflights, renders the label through Labelary when online, forwards each job to a proxybox when `forward.json` exists (copy `forward.example.json`).
- **READMEs** in Chris's voice, no contractions, no jargon. MIT license.
- **Verified on Chris's Mac, Chrome 152.0.7977.65** (details in `docs/plan.md` section 8): an https page reaching an http printer by IP address is no longer blocked as mixed content; it gets the Local Network Access prompt, and Allow lets it through. A hostname is blocked outright the plain way, but **with `targetAddressSpace: 'local'` a hostname works too** (Sept 2 afternoon: `?printer=192-168-1-117.sslip.io:9101&tas=1` printed, job 5 on the mock printer; the same URL without `tas=1` failed as mixed content and no job arrived). Chrome 145 split the permission into local-network and loopback-network; Chrome 147 put WebSockets under it. A Block is remembered per site. **Safari 26.5.2 blocks it outright, no prompt.** The demo is built around exactly that: four steps, same keys each time.
- **Electron's handling of Local Network Access** verified from Electron source and issues (plan section 13).

## Not done, in priority order

1. **Timed rehearsal.** Nobody has spoken this deck against a clock yet. `pnpm slides`, then http://localhost:3030/presenter/.
2. **Demo laptop setup.** All of this was built and tested on the dev Mac; the talk is given from a different laptop. Setup steps are in `docs/run-of-show.md`. Clone, `pnpm install`, run the three processes, set the printer in Chrome (localhost and pages.dev), in Safari (pages.dev), and inside the shell.
3. **Real printer.** The Zebra Chris brought has Wi-Fi. Sept 2 afternoon, on the home network at 192.168.1.41: raw TCP 9100 printed, `POST http://192.168.1.41/pstprnt` on port 80 returned 200 and printed. Browser steps use port 80, the shell 9100. `forward.json` and the proxybox forward are no longer part of the demo. Sept 2 evening, laptop at 192.168.1.231: the deployed https page and the http://localhost:8080 page both posted to `http://192.168.1.41:80/pstprnt` and printed (Chrome, through the extension, so the prompt was auto-granted). Safari against the Zebra: Print failed, no label (Chris, Sept 2 evening). The shell against the Zebra over TCP 9100: printed, no prompt (Chris, Sept 2 evening). All four demo steps verified on the home network. Sept 3 morning, on the demo laptop (192.168.1.65, repo freshly cloned, `pnpm install` done): http://localhost:8080 printed SH-1001 to the Zebra at 192.168.1.41:80 with no prompt. The deployed https page in a fresh Chrome profile showed the Local Network Access prompt; Chris clicked Allow and SH-1002 printed. A run where the permission was not granted failed inside Chrome with `LocalNetworkAccessPermissionDenied` and nothing reached the printer. Chrome 152.0.7977.66 on the laptop. Safari and the shell not yet exercised on the laptop. Still untested: anything in the room. The laptop and the Zebra need a shared network there; see `docs/run-of-show.md`.
4. **Fallback video** of a label printing. Not recorded.
5. **Installers** (`pnpm --filter electron-shell make`). Not built.
6. ~~Repo history~~ Done Sept 3: `CLAUDE.md` is gitignored and out of the repo, `prompt.md` is deleted, and `main` is an orphan branch with a single commit. `building-all-the-things` is deleted on GitHub and locally. The repo is still private; flipping it public is a one-click decision on GitHub.
7. ~~Slide 2 photo~~ No photo exists; the Day 4 slide was cut Sept 3.
8. ~~Enterprise policy names~~ Verified Sept 2 against the Chrome enterprise policy list (the table slide that quoted them was cut Sept 3; the names live here): `InsecureContentAllowedForUrls`, `LocalNetworkAccessAllowedForUrls` / `BlockedForUrls` (142 to 144), `LocalNetworkAllowedForUrls` and `LoopbackNetworkAccessAllowedForUrls` (145+), `WebUsbAllowDevicesForUrls`.

## Things that will bite you if you forget them

- **Chrome remembers Allow and Block per site.** Before every rehearsal and before walking on, set Local network for cyc26-shipping.pages.dev back to Ask (icon left of the address bar, site settings), or step 3 of the demo will not prompt. Right now on the dev Mac it is on Allow.
- **The printer address is the Zebra's address on whatever network you are on**, not 127.0.0.1 (loopback is exempt from all of this). It will change at the venue. If the Zebra does not answer ping or ARP, it is asleep or on a different network; on Sept 2 it took minutes to appear, then worked. The laptop's own address is `ipconfig getifaddr en1` on the dev Mac (en1, not en0).
- **Ports.** Against the Zebra: browser steps use 80 (HTTP `/pstprnt`), the shell uses 9100 (raw TCP). Against the mock printer: 9101 and 9100. A wrong port half-works, which is worse than failing.
- **Do not test the popup through the Claude in Chrome extension.** A tab with the debugger attached gets the permission granted automatically and never prompts. Use a normal window. A Chrome started with `--remote-debugging-port` and its own profile does prompt (Sept 3), so that is a usable way to script a test; `Browser.grantPermissions` with `localNetworkAccess` over CDP does not grant it.
- **The mock printer is now the fallback only.** Its forward to a proxybox is fire-and-forget and not needed for the demo.

## Where things are

| What | Where |
|---|---|
| Orientation for Claude on any machine (layout, commands, voice rules, hard rules) | `CLAUDE.md` at the repo root |
| Read-through script, every slide with its notes in order | `docs/script.md` (and `docs/script.html` for a browser); regenerate with `pnpm script` after editing slides |
| Plan, decisions, evidence | `docs/plan.md` |
| Stage checklist and demo script | `docs/run-of-show.md` |
| Voice rules | Claude's project memory (`chris-writing-voice`); the two guides are in the Sept 2 conversation |
| Deployed page | https://cyc26-shipping.pages.dev |
| Original shell | the customer's app-container, private, on Chris's machine (not named anywhere in this repo) |
| Proxybox API notes | Chris's global CLAUDE.md |
