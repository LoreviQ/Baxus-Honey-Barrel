import { ScrapedProductData } from '../types/scrapedData';
import { checkBaxus } from '../utils/checkBaxus'; // Import the new utility function

// Listen for messages from content scripts
// Make the listener async to use await
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("Honey Barrel (Background): Message received from content script:", message);

    if (message.type === "SCRAPED_DATA") {
        const scrapedData: ScrapedProductData = message.data;
        console.log("Honey Barrel (Background): Received scraped data:", scrapedData);

        const bestMatch = await checkBaxus(scrapedData);
        if (bestMatch) {
            await chrome.storage.local.set({ popupMessage: `Found match: ${bestMatch.name}` });
            // Attempt to open the popup programmatically.
            // Note: This might fail if not triggered by a user gesture in some contexts.
            try {
                await chrome.action.openPopup();
            } catch (error) {
                console.error("Honey Barrel (Background): Failed to open popup:", error);
                // Fallback or alternative notification could be added here if needed,
                // like setting the badge again.
                await chrome.action.setBadgeText({ text: '!' });
                await chrome.action.setBadgeBackgroundColor({ color: '#f4d345' });
            }
        } else {
            await chrome.storage.local.remove('popupMessage');
            // No badge to clear if we are primarily using openPopup
            // await chrome.action.setBadgeText({ text: '' }); 
        }
    }
});
  
// Keep the service worker alive briefly after install/update for initialization if needed
chrome.runtime.onInstalled.addListener(() => {
  console.log("BAXUS API Tester extension installed/updated.");
});