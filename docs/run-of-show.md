# Run of show — Thu Sept 3, 3:30–3:55 PM, Room 2A

Watch the clock badge on the slide, not the slide count.

## The talk, one paragraph per section

**Opening, 0:00, slides 1 to 5.** Day four at the customer's warehouse, a desk in the middle of it. Shipment in, label out of the Zebra. It printed, and you told them it works. They scheduled 30 people for the next day. People before process is why there can be no mouse, no dialog, no click. You had not deployed it. That evening, on HTTPS: red console, the request never left the browser.

**Under the hood, 3:00, slides 6 to 16.** Less than 24 hours, so here is what the browser was doing. Every block is the same sentence with a different object: the browser does not trust a lower clearance (mixed content, and the lock is the promise behind it), your page (CORS), your network (Local Network Access), or that you meant it (USB, HID, serial). The four questions side by side. The incidents that put each rule there. What the web would be without them.

**Trust decided once, 12:30, slide 17.** Every assumption behind those rules is wrong on a warehouse floor. The software is not a stranger: IT chose it, installed it, and is accountable for it. The worker is the busiest person in the building, non-technical, often seasonal, and should never be asked to make a security decision. Trust has to be decided at install, by whoever installs it.

**The shell, 13:30, slides 18 to 24.** The 3 AM flip: what if the browser is not the one that has to trust us. Same HTTPS page, wrapped in Electron. Print goes over IPC to Node and out a raw socket to port 9100. Four code slides: the fetch that printed at your desk, preload, the handler, and the one change to the page. Then live: localhost prints, Safari fails with no prompt, Chrome prompts and remembers the No, the shell prints with nothing to click.

**What works, 19:30, slides 25 to 26.** The cost: an installer on every workstation, an .exe on SharePoint. Then where it ended up: a Pi with the printer on USB behind an HTTPS API, a public IP through a tunnel and a name for the certificate, so the browser never asks. The cost said out loud: the internet is in the path to a printer six feet away. Then the request that settled it: print from the backend. No browser, no desk, and no Electron on an iPad either. The box is an HTTPS API to every caller, nothing to manage on the client, and for the first time the printer is behind a key instead of open to the whole LAN. Proxybox, named once.

**Close, 21:00, slides 27 to 32.** 9 AM. One private walkthrough with the production manager. The promise was only that it prints a label. He ran it, not you. Three packages in 29 seconds against three minutes each. They clapped. Repo.

| Clock | Slide | On the screen | Cut if late |
|---|---|---|---|
| **0:00** | 1 | **Opening.** It worked on localhost. | do not cut |
| 0:40 | 2 | People before process. | |
| 1:20 | 3 | No mouse. No dialogs. Printing just happens. | |
| 2:05 | 4 | I had not deployed it. | |
| 2:30 | 5 | The red console. | |
| **3:00** | 6–8 | **Under the hood.** Less than 24 hours. Trust issues. Both ends were plain http. | |
| 3:50 | 9 | Lower clearance (mixed content). | policy paragraph to one sentence |
| 5:20 | 10 | The lock: connection is secure. | one sentence and move on |
| 6:00 | 11 | Your page (CORS). | |
| 7:20 | 12 | Your network (Local Network Access). | |
| 8:40 | 13 | That you meant it (USB, HID, serial). | to one sentence |
| 9:40 | 14 | Four questions. | |
| 10:20 | 15 | Every page is a stranger (the incidents). | incidents to two |
| 11:45 | 16 | Without the rules. | |
| **12:30** | 17 | **On the warehouse floor, trust has to be decided once.** | |
| **13:30** | 18 | **Electron shell.** What if the browser is not the one that has to trust us? | fewer code slides, keep the demo |
| 14:15 | 19 | The fetch, day four. | |
| 14:35 | 20 | preload.ts, 3 AM. | |
| 14:45 | 21 | main.ts, the handler. | walk it once, no line-by-line |
| 15:05 | 22 | The one change to the page. | |
| 15:25 | 23 | Now the shell decides who to trust. | |
| 15:45 | 24 | Live demo. Four steps, about four minutes. | if the Zebra is silent, the mock printer panel |
| **19:30** | 25 | **What works.** An installer, not a URL. | |
| 19:45 | 26 | Then they asked the backend to print. | lock paragraph to one sentence |
| **21:00** | 27–28 | **Close.** 9 AM. The promise. | do not cut |
| 21:30 | 29–31 | He ran it. 3 packages, 29 seconds. They clapped. | |
| **22:30** | 32 | QR codes: pbxz.io, the repo, x.com/EdgingtonC. | |

The clock badge in the corner of each of these slides shows the same target time in the presenter view. Bold rows are section starts; if you are more than a minute behind at one, take that section's cut.

## Setting up the demo laptop (not the dev machine)

```sh
git clone https://github.com/ChrisEdgington/cyc26 && cd cyc26
pnpm install                       # downloads Electron, builds node-hid
pnpm web                           # terminal 1
pnpm printer                       # terminal 2, the fallback printer and its panel
cd electron-shell && pnpm start    # terminal 3, once, to confirm it launches
```

- **The printer is the real Zebra on Wi-Fi.** Verified Sept 2 on the home network at 192.168.1.41: raw TCP 9100 and `POST http://<zebra>/pstprnt` on port 80 both print. The browser steps use port **80**; the shell uses **9100** / tcp.
- **The laptop and the Zebra must be on the same network in the room.** Conference Wi-Fi usually isolates clients and the printer cannot pass a captive portal. Bring your own network (phone hotspot or travel router), join both to it, and give the Zebra a fixed address on it. Its address on that network is `<ZEBRA-IP>` below; it will not be 192.168.1.41.
- **Wake it before walking on.** Sept 2: from the laptop, ping and ARP to the Zebra failed for minutes, then everything worked. Print one label from the laptop (`printf '^XA^FO40,40^A0N,40,40^FDready^FS^XZ' | nc -w 5 <ZEBRA-IP> 9100`) right before the talk.
- **macOS asks once per app.** On macOS 15 and later the first time the shell (and Chrome, and Safari) opens a connection to the Zebra, the OS shows "would like to find and connect to devices on your local network". Click Allow. If it is missed or denied, macOS never asks again and the connection silently times out; the fix is System Settings, Privacy and Security, Local Network. Do the first print from each of the three apps before walking on, and check all three are on in that list.
- Visit once with `?printer=<ZEBRA-IP>:80` on http://localhost:8080 in Chrome, on https://cyc26-shipping.pages.dev in Chrome, **and** on https://cyc26-shipping.pages.dev in Safari, so all three remember it. Inside the shell, open the printer box once and set `<ZEBRA-IP>` / `9100`.
- Fallback printer: the mock printer on this laptop. Its panel is http://localhost:9102. To switch to it, set the printer to `<LAPTOP-IP>:9101` in the browsers and `<LAPTOP-IP>` / `9100` in the shell. `forward.json` is no longer needed.
- Pin Chrome; no auto-update until Thursday. Fallback video on the desktop. PDF of the deck on a USB stick.
- Presenter view: `pnpm slides`, then `/presenter`. Timer starts on first advance.

## Demo script (slide 24, "Live demo.")

The story, in order, with the same keystrokes each time: shipment ID, Enter, weight, Enter, Enter, Enter, Enter. Four browsers-worth of the same eight keys.

1. **Chrome, http://localhost:8080.** "This is my desk on day four." Keys. Status: *Printed*. Label comes out of the Zebra.
2. **Safari, https://cyc26-shipping.pages.dev.** "This is the deployed app, in the browser that ships on every Mac." Keys. Status: *Print failed*. "No prompt. No setting. That is what happened to me."
3. **Chrome, https://cyc26-shipping.pages.dev.** "Same page, in Chrome." Keys. The Local Network Access prompt appears. "This is what a warehouse worker sees." Click **Block**. Status: *Print failed*. Reload, keys again: *Print failed*, no prompt. "Chrome remembered. That is a support ticket."
4. **The shell.** "Same URL. Same page. The only difference is what is wrapped around it." Keys. Label comes out of the Zebra. No prompt.
5. Say nothing for two seconds.

**Before walking on, every time:** reset the Local network access permission for cyc26-shipping.pages.dev to Ask (icon left of the address bar, then site settings). If it is still on Block from the rehearsal, step 3 fails silently and the prompt never shows.

## Fallbacks

Real Zebra silent → switch the printer to the mock printer (addresses above) and the panel is the demo. Internet down → the video for steps 2 to 4, and the shell can be pointed at http://localhost:8080 with a `shell.config.json` in its userData folder to show IPC printing live. Shell will not launch → the video. Everything → slide 5 (the red console) and keep talking.
