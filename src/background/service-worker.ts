// Listen for when the user clicks the extension's browser action icon
chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
    console.log("Extension icon clicked. Fetching BAXUS data...");
  
    const apiUrl = "https://services.baxus.co/api/search/listings?from=0&size=20&listed=true";
  
    try {
      const response = await fetch(apiUrl); // Use fetch API [3]
  
      console.log("Raw Response Status:", response.status, response.statusText);
  
      if (!response.ok) {
        // If response status is not 2xx, log error and response text
        const errorText = await response.text();
        console.error(`HTTP error! Status: ${response.status}. Body: ${errorText}`);
        return; // Stop further processing
      }
  
      // If response is OK, parse the JSON
      const data = await response.json();
      console.log("Successfully fetched and parsed BAXUS data:");
      console.log(data); // Log the actual data structure
  
    } catch (error) {
      // Catch any network errors or issues during fetch/parsing
      console.error("Failed to fetch BAXUS data:", error);
    }
  });
  
  // Keep the service worker alive briefly after install/update for initialization if needed
  chrome.runtime.onInstalled.addListener(() => {
    console.log("BAXUS API Tester extension installed/updated.");
  });