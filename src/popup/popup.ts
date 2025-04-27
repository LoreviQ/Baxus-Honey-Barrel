document.addEventListener('DOMContentLoaded', () => {
  const messageDisplay = document.getElementById('message-display');

  if (messageDisplay) {
    // Check chrome.storage.local for a message
    chrome.storage.local.get(['popupMessage'], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving message:", chrome.runtime.lastError);
        messageDisplay.textContent = 'Error loading message.';
        return;
      }

      const message = result.popupMessage;
      if (message) {
        messageDisplay.textContent = message;
        // Optional: Clear the message and badge once displayed
        chrome.storage.local.remove('popupMessage');
        chrome.action.setBadgeText({ text: '' });
      } else {
        messageDisplay.textContent = 'No new match found.'; // Default message
      }
    });
  } else {
    console.error("Could not find message display element");
  }
});
