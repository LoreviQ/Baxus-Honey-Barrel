import { ScrapedProductData } from '../types/scrapedData';
import { checkBaxus } from '../utils/checkBaxus';

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("Honey Barrel (Background): Message received:", message, "from sender:", sender);

    if (message.type === "SCRAPED_DATA") {
        // This message will come from the content script after scraping data
        const scrapedData: ScrapedProductData = message.data;
        console.log("Honey Barrel (Background): Received scraped data:", scrapedData);

        const bestMatch = await checkBaxus(scrapedData);
        if (bestMatch) {
            // compare prices. Only show if the price is lower than the scraped data
            if (!scrapedData.price || bestMatch.price < scrapedData.price) {
                console.log("Honey Barrel (Background): Found a better match:", bestMatch);
                // Store the bestMatch object instead of just a message string
                await chrome.storage.local.set({ bestMatch: bestMatch }); 
                await chrome.storage.local.set({ scrapedData: scrapedData }); 
                try {
                    // Attempt to open the popup
                    await chrome.action.openPopup();
                } catch (error) {
                    // Show badge error if popup fails to open
                    console.error("Honey Barrel (Background): Failed to open popup:", error);
                    await chrome.action.setBadgeText({ text: '!' });
                    await chrome.action.setBadgeBackgroundColor({ color: '#f4d345' });
                }
            }
        } else {
            // Ensure bestMatch is removed if no match is found
            await chrome.storage.local.remove('bestMatch'); 
        }
    } else if (message.type === "IMAGE_SELECTED") {
        // This message will come from the content script after the user selects an image
        console.log("Honey Barrel (Background): Received selected image data:", message.data);
        const imageSrc = message.data.src;

        // Simulate processing the image source
        console.log("Honey Barrel (Background): Simulating image processing for:", imageSrc);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate 1 second processing time
        const processingResult = `Processed: ${imageSrc.substring(imageSrc.lastIndexOf('/') + 1)}`; // Example result
        console.log("Honey Barrel (Background): Image processing complete. Result:", processingResult);

        // Store the result in local storage for the popup to pick up
        await chrome.storage.local.set({ whiskeyGogglesResult: processingResult });

        // Set a badge to notify the user
        await chrome.action.setBadgeText({ text: 'WG' });
        await chrome.action.setBadgeBackgroundColor({ color: '#FFA500' }); // Orange color for WG badge
    }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("BAXUS API Tester extension installed/updated.");
});