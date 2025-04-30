# Baxus Honey Barrel 🍯 - Find Sweet Whisky Deals!

[![BOB the Butler](https://raw.githubusercontent.com/LoreviQ/Baxus-Honey-Barrel/main/assets/bob.png)](https://baxathon.oliver.tj/bob)

Meet **BOB**, the **B**AXUS **O**utstanding **B**utler! He's the friendly face of the Baxus Honey Barrel, your trusty Chrome extension built for the **BAXATHON**!

Tired of endlessly searching for the best prices on that perfect bottle of whisky or wine? BOB is here to help! The Honey Barrel automatically scans supported e-commerce sites you visit, identifies the bottle, and checks if you can get a sweeter deal on the **BAXUS marketplace**.

## What's Inside the Barrel? 🥃

- **Automatic Deal Sniffing:** As you browse supported retailer sites (like The Whisky Exchange & Flask Fine Wines), BOB automatically scrapes the bottle details (name, price, volume, ABV, etc.).
- **BAXUS Price Check:** BOB sends the details to the BAXUS API to see if the same bottle is listed for a better price on the marketplace.
- **Savings Alert!:** If a better deal is found on BAXUS, BOB will pop up, show you the potential savings, and provide a direct link to the BAXUS listing.
- **BOB's Got Your Back:** BOB delivers the good news (or just hangs out if there's no deal) in the extension popup. You can also chat with BOB directly!

## ✨ Extra Hackathon Fun! ✨

We didn't just stick to the Honey Barrel spec; we mixed in some fun from other BAXATHON tracks!

- **Whiskey Goggles Integration:** See a bottle image online you want to identify? Click the "Whiskey Goggles" button in the popup! BOB will activate image selection mode on the page. Click the image, and it'll be sent to the (locally running) Whiskey Goggles service for identification. BOB will then show you the results!

## How it Works (The Secret Sauce)

1.  **Content Scripts:** These little helpers run on specific websites (e.g., `thewhiskyexchange.com`, `flaskfinewines.com`) to scrape product details when you visit a product page. The `whiskeyGoggles.ts` content script enables image selection on _any_ page when activated.
2.  **Background Service Worker:** This is BOB's brain. It listens for scraped data or selected image URLs from the content scripts.
    - For scraped data, it calls the BAXUS API (`/api/search/listings`) to find matching bottles.
    - For selected images, it fetches the image and sends it to the Whiskey Goggles prediction endpoint (`http://127.0.0.1:5000/predict`).
3.  **Popup:** This is where you see BOB! It displays messages, potential savings, BAXUS links, or Whiskey Goggles results stored in `chrome.storage.local` by the background script. It also lets you activate Whiskey Goggles mode.

## Supported Sites

- The Whisky Exchange (`thewhiskyexchange.com`)
- Flask Fine Wines (`flaskfinewines.com`)
- _(Add more as you implement them!)_

## Installation (Get Your Own BOB!)

1.  Clone this repository or download the source code.
2.  Build the extension:
    ```bash
    npm install
    npm run build
    ```
    This will create a `dist` folder.
3.  Open Chrome and navigate to `chrome://extensions/`.
4.  Enable "Developer mode" (usually a toggle in the top right corner).
5.  Click "Load unpacked".
6.  Select the `dist` folder created in step 2.
7.  BOB is ready! Look for the BAXUS Honey Barrel icon in your extensions toolbar.

## Development

To build the extension and watch for changes during development:

```bash
npm install
npm run watch
```
