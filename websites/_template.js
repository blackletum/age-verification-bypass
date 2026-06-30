/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// This script is a template that you can base other websites on.
console.log("Template bypass script is running");
browser.webRequest.onBeforeRequest.addListener(
    async function (details) {
        console.log("Request intercepted:", details.url);


        // TO MODIFY RESPONSE and spoof your own age verification modal
        const filter = browser.webRequest.filterResponseData(details.requestId);

        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        filter.onstop = async () => {
            // Replace the original age verif popup with this one
            const modifiedResponse = encoder.encode(`Here, replace the server response with whatever you write here!`);
            filter.write(modifiedResponse);
            filter.close()
        }

        // TO RUN SCRIPTS ON THE PAGE WHEN THE REQUEST FIRES
        await browser.scripting.executeScript({
        target: {
            tabId: details.tabId, // The tab that initiated the request!
        },
        func: () => {
            //your code goes here!
            document.body.style.border = "5px solid green";
        },
        });

    },
    { urls: ["https://cdn.agechecker.net/static/popup/v1/popup.js"]}, // The URL that will trigger the above code
    ["blocking"]
);