# Read-through script

Generated from slides/slides.md by `node slides/script.mjs`. Edit the slides, not this file.

---

## 1  ·  clock 0:00

**On the screen**

> # It worked on localhost.
> 
> "It works." Tomorrow. 30 people.

**Say**

Start here, no introduction; the schedule has your name. Start talking before the slide has finished sinking in. Day four at the customer's warehouse, a desk in the middle of it, not a conference room, a laptop, a Zebra. Shipment ID in, data loads from IFS, package details, label bought from ShipEngine, out of the Zebra. It printed. Thrilling. You showed a couple of people and told the customer: it works. (Works. You said nothing about fast. That matters at the end.) They scheduled the warehouse demo for the next day. 30 people.

---

## 2  ·  clock 0:40

**On the screen**

> # People before process.

**Say**

Why you were at that desk. When you build software people will be forced to use, repeatedly, on a shift where they are measured on speed, you go there first. Watch the work. Ask "what would you change?" What you saw: an extended keyboard with a big Enter key, tab, tab, Enter, never a mouse. The shipping software they had was pulldowns and clicking, 2.5 to 3 minutes per package, and they are graded on packages per hour. Many are not technical and many are seasonal. Then decide how the software works.

---

## 3  ·  clock 1:20

**On the screen**

> # No mouse. No dialogs. Printing just happens.

**Say**

The rule, set before writing any code. Keyboard only. Screens do not change. When the shipment is done, the label comes out. No print dialog, no extra button, nothing to configure, no timing tricks. Here is the reason. This is a production floor. The person at the keyboard is measured in seconds, and a distraction costs them. And a non-technical person should never be asked to make a technical decision. Not about a printer, not about a permission, not about anything. If the software asks, the software is wrong. This rule drove every decision that follows. Every option at the end is graded against it.

---

## 4  ·  clock 2:05

**On the screen**

> # I had not deployed it.
> 
> Test on the real thing first.
> 
> https://

**Say**

Own it, one sentence, no apology: you told the customer it works before confirming it in a deployed environment. That is the rule, test on the exact hardware and infrastructure you will demo on, and you had just broken it. So that evening you deployed to a real domain, over HTTPS, and ran through the whole flow. Everything worked. Right up to print.

---

## 5  ·  clock 2:30

**On the screen**

> [picture: Chrome console: Mixed Content, this request has been blocked]

**Say**

Captured on Chrome 152 with a hostname as the printer address. This is what Chrome said two years ago for any address. Today Chrome only says it for a hostname called the plain way; an IP address, a .local name, or a fetch that declares it means the local network gets the prompt instead. Safari still says it for everything: "This content was blocked and must be served over HTTPS."
Red. In the console. The request never left the browser.

---

## 6  ·  clock 3:00

**On the screen**

> # Less than 24 hours.

**Say**

Section clock: 3:00. Hold this one. Then: to understand why that error could not be worked around in the browser, here is what the browser was actually doing.

---

## 7

**On the screen**

> # Your browser has trust issues.

**Say**

Title reveal. And to be fair: it should. From the browser's point of view this is a public website poking at hardware on someone's LAN.

---

## 8

**On the screen**

> # Both ends were plain http://.

**Say**

Why did it work at your desk? Not because localhost is special. Because both ends were plain HTTP: the page was http://localhost and the printer was http://192.168-something. Same scheme, no downgrade, nothing for the browser to object to. The moment the page moved to https://, the request from it became a downgrade, and that is what the browser blocks. (Localhost does get special treatment from the browser, but that is a different rule, and it comes up later.)

---

## 9  ·  clock 3:50

**On the screen**

> # It does not trust a lower clearance.
> 
> mixed content
> 
> What. An https:// page asked for something over plain http://. The browser refused before the request ever left the machine.
> Why. Think of security clearances. A page delivered over https:// is a top secret meeting. It cannot invite someone with no clearance into the room, because everything said in that room would leak. Plain http:// has no clearance. So the request is blocked, and it only goes one way: an uncleared page can call a cleared server all day, it just will not be told any secrets.

**Say**

An https page may not make a plain http request. The browser blocks it before it leaves the machine. Here is the reason. The page came in over a connection nobody on the path can read or change. The printer connection is one anybody on the path can read or change. If the browser let the page mix the two, whatever the page sends or reads over the plain one is exposed. So the rule is: a secure page only talks to secure things. It only goes one direction. A plain http page can call an https server all day. And it does not matter that the printer is three feet away on my own network. The browser has no idea where the printer is. It only sees http.
Can you turn it off? There is an enterprise policy, InsecureContentAllowedForUrls. That means managed Chrome, IT keeping a list of printer addresses, and mixed content protection off for the whole app, on a page that is also talking to the ERP and the shipping provider. Not something I would ship to a warehouse.
What changed since that night: if the printer address is a raw IP, current Chrome no longer blocks it as mixed content. It hands the request to Local Network Access, on its own slide in a minute, and asks the user. A hostname is still blocked unless the fetch says targetAddressSpace local, and then it gets the same prompt. I tested both this week. Safari still blocks all of it, no prompt, no option. You will see that live.

---

## 10  ·  clock 5:20

**On the screen**

> [picture: Chrome site information: Connection is secure]

**Say**

Click the icon next to the address on the deployed page. Connection is secure. That is a promise about the whole page, not just the address bar: everything this page loaded and everything it talks to went over a connection nobody on the path could read or change. If Chrome let this page post a label to the printer over plain http and kept showing this, the lock would be a lie, and a lie to the one person with no way to check. So the browser has two honest choices: block the request, or take the lock away. Every browser picked block. Chrome, last October, added a third for private addresses: ask the user first, then keep the lock. You will see that prompt live in the demo.

---

## 11  ·  clock 6:00

**On the screen**

> # It does not trust your page.
> 
> CORS
> 
> What. A page on one site called a device on another. The device has to answer with a header that names your site as allowed. Printers do not send headers.
> Why. Your browser is logged in to everything. Without this rule, any page you open could use it to read from your bank, your email, your router. The other end has to say yes.

**Say**

CORS. Cross-origin resource sharing. An origin is where a page came from: the scheme, the host, the port. My page came from one origin and the printer is a different one. The rule is: a page can send a request to another origin, but it does not get to read the answer unless the answer comes back with a header that names my origin as allowed. Access-Control-Allow-Origin. And if the request is anything beyond a plain form post, a custom header, a JSON content type, the browser asks first. It sends an OPTIONS request, the preflight, and the real request only goes out if the other end answers that one correctly.
Why? My browser is logged in to my bank, my email, my router. Every request it sends carries those cookies. Without this rule, any page I open could read my bank balance through my own browser. So the other end has to say yes.
A Zebra printer has never heard of this header. It is never going to say yes. For printing, that means I can throw the label at it with mode no-cors and get nothing back. No status, no error, no idea whether it printed. For anything where I need an answer, a scale, a reader, a device status, I am stuck. The other end has to say yes, and the printer cannot.

---

## 12  ·  clock 7:20

**On the screen**

> # It does not trust your network.
> 
> Local Network Access
> 
> What. Since Chrome 142, a page from the public internet that reaches a private address, 192.168.x, 10.x, localhost, needs the user to click Allow, once per site. Encryption does not matter. Where matters.
> Why. Your browser sits inside your network, where the internet cannot reach. A public page could use it as a way in. So the browser asks the one person who can say whether that is fine: the user, right then.

**Say**

This one is new. Chrome 142, last October. The browser looks at where the request is going, not how it travels. Three places: the public internet, my local network, or my own machine. A page from the public internet reaching into the local network, 192.168, 10 dot, a .local name, localhost, has to ask. Chrome shows the user a prompt, this site wants to reach devices on your network, and remembers the answer per site. Encryption does not matter. A real certificate on a private address still asks.
Why? My browser sits inside my network. The internet cannot get in, but my browser can, and it runs code from any page I open. So a public page could use my browser as its way in. The browser cannot tell my warehouse app from a page that wants my router. So it asks the one person who might know, the user, right then.
Two updates since it shipped: Chrome 145 split it into two permissions, local network and loopback, so a localhost agent gets asked too, and Chrome 147 put WebSockets under it. Safari has no prompt; it just blocks. Firefox is rolling its own out. You will see this prompt live in a few minutes. What it costs on a warehouse floor, you will see in the demo.

---

## 13  ·  clock 8:40

**On the screen**

> # It does not trust that you meant it.
> 
> WebHID · WebUSB · WebSerial
> 
> What. Only in Chromium, only on https://, and only inside a real click. The page has a few seconds after the click to ask, and the user picks the device from a list. No click, no device.
> Why. A page silently taking your webcam, your security key, or a USB device is the nightmare case. The browser wants proof that a human meant it, right then. That proof is called user activation, and it is the only signal the browser trusts.

**Say**

Devices with no network at all: scanners, scales, USB label printers. WebUSB, WebHID, WebSerial. Three things have to be true. Chromium; Safari and Firefox do not have these at all. https. And a real click. Not a click ten minutes ago, a click just now. The page gets a few seconds after it to ask for a device, the browser shows a list, and the person picks one. That proof that a human just meant it is called user activation. No click, no device.
Why? A page silently opening my webcam, my security key, or a USB device is the nightmare case. The only signal the browser trusts is a human doing something, right then.
Two footnotes if somebody asks. Once a person has picked a device, the page can find it again on later visits without a click. And managed Chrome can pre-grant a device to a site with a policy, WebUsbAllowDevicesForUrls. Neither helps a seasonal hire on a workstation nobody manages. The 45 USB printers come back later.

---

## 14  ·  clock 9:40

**On the screen**

> # Four questions.
> 
> Is the connection encrypted end to end? (mixed content)
> Did the other end say yes? (CORS)
> Where is the other end? (Local Network Access)
> Did a human just say so? (user activation)

**Say**

Four different rules, four different questions, and they get mixed up all the time. Mixed content is about how the request travels. CORS is about whether the other end agreed. Local Network Access is about where the other end is; it does not care about encryption at all, which is why a real certificate on a private IP still gets the prompt. User activation is about whether a person just asked. A printer on a shop floor fails all four: plain http, no headers, private address, nobody clicking. Every one of these is the browser asking a question that, on a warehouse floor, nobody is there to answer.

---

## 15  ·  clock 10:20

**On the screen**

> # Every page is a stranger.
> 
> So the human is the only vote that counts.

**Say**

None of this is a bug. Why do browsers work this way? Because a browser runs code from anyone. Any tab, any ad in an iframe, is a stranger executing on your machine, from your network position, with your cookies. Before Local Network Access, a page you visited could quietly POST to your router, your printer, your NAS, from inside your LAN, and the device would trust it because it came from you. That is the attack the people writing the spec were worried about: a web page reconfiguring your router. So the browser stopped trusting the page and started asking the human: "this site wants to reach devices on your network."
Same logic for user activation. Autoplay was abused, so audio needs a click. Popups were abused, so window.open needs a click. A page silently claiming your webcam, your security key, or a USB device is a nightmare, so WebUSB, WebHID, and WebSerial need a click, a chooser, and a few seconds of intent. The browser cannot tell your warehouse app from a phishing page. Its only trustworthy signal is a human, proving intent, right now. Everything the browser blocks in this talk comes from that one rule.
And that rule is the exact opposite of what production software on a warehouse floor needs. But first, what the rules are for.

---

## 16  ·  clock 11:45

**On the screen**

> # Without the rules.
> 
> 2018. A phishing page read a YubiKey over WebUSB and got past the check that ties a key to one site. Chrome 67 closed it.
> 2019. Zoom left a web server on every Mac it had ever been installed on. Any page you visited could turn your camera on through it.
> 2024. "0.0.0.0 Day": for eighteen years, in every browser, a public page could reach services on your own machine through one odd address.
> Any year. DNS rebinding: a page you opened points its own name at your router and changes its settings from inside your network.

**Say**

One line each, no mechanics. Every rule on the four questions slide was written after something like this. Mixed content: anyone on the path can read and rewrite a plain http request, so the https page's secrets leak. CORS: without it, your logged-in browser reads your bank for a stranger. Local Network Access: 2019 and 2024 are exactly a public page reaching a service that trusted it because the request came from inside. User activation: 2018 is a page touching hardware without a human meaning it. Each rule exists because somebody got hurt. Now turn it around.

---

## 17  ·  clock 12:30

**On the screen**

> # On the warehouse floor, trust has to be decided once.

**Say**

Section clock: 12:30. Now turn that around. Every assumption behind that rule is wrong on a warehouse floor. The software is not a stranger: the company's IT team chose it, installed it, and is accountable for it. The human is not the trustworthy vote: they are the busiest person in the building, measured in seconds, non-technical, and often there for one season. Asking that person to make a decision about network permissions is a bad experience for them and a support ticket for the company, and every prompt they see is a chance to click No and break the line. And "right now" is the enemy: a five-second activation window, a chooser, a per-site permission is exactly the kind of timing trick and configuration you promised they would never have to do. Production software here has to be automatic, zero configuration by the user, no timing. Trust decided once, at install, by whoever is accountable. That is the requirement the browser cannot meet, by design. So: the all-nighter.

---

## 18  ·  clock 13:30

**On the screen**

> # What if the browser is not the one that has to trust us?
> 
> Same page. Same URL. Wrapped in something IT installs.

**Say**

Section clock: 13:30. The all-nighter, in three sentences. The browser's print dialog works, but it is a dialog and a click on every package, so it is a fallback, not the answer. Every flag and policy that lets the request through needs someone managing every machine and turns protection off for the whole app. At 3 AM the question flipped: what if the browser is not the one that has to trust us? Keep the web app exactly as it is, same HTTPS URL, wrap it in something IT installs, and let that thing talk to the printer. That thing is Electron, and here is all the code it took.

---

## 19  ·  clock 14:15

**On the screen**

> ```ts
> // day four, at my desk
> await fetch(`http://${host}/pstprnt`, {
>   method: 'POST',
>   body: zpl,
>   mode: 'no-cors',
> });
> ```

**Say**

This is the whole print path on day four. One fetch, straight at the printer. From http://localhost it printed. From https:// the browser blocked it before it left the machine. Nothing else in the app changed between the desk and the deployed site. This line is what the shell has to replace.

---

## 20  ·  clock 14:35

**On the screen**

> ```ts
> // preload.ts, 3 AM
> contextBridge.exposeInMainWorld('deviceBridge', {
>   print: (job: PrintJob) =>
>     ipcRenderer.invoke('print', job),
> });
> ```

**Say**

The Electron side, first half. Preload puts one function on the page: window.deviceBridge.print. It sends the job over IPC to Node. That is the entire surface the page gets. Nothing else from Node reaches it.

---

## 21  ·  clock 14:45

**On the screen**

> ```ts {1-4|5-7|8-12|all}
> // main.ts, 3 AM: the handler
> ipcMain.handle('print', async (event, job) => {
>   assertSender(event, config);
>   if (!isAllowedPrinterHost(job.host, config)) {
>     throw new Error('printer not allowed');
>   }
>   const socket = net.createConnection({
>     host: job.host, port: job.port ?? 9100,
>   });
>   await once(socket, 'connect');
>   socket.end(job.data);
>   await once(socket, 'close');
> });
> ```

**Say**

The handler in Node. Two checks first: which page is asking, and whether it is allowed to send to that printer. The browser used to do that checking; now the shell does. Then the socket: connect, write, wait for close. Zebras are timing sensitive about when they get the job and when they get its data, and a raw socket to port 9100 is what stuck. The window itself is a few lines you can read in the repo: a BrowserWindow with this preload, contextIsolation on, sandbox on, loading the same https URL as the browser.

---

## 22  ·  clock 15:05

**On the screen**

> ```ts {1-5|6-12|all}
> // day five, before the demo
> if (window.deviceBridge) {
>   await window.deviceBridge.print({
>     host, data: zpl,
>   });
> } else {
>   await fetch(`http://${host}/pstprnt`, {
>     method: 'POST',
>     body: zpl,
>     mode: 'no-cors',
>   });
> }
> ```

**Say**

The only change to the web app. If the bridge is there, use it. If not, do what a web page can do: the same fetch as before. In a browser tab there is no bridge, so the page tries the fetch, and from https:// the browser blocks it. Inside the shell the bridge exists and the fetch never runs. Same code, same URL, in both.

---

## 23  ·  clock 15:25

**On the screen**

> # Now the shell decides who to trust.
> 
> <p v-click class="sub">…including the local network.

**Say**

The browser used to do the checking. Now the app has to. Here is what it checks: allowed origins, a sender check on every IPC channel, an allowlist for the proxy, contextIsolation on, nodeIntegration off, webSecurity on. Second click: Local Network Access. Electron turns Chromium's local network check off in every Electron app, on purpose, and gives you a permission handler instead. You decide in code which origins may reach the local network. So the prompt you are about to see in Chrome does not exist in here. Trust decided once, in code. (The evidence, with file names and issue numbers, is in docs/plan.md section 13 if anyone asks.)

---

## 24  ·  clock 15:45

**On the screen**

> # Live demo.

**Say**

Four steps, same keys each time. You will notice the app is not pretty. Nobody on that floor cares. It works and it stays out of their way. One: the page on http://localhost, in Chrome. Enter, Enter, Enter, Enter. It prints. That was my desk. Two: the same page on https://, in Safari. Same keys. Print failed. No prompt, no setting, nothing to click. That is exactly what happened to me two years ago, and it is what every browser did until last October. Three: the same https:// page in Chrome. Same keys. Chrome asks: this site wants to reach devices on your local network. Do what a warehouse worker does. Click Block. Print failed. Reload, same keys: Print failed again, and no prompt this time. Chrome remembered the No. That is a support ticket. Four: the shell, loading that same https:// page. Same keys. Label comes out of the Zebra. No dialog, no prompt, no click.
Before walking on: reset the site's Local network access permission in Chrome to Ask, or step three will not prompt.
Fallback order: the Zebra on Wi-Fi → the mock printer panel → the recorded video.

---

## 25  ·  clock 19:30

**On the screen**

> # It is an installer, not a URL.
> 
> an .exe, uploaded to SharePoint

**Say**

Section clock: 19:30. The cost of deciding trust once. Somebody installs something on every workstation. At the customer that was an .exe on SharePoint. That is the tradeoff, and it is the right one for a floor you control.

---

## 26  ·  clock 19:45

**On the screen**

> # Then they asked the backend to print.
> 
> no browser, no desk, no worker

**Say**

What I ended up with after the shell: a Raspberry Pi with the printer on USB, and an HTTPS API in front of it. Two things make the browser stop asking: a public IP, which the box gets through an outbound tunnel so nothing is opened on the customer's network and the printer never touches the internet, and a name, so the API has a certificate and the page calls it over HTTPS. Public page to public API: nothing blocked, nobody prompted. The cost, out loud: the internet is now in the path to a printer six feet away. Then the reason it was worth it. Months later the customer's next request had no browser in it at all: print from the ERP, from a scheduled job, from a server. Every option in this talk lives inside a browser, and the shell lives on a desktop. Neither one can help a server. Neither one can help an iPad either, where every browser is Safari underneath, so there is no prompt, no policy, and no Electron. The box answers all of it, because from any caller it is just an HTTPS API. The backend posts a job, an iPad posts a job, the shell posts a job. Same call. Nothing to install on the client and nothing for IT to manage there.
And one thing the LAN never had: a lock. A printer on the network with port 9100 open prints anything from anyone on that network. No login, no log. The check printer included. Behind the API nothing prints without a key, and every job has a name on it. The printer went from trusting everyone on the network to trusting nobody without a key. The browser's rules were protecting the page. This is the first thing that protected the printer.
That is Proxybox. Once, by name, and move on.

---

## 27  ·  clock 21:00

**On the screen**

> # 9 AM.

**Say**

Section clock: 22:30. Two demos that day. First, private: you walked the warehouse production manager through it once. Once.

---

## 28  ·  clock 21:10

**On the screen**

> # The promise: it prints a label.

**Say**

That is all anyone on the warehouse floor had been told. Two sentences, no more: the pattern now, especially with LLM-built apps, is demo at the first cool moment and promise the moon, then hit the hard parts. You do the opposite: listen, set a modest expectation, then work to beat it.

---

## 29  ·  clock 21:30

**On the screen**

> # He ran it.
> 
> Not me. He had seen it once.

**Say**

The real demo. 30 warehouse workers watching. The production manager at the keyboard, not you. One walkthrough, hours earlier. No mouse, no dialog, no prompt. It worked exactly as it was supposed to.

---

## 30

**On the screen**

> # 3 packages. 29 seconds.
> 
> <s>2.5–3 minutes each</s>

**Say**

Pause.

---

## 31

**On the screen**

> # They clapped.

**Say**

First round of applause you ever got for a software demo. Pause again. Let it sit.

---

## 32  ·  clock 22:30

**On the screen**

> <a class="qr">[picture: QR code for pbxz.io]<span>pbxz.io</span></a>
>   <a class="qr">[picture: QR code for x.com/EdgingtonC]<span>x.com/EdgingtonC</span></a>

**Say**

Section clock: 22:30. Two codes: Proxybox, and where to find me. The shell, the demo page, the mock printer, and these slides are all on my GitHub; ask me and I will send the link. Thank you.

