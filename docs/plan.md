# CYC26 talk plan — "Your Browser Has Trust Issues"

Session page: https://www.commityourcode.com/sessions/your-browser-has-trust-issues-why-local-devices-break-modern-web-apps-kz5slzoc3aoorhfqs5
Repo (goes public before the talk): https://github.com/ChrisEdgington/cyc26 · MIT

**Hard constraints**

| Item | Value |
|---|---|
| Slot | Thu Sept 3, 2026, 3:30–3:55 PM (25 min), Room 2A, Capital One Campus |
| Days left | Two. Everything below is scheduled into them (section 6). |
| Abstract promises | (1) what is happening under the hood, (2) a real-world Electron workaround, (3) what works and what does not |
| Abstract also names | scanners, USB devices with no network interface, new Local Network Access restrictions |
| On stage | Your laptop, a USB Zebra plugged into a proxybox, no dependence on conference wifi for the core demo |

Plan for **24 minutes of content**, with the last two minutes being story you could deliver in one if you had to. First-timer rule: you will run long, not short. Every section has a cut line.

---

## 1. How the talk is put together

The story is the frame. The technical content lives *inside* the all-nighter. The title is the thesis: everything the browser blocks is "the browser does not trust ___," and the floor needs trust decided once, by whoever installs the software. Two rules carry the story. "People before process" opens it: why you were on site, why printing could not involve a dialog or a click. "Promise less, deliver more" closes it: the workers were promised a label, they got three packages in 29 seconds, and that gap is why they clapped. Both are told through the story, never as a lecture slide. Proxybox is named once, on the LAN-box slide.

```
Opening ── day 4, people before process, "print just happens" ── red error, <24h
   │
   ▼
Under the hood ── both ends were plain http at the desk; then: it does not trust a lower clearance, your page, your network, or that you meant it ── on the floor, trust is decided once
   │
   ▼
The all-nighter ── 11 PM the print dialog works (and fails the people rule);
                   1 AM Chrome docs, MDN, Chromium source; 3 AM: what if the browser is not the one talking?
   │
   ▼
Electron shell, live ── same URL, the only thing that changed is what is wrapped around it ── "it is an installer, not a URL"
   │
   ▼
"We have 45 USB ones." ── the table ── a real cert on a private IP still gets a prompt ── so give the device a public address
   │
   ▼
9 AM ── "the promise: it prints a label" ── he ran it, not you ── 3 packages, 29 seconds ── applause. Repo QR. Done.
```

No self-introduction. The emcee/schedule has "Chris Edgington, EdgeCraft Studio". The talk title does not appear until slide 10, and from there "trust" is said on everything the browser blocks slide and on the table.

## 2. Agenda with clock targets

| Clock | Section | Beats | Cut line if running long |
|---|---|---|---|
| 0:00–4:30 | **Opening** | Day 4 at a desk in the warehouse. Why you were there: people before process. You watched them work. The good tools were enter-enter-enter on a big keyboard; the shipping app was pulldowns and a mouse, 2.5–3 minutes a package, and they are measured on speed. So the rules: no mouse, no screen changes, no dialog, no extra click. Print just happens. It printed. You told the customer "it works." (Works, not fast.) Demo tomorrow, 30 people. Then the admission: you had not deployed it. The rule is test on the real thing first, and you had just broken it. Deployed to a real domain that evening. Click. Red error. Less than 24 hours. | Do not cut. Hook and thesis. |
| 4:30–10:30 | **Under the hood** | Title reveal, and it is fair: a public page is poking at hardware on someone's LAN. The one thing it trusts: localhost. Then the four things the browser blocks, each the same sentence: it does not trust a lower clearance (mixed content), your page (CORS), your network (Local Network Access), or that you meant it (WebHID/WebUSB: a real click, a ~5 s window, a chooser, Chromium only). Then the why, one slide: every page is a stranger running from your network position, so the browser makes the human the only vote, in the moment; that is what LNA and user activation are for, and none of it is a bug. But on the floor, that rule is the opposite of the job: the software is known, the people are measured on speed, and trust has to be decided once, at install, not per request or per click. That is the requirement the browser cannot meet by design. | Compress the USB block to one sentence; it comes back at 18:30. |
| 10:30–13:00 | **The all-nighter** | 11 PM: confirmed the browser print dialog works. It is a dialog and a click on every package. Fallback, not the answer. 1 AM: Chrome docs, MDN, chrome://flags, the Chromium source, looking for *any* way to fetch from HTTPS to a private IP. There is not one you can ship to 30 workstations. 3 AM: what if the browser is not the one talking? | Shorten the 1 AM part to one sentence. |
| 13:00–18:30 | **The Electron shell (live)** | One architecture slide. Walk the repo: main creates a window and loads the HTTPS URL; preload exposes `bridge`; the web app feature-detects it; main's IPC handler writes to a raw socket on 9100. Now the shell decides who to trust, and writes the list down. Demo: same page in Chrome → red error; in the shell → label comes out of the Zebra, no dialog, no prompt, no click. "It is an installer, not a URL": that is the cost of deciding trust once. | Fewer code slides; keep the two-click demo. |
| 18:30–22:30 | **What works, what does not** | "Oh, we have 45 USB ones." The browser has no path to a USB printer and the shell did not either. The table, in worst-to-best order, with a column for what still gets in the way. Then the prompt itself, full screen: deliberately scary, and corporate IT trains everyone to click No. One No is remembered per origin, so printing is dead silently until a support ticket gets someone into site settings to clear the block and re-trigger the prompt; multiply by every workstation and every new hire. That is the LNA section the abstract promised. Then the last option: a real cert on a private IP works, but Local Network Access keys on address space, not TLS, so the browser makes the user confirm that the app may talk to local devices. That is friction of the same kind as the print dialog. You asked the group building LNA for a CORS-like way to pre-configure trust between a device and an app; they declined. So give the device a public address: public addresses never prompt, and the LAN box behind a tunnel becomes a publicly routable HTTPS REST API with nothing blocked and nothing to click. Say the cost too: the internet is now between the desk and a printer six feet away. Proxybox, once, here. | Cut the prompt story to one sentence; keep the screenshot. |
| 22:30–24:00 | **Close** | 9 AM. A private walkthrough with the production manager, once. What the floor had been promised: the new system prints a label. That was the whole promise. (Notes: the pattern you see now, especially with LLM-built apps: demo at the first cool moment, promise the moon, hit the hard parts later. You do the opposite.) Then the real demo, 30 workers watching, and *he* ran it, not you. It worked exactly as it was supposed to. Three packages in 29 seconds. They clapped. Final slide: the two rules and the repo. | Do not cut. Six slides, a few words each; it fits if you let the pauses do the work. |

## 3. Slide list (one line per slide, this is the time gauge)

38 slides (Sept 2: slides 12–15 each gained two click lines, What and Why, and a new slide 16, "Four questions," summarizes them; the under-the-hood section now ends at 10:30 and the all-nighter starts there. Slide numbers below are one lower than the deck from slide 16 on.) Sparse on purpose: a line of text, occasionally a screenshot, a diagram, or a code block. Section-opening slides carry a small clock badge in the corner. Speaker notes carry the part. The number you watch is the section clock, not the slide count: arrive at a section slide more than a minute late and you take that section's cut line.

**The idea that runs through it.** The title is the thesis. Everything the browser blocks in the middle of the talk is the same sentence with a different object: *the browser does not trust ___.* The floor needs the opposite: trust decided once, by whoever installs the software, and never asked about again. The shell is the thing the browser does not have to trust, because IT already did. Say "trust" on everything the browser blocks slide and on the table; it is the word that ties the title to the applause.

**Opening**
1. `It worked on localhost.` — 0:00
2. `Day 4.` (photo of the desk/printer if you have one)
3. `People before process.` — why you were on site: watch the work, ask "what would you change?"
4. `Enter. Enter. Enter.` — the good tools vs. the shipping app: pulldowns, a mouse, 2.5–3 minutes a package, and they are graded on speed. Say who they are: non-technical, often temporary seasonal staff; the software has to be obvious on day one
5. `No mouse. No dialogs. Printing just happens.` — the rules you set before writing code: automatic, no configuration by the user, no timing tricks
6. `It printed.` — sub: `"It works." Tomorrow. 30 people.` — notes: you told the customer it works; you said nothing about fast (slide 33 depends on that distinction)
7. `I had not deployed it.` → `Test on the real thing first.` → `https://` — the rule, stated as the one you broke: you told the customer it works before confirming it in a deployed environment. Own it in one sentence, no apology, then move. (three clicks, one slide)
8. (screenshot) the red console error, full size, from *current* Chrome
9. `Less than 24 hours.` — 4:30

**Under the hood: what the browser does not trust**
10. `Your browser has trust issues.` (title reveal) — notes: and to be fair, it should. It is a public website poking at hardware on someone's LAN.
11. `Both ends were plain http://.` — why it worked at your desk: no downgrade, nothing to block; not because localhost is special
12. `It does not trust the wire.` — sub: `mixed content` — `https:// → http://` blocked before the request is sent; no flag you can ship
13. `It does not trust your page.` — sub: `CORS` — the device has to say it trusts the page, in headers; printers do not speak
14. `It does not trust your network.` — sub: `Local Network Access` — public → local now asks the human, per site, and it is tightening; the prompt itself and what it does to a floor is slide 30
15. `It does not trust that you meant it.` — sub: `WebHID · WebUSB · WebSerial` — a real click, a ~5 s window, a chooser the human has to pick from, Chromium only. Hardware only when a human just proved intent.
16. `Every page is a stranger.` — sub: `So the human is the only vote that counts.` — the why, one slide: a browser runs code from anyone, from your network position, with your cookies. Pre-LNA a page could CSRF your router, printer, NAS from inside the LAN; real attacks did. Autoplay, popups, and drive-by device grabs are why audio, window.open, WebUSB/WebHID/WebSerial all need a click and a chooser. The browser cannot tell your app from a phishing page, so its only trustworthy signal is a human proving intent right now. Everything the browser blocks is that one rule, and "none of this is a bug." Sets up 17 as the opposite.
17. `On the floor, trust has to be decided once.` — not per request, not per click, not in a five-second window. Automatic, zero configuration by the user, no timing. That is the requirement the browser cannot meet, by design. — 9:30

**The all-nighter**
18. `11 PM — the print dialog works.` — sub: `A dialog. A click. Every package.` — the browser trusts the human's click, not your page; confirmed as the fallback; people before process says it is not the answer
19. `1 AM — chrome://flags. MDN. The Chromium source.` — looking for any way to fetch from HTTPS to a private IP that you could ship to 30 workstations; there is no flag that ships trust
20. `3 AM — what if the browser is not the one that has to trust us?` — 13:00

**The Electron shell**
21. (diagram) `web app → renderer → IPC → Node → printer` — IT installs the shell; that is the trust decision, made once
22. (code) `main.ts` — window + `loadURL(https://...)` (lifted from the real app-container, trimmed)
23. (code) `preload.ts` + the web app call — `contextBridge.exposeInMainWorld('deviceBridge', ...)` on top, `window.deviceBridge?.print(zpl) ?? fetch(...)` below
24. (code) `ipc/print.ts` — the raw socket write, *with the real comment about Zebra being timing-sensitive to fetch vs socket*
25. `Now the shell decides who to trust.` → `…including the local network.` (two clicks) — allowed origins, sender check on every channel, proxy allowlist, contextIsolation, no nodeIntegration, `webSecurity` back on; and Local Network Access: Electron ships with the LNA check off (feature_list.cc) and exposes `local-network` / `loopback-network` as permissions you grant in code for your origins (section 13). You took a check away from the browser; you put a smaller, explicit one in its place, decided once.
26. `Live.` (browser tab fails → shell prints, label comes out of the Zebra, no dialog, no prompt, no click)
27. `It is an installer, not a URL.` — sub: `an .exe, uploaded to SharePoint` — that is the cost of deciding trust once — 18:30

**What works, what does not**
28. `"Oh, we have 45 USB ones."` — hold up the USB Zebra. The browser has no path it will trust. Neither did the shell.
29. (table) approach / what still gets in the way / who decides trust, and how often / passes the people rule? — rows in worst-to-best order: HTTP-only app · print dialog · flags & policies · HTTPS on the printer itself · localhost agent (QZ Tray, Zebra Browser Print) · Electron shell · LAN service on an internal hostname (spurl) · LAN box, real cert, private IP (prompts under LNA now) · LAN box behind a public tunnel (no blocks; internet in the path) — caption: `Trust is decided by whoever installs it.`
30. (screenshot) the real Local Network Access prompt from current Chrome, full size, the exact wording — notes: read it out loud the way a warehouse worker would. It is deliberately scary. Corporate IT trains everyone to click No on anything that looks like that. One No and printing is dead, silently, because Chrome remembers the No per origin and just blocks every later request without asking again. The fix is a support ticket, a remote session, someone finding the site settings and clearing the block, then triggering another request so the user gets the prompt a second time and clicks Yes. Multiply by every workstation, every profile reset, every new hire. This is what "friction" means in production. — the section about LNA the abstract promised lives here, not on slide 14
31. `A real cert on a private IP still gets a prompt.` → `I asked. The answer was no.` → `So give the device a public address.` (three clicks, one slide) — the middle click: you went to the group developing Local Network Access and proposed a CORS-like protocol so a device and a web app could be pre-configured to trust each other, securely, with no prompt for the user. They declined. Say it flat, not bitter; state their position as you understood it (the confirmation should come from the user, not from configuration) and link the thread in the notes and README so developers who want to push can. That is the whole talk in one exchange: the browser's trust is the user's to give, not yours to configure. Then the list of options: spurl on an internal hostname (LAN service) → a Pi with Caddy, a real cert, and DNS pointing at a private IP; that still works, but Local Network Access keys on address space, not TLS, so the user now has to confirm the app may talk to local devices: friction, same family as the print dialog → the same box behind a public tunnel: public addresses never prompt, so it is a publicly routable HTTPS REST API, real cert, CORS you control, nothing blocked and nothing to click left. Cost, said out loud: the internet is now in the path between the desk and the printer six feet away. Proxybox named once, here.

**Close**
32. `9 AM.` — 22:30 — notes: the private walkthrough with the production manager, once through
33. `The promise: it prints a label.` — that was all anyone had been told; notes carry the demo-too-early / LLM-era observation in two sentences, no more
34. `He ran it.` — sub: `Not me. He had seen it once.` — a non-technical user, one look, no mouse, no dialog, no prompt, exactly as it was supposed to work. Both rules in one sentence.
35. `3 packages. 29 seconds.` (sub: `2.5–3 minutes each` struck through)
36. `They clapped.`
37. (QR) github.com/ChrisEdgington/cyc26 + `People before process. Promise less, deliver more.` — optional third line as the title callback, your words not mine: something like `Your browser has trust issues. Your users should not have to.` — 24:00

## 4. Tooling

**Slides: Slidev.** Markdown-per-slide, presenter view with an elapsed timer and speaker notes (that *is* the time gauge), code blocks with click-through line highlighting, PDF export for the organizers. A tiny global component renders a `clock:` frontmatter value in the corner.

**Electron: the original app-container's own setup**, esbuild bundle + Electron Forge, upgraded to current Electron, with `maker-dmg` added. Fewer moving parts to explain from a stage than the Forge Vite plugin.

**Repo: pnpm workspace**, four packages, MIT. This repo is what people fork.

## 5. Repo layout and demo flow

```
cyc26/
├── README.md                 # what this is, links to talk + each package, fork guide
├── LICENSE                   # MIT
├── docs/
│   ├── plan.md               # this file
│   └── run-of-show.md        # printable one-page clock card
├── slides/                   # Slidev deck
├── electron-shell/           # the forkable piece, derived from app-container
│   ├── shell.config.json     # { appUrl, allowedOrigins, proxyAllowlist, printer: { host, port } }
│   ├── src/main.ts           # window, loadURL, navigation guards, IPC registration
│   ├── src/ipc/proxy.ts      # HTTP through Node, allowlisted targets
│   ├── src/ipc/print.ts      # raw TCP 9100, validates sender origin
│   ├── src/ipc/usb.ts        # node-hid scale: listDevices / subscribeDevice / getDeviceData
│   ├── src/preload.ts        # contextBridge → window.deviceBridge
│   ├── src/types.ts          # the IPC contract, shared with demo-web
│   ├── forge.config.ts
│   └── README.md             # fork me: change appUrl, add a channel in 3 steps
├── demo-web/                 # "Shipping Station" page; Cloudflare Pages + plain http://localhost:8080
└── mock-printer/             # TCP 9100 listener; shows ZPL; optionally forwards to a proxybox
```

**Stage print path.** The audience sees paper come out of a USB Zebra, and the shell never has to know about USB:

```
demo-web (https, in the shell) ──IPC──▶ Node ──TCP 9100──▶ mock-printer (laptop)
                                                                │
                                              HTTPS POST /api/v1/print/<tag> (X-API-Key)
                                                                ▼
                                                    proxybox ──USB──▶ Zebra ──▶ 🏷️
```

The mock printer's forward target (host, tag, key) comes from env or a config file, filled in at the venue. Until then it is tested against pbx-d8a4's existing 4x6 tag. Forwarding off = the mock printer just shows the ZPL in a "PRINTED" panel, which is the no-hardware fallback.

**Electron shell design points (these are also talk content)**
- Three channels straight from the original container: `proxy` (how you get around CORS), `print` (raw TCP to 9100, the Zebra path, with the timing comment kept verbatim), `usb` (node-hid, the scale). One per category of "thing the browser will not let you touch". `window.spurl` becomes `window.deviceBridge`.
- Keep the packaged-vs-dev URL switch and the settings-file override; keep the `will-quit` HID cleanup with its 3-second timeout.
- Changes, each of which is a line on slide 24: `webSecurity` back on; `sandbox: true`; allowlist proxy targets and printer hosts; check `event.senderFrame.url` against `allowedOrigins` in every handler; deny `setWindowOpenHandler`; drop `electron-squirrel-startup`, the version script, the icon, the customer's URL.

**demo-web design points**
- One screen at toy scale: shipment ID → package fields → Enter. No print button. Keyboard only, tab order deliberate, label prints when the shipment completes. The page embodies the people rule.
- Deployed at https://cyc26-shipping.pages.dev (Cloudflare Pages, production branch main; `pnpm web:deploy`). Locally it is served plain HTTP on http://localhost:8080 by `serve.mjs`, no TLS, on purpose.
- The demo replays the story in order: (1) http://localhost:8080 → prints, (2) https://cyc26-shipping.pages.dev → blocked, (3) the shell loading that same HTTPS URL → prints. The printer host must be the laptop's LAN address, not 127.0.0.1, because loopback targets are exempt from mixed-content blocking. `?printer=HOST:PORT` sets it once per origin; `?auto=SH-1001` runs the whole flow on load for rehearsal.
- The demo depends on venue internet for steps 2 and 3 (the page is on Pages). The organizers say internet is reliable; the recorded video is the fallback.
- The global is `window.deviceBridge`, not `window.bridge`: a browser extension on the dev machine already defined `window.bridge`, and the page must detect the shell by `typeof deviceBridge.print === 'function'`, never by the object alone.

## 6. Two-day schedule

**Today (Sept 1)**
1. Slidev deck with all 35 slides, clock badges, speaker notes from section 2. *First timed rehearsal tonight, before anything else is polished.*
2. Workspace scaffold; `electron-shell` from app-container with the changes above; `mock-printer` with the PRINTED panel and proxybox forward; `demo-web` on Pages and on http://localhost:8080.
3. Reproduce the error in current Chrome: localhost → printer and HTTPS → printer. Screenshot both. Pick the truth for slide 8 and the "red herring" part.
4. End of day: shell → mock printer → panel works end to end on the laptop. Also the LNA pair: fetch pbx-d8a4's LAN address over HTTPS from the demo page in Chrome (prompt) and in the shell (no prompt). Screenshot both.

**Tomorrow (Sept 2)**
5. Plug the USB Zebra into the proxybox, fill in the forward config, print a real label through the whole path. Test on the exact laptop, exact cables, exact projector adapter if you have it. Your rule.
6. Record a 20-second video of the label printing as the last-resort fallback.
7. Forge `make` for dmg (and exe if a Windows box is handy); demo-web to Cloudflare Pages; README + fork guide; LICENSE; QR for slide 37; flip the repo to public.
8. Rehearsals two and three, one in front of a person. Pin the Chrome version on the laptop; disable auto-update until Thursday.

**Thursday morning**: PDF export of the deck on a USB stick and in the cloud. Charge everything.

## 7. Demo risk list of options

| Fails | Fallback |
|---|---|
| Proxybox unreachable from the laptop (its public hostname needs internet; `.local` needs a shared LAN) | Mock printer forward off; the PRINTED panel is the demo. Say "and on the floor, this is a real label." |
| Real Zebra will not print | Same: panel, not paper |
| Shell will not launch | Play the recorded video; keep talking |
| Chrome updated and the error text changed | Slide 8 screenshot is the source of truth |
| Projector/laptop swap | PDF deck on a USB stick and in the cloud |
| Conference wifi | Steps 2 and 3 of the demo load the page from Pages. Organizers promise reliable internet; if it fails, the recorded video, and the shell can be pointed at http://localhost:8080 via the userData override to at least show IPC printing |

## 8. Claims to verify before you say them on stage

- The exact error, reproduced in current Chrome (schedule item 3). You remember it as CORS; Chrome has changed in two years.
- The working group: DROPPED entirely (Sept 3, 2026). No slide or note mentions it any more; the point about the decision staying with the user is made by the prompt slide.
- Local Network Access, VERIFIED 2026-09-02 on Chris's Mac: from https://cyc26-shipping.pages.dev, `fetch(http://192.168.1.117:9101/pstprnt, { mode: 'no-cors', targetAddressSpace: 'local' })` produced the LNA prompt; after Allow, the POST reached the mock printer (origin header = the pages.dev site, no preflight) and the console showed the mixed-content *warning* wording ("This content should also be served over HTTPS"), not the blocked wording. Then, with the permission already granted, the SAME request WITHOUT targetAddressSpace also went through (status "Printed", console showed the warning wording). So in Chrome 152 a private-IP-literal target is exempt from mixed content blocking with or without the option, and is governed by the LNA permission instead. Hostnames (other than .local) are still blocked as mixed content per the Chrome blog. Safari 26.5.2 on the same Mac, same URL: "Print failed: TypeError: Load failed", no request reached the mock printer. Safari console (Chris pasted it): "[blocked] The page at https://cyc26-shipping.pages.dev/... requested insecure content from http://192.168.1.117:9101/pstprnt. This content was blocked and must be served over HTTPS." followed by "Not allowed to request resource" and "Fetch API cannot load ... due to access control checks." So Safari still hard-blocks HTTPS → HTTP to a private IP with no prompt and no option; Chrome is the outlier that turned the block into a permission. Demo is now four steps: localhost in Chrome (prints), HTTPS in Safari (blocked, the original story), HTTPS in Chrome (the prompt, click Block, reload, silent fail), the shell (prints). Slide 8 is captured with a hostname target in Chrome so the blocked wording appears. Chrome 152.0.7977.65 (arm64). Still to capture: the prompt screenshot for slide 30 (reset the site permission first, then reload with &tas=1), the site-settings screenshot, and the control run without &tas=1 for the slide 8 blocked wording. Prompt shipped in Chrome 142 (per the reviewer's sources).
- Enterprise policy names for the flags row of the table. Look them up, do not quote from memory.
- Zebra's HTTP print endpoint path, for the table only; the shell uses 9100.
- WebHID with the scale: confirmed from MDN that `requestDevice()` needs transient activation and a secure context, and that it is Chromium-only. Not yet confirmed: whether what you hit two years ago was the gesture rule, the OS driver, or the HID blocklist (`disable-hid-blocklist` is commented out in the original main.ts). A scale usage page is not on the published blocklist. One test if you want to say it precisely.
- Resolved Sept 3: the `print` handler only writes raw TCP 9100. The HTTP branch was removed because Zebra documents `/pstprnt` as one-way, always 200, and not for critical jobs, and some models lack it; 9100 is on every networked Zebra.

## 9. Decisions made (all confirmed)

- Two days, full build: shell, demo page, mock printer, installers, Pages deploy, fork guide.
- All-nighter parts are the real ones: print dialog confirmed as fallback; long dig through Chrome docs, MDN, flags, and Chromium source. HTTPS-on-printer and localhost agent were not tried and live only in the table.
- This repo is what people fork; MIT; QR points at github.com/ChrisEdgington/cyc26.
- USB Zebra on stage, plugged into a proxybox; mock printer forwards to it; forward target configurable, filled in at the venue.
- The USB chapter is real history: after network printing worked, "we have 45 USB ones" → no browser path, no shell path → that drove the LAN box with a REST API.
- spurl = "secure print from URL": a Node service on an internal hostname (the customer's internal DNS, an existing Linux VM) that took a URL + destination device, fetched the ZPL from the shipping provider, and printed it. It is the LAN-service option of the list of options on slide 31.
- Scale channel stays in the template (native module; README gets a rebuild step).
- Demo page public URL is the Cloudflare Pages default `*.pages.dev`.
- Assumed unless you say otherwise: Slidev, esbuild kept from app-container, vanilla HTML for demo-web.

## 10. Source material: the real app container

The customer's app-container (private, on Chris's machine): Electron 36, Node 22, esbuild bundle of `src/main.ts` + `src/preload.ts`, Electron Forge with Squirrel (Windows) and ZIP (mac) makers, `electron-settings` for the URL override, distributed as an `.exe` via SharePoint. It has `proxy`, `print` (raw socket), and the node-hid scale. It never got USB printer support; that gap is the 45-printers story. It ships with `webSecurity: false`, `contextIsolation: true`, `nodeIntegration` off by default, no sandbox, no origin checks, and a `proxy` that accepts any URL from the renderer. Section 5 lists what changes.

## 11. Decided: own the localhost moment

"It worked on localhost" *is* the demo-too-early pattern, and you said so: you told the customer it works without confirming it in a deployed environment. Slide 7 carries it as one sentence, stated as the rule you broke, no apology. It makes the closing rule land as earned: you never overpromised the *outcome*, only the readiness, and the all-nighter is what that cost.

## 12. The options, worst to best (why the tunnel is last, and not a sales pitch)

Each option gets around one or two of the things the browser blocks and leaves the rest; the private-IP box works but still gets the prompt; only the last option gets past all of it with nothing to click.

| Option | Gets past | Still in the way |
|---|---|---|
| Print dialog | mixed content, CORS | a click and a dialog per package |
| Electron shell | every browser block for the pages it loads, LNA prompt included (off by default in Electron; your permission handler when it lands) | mixed content still blocked with `webSecurity` on, so raw HTTP/TCP devices go through IPC; an installer per workstation; no USB path in the version you shipped |
| LAN service, internal name (spurl) | the device's lack of HTTPS/CORS | mixed content unless the name has a real cert; LNA prompt |
| LAN box, real cert, private IP (Pi + Caddy + DNS) | mixed content, CORS | **LNA prompt**: works, but the user has to confirm the app may talk to local devices; TLS does not remove it, and the group declined a pre-configuration protocol when you asked |
| LAN box behind a public tunnel | all of it: public address, real cert, CORS you control | the internet is in the path; if it is down, so is the printer six feet away |

That last cell is the honest sentence that keeps slide 31 from sounding like a sales pitch.

## 13. Local Network Access inside Electron (verified 2026-09-01)

**Short version: in Electron the LNA prompt does not exist, by default, and when Electron does wire it up the decision lands in your code.** That makes the shell *more* viable after LNA, not less, and it is a line on slide 25.

Evidence, in order of authority:

1. **Electron source, `shell/browser/feature_list.cc` on `main`:** `InitializeFeatureList()` unconditionally appends `network::features::kLocalNetworkAccessChecks` to the *disabled* features list, with the comment "Needed until we rework some of our logic and checks to enable this properly." The network-layer LNA check is off in every Electron app, no flag required.
2. **`shell/browser/net/url_loader_network_observer.h`:** `OnLocalNetworkAccessPermissionRequired(...)` is an empty override. Even if the check fired, the "ask the user" callback does nothing.
3. **electron/electron#48655** ("Local Network Access plans and default behavior", Oct 2025): the Chromium LNA tech lead recommends `app.commandLine.appendSwitch('disable-features', 'LocalNetworkAccessChecks')` as the short-term knob and says the flag will eventually go away; the Electron maintainer says permission handling will be added once the API stabilizes. A VS Code engineer in June 2026: "it is currently hard disabled in Electron."
4. **electron/electron#50391** (Electron 41, Mar 2026): confirms the disable is in `feature_list.cc`, and notes a second, separate layer, the *permissions policy*, which is not touched. Effect: requests succeed, but `navigator.permissions.query({name:'local-network-access'})` can report `denied` inside cross-origin iframes. Workaround if you ever need iframes: `app.commandLine.appendSwitch('local-network-access-permissions-policy-default-enabled')`.
5. **Electron `session` docs (merged Aug 26, 2026, PR #53170):** `setPermissionRequestHandler` / `setPermissionCheckHandler` now enumerate `local-network`, `loopback-network`, and the older `local-network-access`. That is the future-proof hook: grant them for `allowedOrigins`, deny for everything else, decided once, in code, no prompt.

**What still applies inside the shell.** Mixed content is a different mechanism and is still enforced when `webSecurity` is on: an HTTPS page in the shell can call an HTTPS device on a private IP with no prompt, but still cannot call plain `http://<printer>`. So the IPC print path stays for raw HTTP/TCP devices, and the LNA finding is about the *other* option: the LAN box with a real cert on a private IP, which prompts in Chrome and does not prompt in the shell.

**Template changes**
- In `main.ts`, before `app.whenReady()`: `app.commandLine.appendSwitch('disable-features', 'LocalNetworkAccessChecks')`. Redundant today (Electron already does it), explicit for readers and for the day Electron stops doing it by default; comment it that way.
- Register `setPermissionRequestHandler` and `setPermissionCheckHandler` that grant `local-network`, `loopback-network`, `local-network-access` when the requesting origin is in `allowedOrigins`, and deny otherwise. No-op today, correct later. Same handler is where `hid`/`usb`/`serial` get decided if a forker wants WebHID inside the shell.
- Phase-2 test (add to schedule item 4): from the demo page inside the shell, fetch `https://<pbx-d8a4 LAN address>/api/v1/printers` with the API key. Expect: no prompt, 200. Same fetch in Chrome: the prompt. Screenshot both; that pair is the strongest version of slide 25.

**Talk content**
- Slide 25, add a line: `…and local network access.` The shell turns the LNA check off and hands you the permission handler. Trust decided once, in code.
- Slide 31, the list of options: the private-IP LAN box prompts in Chrome; the same box called from inside the shell does not. Electron + a LAN box with a real cert is a legitimate option on its own.
- Table row "Electron shell": what still blocks you = *mixed content only* (HTTPS → HTTP still blocked; use IPC or put a real cert on the device). LNA: none.
