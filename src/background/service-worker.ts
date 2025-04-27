import { ScrapedProductData } from '../types/scrapedData';
import { checkBaxus } from '../utils/checkBaxus'; // Import the new utility function

// Listen for messages from content scripts
// Make the listener async to use await
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("Honey Barrel (Background): Message received from content script:", message);

    if (message.type === "SCRAPED_DATA") {
        const scrapedData: ScrapedProductData = message.data;
        console.log("Honey Barrel (Background): Received scraped data:", scrapedData);

        // enclose in async function to use await - DONE
        const bestMatch = await checkBaxus(scrapedData);
        if (bestMatch) {
            // Store the name to be displayed in the popup
            await chrome.storage.local.set({ popupMessage: `Found match: ${bestMatch.name}` });
            // Optional: Set a badge to indicate new data is available
            await chrome.action.setBadgeText({ text: '!' });
            await chrome.action.setBadgeBackgroundColor({ color: '#f4d345' });
            // Note: We don't programmatically open the popup here.
            // The user opens it, and popup.js reads the stored data.
        } else {
            // Clear any previous message if no match is found
            await chrome.storage.local.remove('popupMessage');
            await chrome.action.setBadgeText({ text: '' });
        }
    }

    // Indicate that the response will be sent asynchronously (optional but good practice)
    // return true; // Uncomment if you need to use sendResponse asynchronously later
});
  
// Keep the service worker alive briefly after install/update for initialization if needed
chrome.runtime.onInstalled.addListener(() => {
  console.log("BAXUS API Tester extension installed/updated.");
});