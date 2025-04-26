import { searchListings } from '../utils/api';

// Listen for when the user clicks the extension's browser action icon
chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
    console.log("Extension icon clicked. Fetching BAXUS data...");
    const listings = await searchListings();
    console.log("Fetched listings:", listings);
});

  
  // Keep the service worker alive briefly after install/update for initialization if needed
  chrome.runtime.onInstalled.addListener(() => {
    console.log("BAXUS API Tester extension installed/updated.");
  });