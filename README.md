# Your Browser Has Trust Issues

Modern browsers are really good at protecting users from the internet. The problem is that those same protections make talking to a printer sitting three feet away surprisingly difficult.

This is everything from my talk at Commit Your Code 2026, *Your Browser Has Trust Issues: Why Local Devices Break Modern Web Apps*.

Here is what happened. I was sitting at a desk in the customer's warehouse trying to print a shipping label to a Zebra printer. Enter a shipment ID, enter the package, label comes out. It worked - at my desk, because my dev server was running on localhost. I told the customer it worked and they scheduled a warehouse demo for the next day. That afternoon I deployed it to a real domain over HTTPS, went through the whole process, got to the print step, and the browser blocked it. A page served over HTTPS is not allowed to talk to a printer over plain HTTP, and at the time there was no setting you could change to work around that. Safari still works that way today. Chrome has since turned the block into a permission prompt, which turns out to be a different problem, not a smaller one.

So I stayed up all night and built an Electron app. It loads the same web app at the same HTTPS address, and when the page wants to print, it hands the job to Node inside the Electron app and Node sends it to the printer. The demo the next morning shipped three packages in 29 seconds. Their existing process took two and a half to three minutes per package. Thirty warehouse workers watched the production manager run it, not me. Three labels came out. They applauded. That was the first time in my career anyone had clapped at a software demo.

This repo has that Electron app, cleaned up so you can use it for your own web app.


| Folder                               | What it is                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[electron-shell/](electron-shell/)` | **Start here.** The Electron app. It loads your web app at its HTTPS address and gives the page a small `window.deviceBridge` object with three things the browser will not let a page do on its own: send raw bytes to a network printer, make an HTTP request the browser would block, and read a USB HID device. It came from the app that shipped to the customer. |
| `[demo-web/](demo-web/)`             | The shipping station page from the talk. Keyboard only. Shipment ID, package, Enter. No print button.                                                                                                                                                                                                                                                                  |
| `[mock-printer/](mock-printer/)`     | A fake Zebra so you can try this without a printer. It listens on port 9100 and on `POST /pstprnt`, shows what it received on a page at localhost:9102, and can forward each job to a real printer.                                                                                                                                                                    |
| `[slides/](slides/)`                 | The slides, with my speaker notes.                                                                                                                                                                                                                                                                                                                                     |
| `[docs/plan.md](docs/plan.md)`       | My prep notes for the talk, including the evidence for the claims about Chrome and Electron. `docs/status.md` says what is done and what is not.                                                                                                                                                                                                                       |




## Try it

```sh
pnpm install
pnpm printer          # terminal 1: the fake printer. Panel at http://localhost:9102
pnpm web              # terminal 2: the demo page at http://localhost:8080
pnpm shell            # terminal 3: the Electron app, loading the deployed page
```

Then do what I did, in the same order. Use your computer's LAN address as the printer address, not 127.0.0.1, because the browser makes an exception for 127.0.0.1 and you will not see the problem.

1. Open `http://localhost:8080/?printer=192.168.1.50:9101` (your LAN address). Type a shipment ID, Enter, a weight, Enter, Enter, Enter, Enter. It prints. The panel says PRINTED.
2. Open `https://cyc26-shipping.pages.dev/?printer=192.168.1.50:9101` in Safari. Same keys. It fails. No prompt, no setting to change. That is what every browser did until Chrome 142, and what happened to me two years ago.
3. Open the same address in Chrome. Same keys. Chrome asks whether the site may reach devices on your local network. Click Block, the way a warehouse worker would. It fails. Reload and try again: it fails with no prompt, because Chrome remembers the No per site. To reset it, click the icon left of the address and set Local network access back to Ask. (Two years ago, and still today if you use a hostname instead of an IP, there is no prompt. The request is just blocked.)
4. Run the Electron app. It loads that same HTTPS page. Same keys. It prints. No prompt.

That is the whole talk. The `?printer=` part is remembered per site, so you only need it the first time.

## Local Network Access, in one paragraph

It looks at the address, not the encryption. A real certificate on a private IP address still gets the prompt. And if the user clicks No, Chrome remembers that for the site and silently blocks every request after that until somebody goes into site settings and clears it. Inside Electron that prompt does not exist. Electron turns that check off by default (see `shell/browser/feature_list.cc` in the Electron source) and the permission is yours to grant in code. The details and the links are in `docs/plan.md`, section 13.

## Proxybox, and me

The box at the end of the talk is something I built and sell: Proxybox. It is a small device on the network with the printer plugged into it. Every caller, a web page, a phone, or a server, gets the same HTTPS API to print through, with nothing to install on the client and nothing for the browser to block. More at [pbxz.io](https://pbxz.io/).

I am Chris Edgington. The easiest way to reach me is on X, [@EdgingtonC](https://x.com/EdgingtonC). Questions about this repo, the talk, or getting a web app to talk to a device on a warehouse floor are welcome there.

## License

MIT.