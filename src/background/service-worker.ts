import { searchListings } from '../utils/api';

// Listen for when the user clicks the extension's browser action icon
chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
    console.log("Extension icon clicked. Fetching BAXUS data...");
    try {
      const response = await searchListings();
      console.log("Raw Response Status:", response.status, response.statusText);

      const data = response.data;
      console.log("Successfully fetched and parsed BAXUS data:");
      console.log(data); 

    } catch (error: any) { 
      console.error("Failed to fetch BAXUS data:", error);
    }
  });
  
  // Keep the service worker alive briefly after install/update for initialization if needed
  chrome.runtime.onInstalled.addListener(() => {
    console.log("BAXUS API Tester extension installed/updated.");
  });