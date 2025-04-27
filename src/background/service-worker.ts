import { ScrapedProductData } from '../types/scrapedData';
import { checkBaxus } from '../utils/checkBaxus'; // Import the new utility function

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("Honey Barrel (Background): Message received:", message, "from sender:", sender);

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

        // No need to send a response back for this message type
    }
    // Indicate that the response function will be called asynchronously
    // Return true only if you intend to use sendResponse asynchronously.
    // Since we are using async/await within the listener,
    // it's often simpler to handle responses directly if needed,
    // or omit returning true if sendResponse is not used or used synchronously.
    // For this example, we don't need an async response back to the sender here.
});

// Keep the service worker alive briefly after install/update for initialization if needed
chrome.runtime.onInstalled.addListener(() => {
  console.log("BAXUS API Tester extension installed/updated.");
});