/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// Docs at https://docs.agego.com/integration/integration

console.log("agego.com bypass script is running");

// Integration method bypass
browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        console.log("Request intercepted:", details.url);

        const filter = browser.webRequest.filterResponseData(details.requestId);

        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        filter.onstop = async () => {
            // Replace the original age verif popup with this one
            const modifiedResponse = encoder.encode(`(function () {
  const queue = window.AGEGO?.e;

  if (!Array.isArray(queue) || queue.length === 0) {
    console.warn("[Error from bypass script]AGEGO queue is empty (or using simple integration mode?)");
    return;
  }

  // Find the most recent call with an options object containing events
  let events;

  for (let i = queue.length - 1; i >= 0; i--) {
    const args = queue[i];

    for (let j = 0; j < args.length; j++) {
      const candidate = args[j];

      if (
        candidate &&
        typeof candidate === "object" &&
        candidate.events &&
        typeof candidate.events === "object"
      ) {
        events = candidate.events;
        break;
      }
    }

    if (events) break;
  }

  if (!events) {
    console.warn("[Error from bypass script]No AGEGO events found.");
    return;
  }

  if (typeof events.onVerifiedBefore === "function") {
  console.debug("[agego.com bypass script] Calling onVerifiedBefore callback.");
    events.onVerifiedBefore();
  } else if (typeof events.onAPIVerify === "function") {
    console.debug("[agego.com bypass script] Calling onAPIVerify callback.");
    events.onAgeVerify();
  } else if (typeof events.onVerificationFlowEnd === "function") {
    console.debug("[agego.com bypass script] Calling onVerificationFlowEnd callback.");
    events.onVerificationFlowEnd({});
  }
})();
            `);
            filter.write(modifiedResponse);
            filter.close()
        }

    },
    { urls: ["https://verifycdn.agego.com/v1/verify.js"]},
    ["blocking"]
);

// Server to server integration (doesn't bypass server side checks!)
browser.webRequest.onBeforeRequest.addListener(
    async function (details) {
        console.log("Request intercepted:", details.url);
        // Get the redirect URL from the URL param, in case the site doesn't do server checks
        return {redirectUrl: new URL(details.url).searchParams.get("returnto")}; // Block the request and redirect to the redirect_url param,
    },
    { urls: ["https://myapi.agego.com/s2s/start/?*"]},
    ["blocking"]
);