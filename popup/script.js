/*
Copyright © 2026 🦊 helloyanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Script of the add-on's popup page

document.addEventListener("DOMContentLoaded", async () => {
    // Remove the "nojs" element and remove the style that hides the "main" element
    document.getElementById("nojs").remove();
    document.getElementById("main").removeAttribute("style");

    // Initiate checkbox state based on permission
    const checkbox = document.getElementById("bypassNotificationCheckbox");
    const permissionStatus = await browser.permissions.contains({ permissions: ["notifications"] });
    // Set the checkbox state based on the current permission status
    checkbox.checked = permissionStatus;

    // Add an event listener to handle checkbox changes
    checkbox.addEventListener("change", async (event) => {
        if (event.target.checked) {
            // Request permission when the checkbox is checked
            const granted = await browser.permissions.request({ permissions: ["notifications"] });
            if (!granted) {
                // If permission is not granted, uncheck the checkbox
                checkbox.checked = false;
            }
        } else {
            // Remove permission when the checkbox is unchecked
            await browser.permissions.remove({ permissions: ["notifications"] });
        }
    });

    // Initialize the settings in the popup based on stored values
    const bskySetting = await browser.storage.local.get('bskySetting').then((result) => result['bskySetting']);
    if (bskySetting) {
        document.querySelector("select[name='bskySetting']").value = bskySetting;
    }

    const redditSetting = await browser.storage.local.get('redditSetting').then((result) => result['redditSetting']);
    if (redditSetting) {
        document.querySelector("select[name='redditSetting']").value = redditSetting;
    }

    // Add event listeners to the select elements to update settings when changed
    document.querySelectorAll("select[settingChange]").forEach(setting => {
        setting.addEventListener("change", async (event) => {
            await browser.runtime.sendMessage({
                action: 'updateSetting',
                key: event.target.getAttribute("name"),
                value: event.target.value
            });
        });
    });
})