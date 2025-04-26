import { searchListings } from '../utils/api';
import { ScrapedProductData } from '../types/scrapedData'; // Import the type

// Listen for when the user clicks the extension's browser action icon
chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
    console.log("Extension icon clicked. Fetching BAXUS data...");
    const listings = await searchListings();
    console.log("Fetched listings:", listings);
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Honey Barrel (Background): Message received from content script:", message);

    if (message.type === "SCRAPED_DATA") {
        const scrapedData: ScrapedProductData = message.data;
        console.log("Honey Barrel (Background): Received scraped data:", scrapedData);
        // TODO: Process the scraped data (e.g., compare with BAXUS API)
    }

});

  
// Keep the service worker alive briefly after install/update for initialization if needed
chrome.runtime.onInstalled.addListener(() => {
  console.log("BAXUS API Tester extension installed/updated.");
});