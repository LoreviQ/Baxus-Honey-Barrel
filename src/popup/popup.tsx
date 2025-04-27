import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './popup.css';

const DEFAULT_MESSAGES = ["Hello!","I'm BOB, the BAXUS Outstanding Butler!","I'll let you know if I find you any deals!"];
const DEFAULT_IMAGE = "../assets/bob.png";
const WG_IMAGE = "../assets/bobWG.png";

const Popup = () => {
  const [messages, setMessages] = useState<string[]>(DEFAULT_MESSAGES);
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_IMAGE);

  useEffect(() => {
    // Listener for messages from content script or background
    const messageListener = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      console.log("Popup received message:", message);
      if (message.type === "IMAGE_SELECTED") {
        const selectedImageSrc = message.data.src;
        setMessages([`Selected Image Source:`, selectedImageSrc]);
        // Optionally change BOB's image back or to something else
        // setImageSrc(DEFAULT_IMAGE);
      }
      // Handle other message types if needed
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Check chrome.storage.local for a message on initial load
    chrome.storage.local.get(['popupMessage'], (result) => {
      // ... existing storage check logic ...
      if (chrome.runtime.lastError) {
        console.error("Error retrieving message:", chrome.runtime.lastError);
        const errMessage = chrome.runtime.lastError.message ? chrome.runtime.lastError.message : "Unknown error";
        setMessages(['Sorry I seem to have short-circuited!', errMessage]);
        return;
      }

      const storedMessage = result.popupMessage;
      if (storedMessage) {
        setMessages(["I found you a saving!", storedMessage]);
        chrome.storage.local.remove('popupMessage');
        chrome.action.setBadgeText({ text: '' });
      }
    });

    // Cleanup function to remove the listener when the popup closes
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleanup on unmount

  const handleWhiskeyGogglesClick = async () => {
    console.log("Whiskey Goggles clicked");
    setImageSrc(WG_IMAGE); // Keep visual feedback in popup

    // Find the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab && tab.id) {
      try {
        // Send a message to the content script in the active tab
        await chrome.tabs.sendMessage(tab.id, { type: "INITIATE_IMAGE_SELECTION" });
        // Popup stays open - removed window.close();
        setMessages(["Please click an image on the page..."]); // Update status message
      } catch (error) {
        console.error("Could not send message to content script:", error);
        // Handle error, maybe display a message to the user in the popup
        setMessages(["Error: Could not connect to the page. Try reloading."]);
      }
    } else {
      console.error("Could not find active tab.");
      setMessages(["Error: Could not find active tab."]);
    }
  };

  return (
    <div className="container">
      <div className="content-area">
        <div className="left-column">
        <div className="message-container" id="message-display">
            {messages.map((message, index) => (
              <div key={index} className="message">
                {message}
              </div>
            ))}
          </div>
        </div>
        <div className="right-column">
          <img id="popup-image" src={imageSrc} alt="Popup Image" />
        </div>
        <div className="button-container">
          <button onClick={() => console.log("Chat to BOB clicked")}>Chat to BOB</button>
          <button onClick={handleWhiskeyGogglesClick}>Whiskey Goggles</button>
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
} else {
  console.error('Could not find root element to mount React app');
}
