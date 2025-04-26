import { ScrapedProductData } from '../types/scrapedData';
import { checkBaxus } from '../utils/checkBaxus'; // Import the new utility function

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Honey Barrel (Background): Message received from content script:", message);

    if (message.type === "SCRAPED_DATA") {
        const scrapedData: ScrapedProductData = message.data;
        console.log("Honey Barrel (Background): Received scraped data:", scrapedData);
        checkBaxus(scrapedData);
    }

});
  
// Keep the service worker alive briefly after install/update for initialization if needed
chrome.runtime.onInstalled.addListener(() => {
  console.log("BAXUS API Tester extension installed/updated.");
});