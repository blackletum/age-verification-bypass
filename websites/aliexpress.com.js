/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// This one is super clunky but works. It gets runned every time a new product is in view because they get loaded with the age restriction elements so I need to re-run the code every time to remove them (the whole page isn't rendered if you don't scroll)
console.log("Aliexpress bypass script is running");

browser.webRequest.onCompleted.addListener(
    async function (details) {
        console.log("Request intercepted:", details.url);

        await browser.scripting.insertCSS({
            target: {
                tabId: details.tabId,
            },
            css:
// Blur on search results & suggested products on product page
`.card-dsa-wrapper img, .dsa--visible--wrapper img {
    filter: none !important;
    -webkit-filter: none !important;
}
`+
// Blur popup on product page
`.J_SAFETY_FILER_MODAL,`+

//Crossed eye icon
`img[src='https://ae-pic-a1.aliexpress-media.com/kf/S082ae95bce89462b9548a1d53f222ab4p/72x72.png'], img[src='https://ae-pic-a1.aliexpress-media.com/kf/S082ae95bce89462b9548a1d53f222ab4p/72x72.png_120x120.png'], img[src='https://ae-pic-a1.aliexpress-media.com/kf/S082ae95bce89462b9548a1d53f222ab4p/72x72.png_120x120.png_.webp'],`+

//Search results blur (mobile)
`div[data-anc='body']>div>div>div>div>div>div, div[data-spm='platformRecommendH5']>div>div>div,`+

//Overlay on search results & suggested products on product page
`#card-list>div>div>div:nth-child(2), .slick-slide>div>div>div>div:nth-child(2){
    display: none !important
}`,
        });
    },
    { urls: ["*://*.aliexpress.com/*"], types: ["main_frame"] },
    []
)