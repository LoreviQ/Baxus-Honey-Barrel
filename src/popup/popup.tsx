import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import './popup.css';

const DEFAULT_MESSAGES = ["Hello!","I'm BOB, the BAXUS Outstanding Butler!","I'll let you know if I find you any deals!"];
const DEFAULT_IMAGE = "../assets/bob.png";
const WG_IMAGE = "../assets/bobWG.png";

const Popup = () => {
  const [messages, setMessages] = useState<string[]>(DEFAULT_MESSAGES);
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_IMAGE);
  const [isWhiskeyGogglesActive, setIsWhiskeyGogglesActive] = useState<boolean>(false);
  const [whiskeyGogglesResult, setWhiskeyGogglesResult] = useState<string | null>(null);

  useEffect(() => {
    // Check chrome.storage.local for WG results or regular messages on initial load
    chrome.storage.local.get(['whiskeyGogglesResult', 'popupMessage'], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving from storage:", chrome.runtime.lastError);
        const errMessage = chrome.runtime.lastError.message ? chrome.runtime.lastError.message : "Unknown error";
        setMessages(['Sorry I seem to have short-circuited!', errMessage]);
        return;
      }

      const storedWGResult = result.whiskeyGogglesResult;
      const storedPopupMessage = result.popupMessage;

      if (storedWGResult) {
        // If we have a whiskey goggles result, display it
        console.log("Found WG result in storage:", storedWGResult);
        setWhiskeyGogglesResult(storedWGResult);
        setMessages(["Whiskey Goggles Result:", storedWGResult]);
        setIsWhiskeyGogglesActive(true);
        chrome.storage.local.remove('whiskeyGogglesResult');
        chrome.action.setBadgeText({ text: '' });
      } else if (storedPopupMessage) {
        // If we have a popup message, display it
        setMessages(["Saving detected!", storedPopupMessage]);
        chrome.storage.local.remove('popupMessage');
        chrome.action.setBadgeText({ text: '' });
      }
    });
    return () => {};
  }, []); 

  useEffect(() => {
    if (isWhiskeyGogglesActive) {
      setImageSrc(WG_IMAGE);
    } else {
      setImageSrc(DEFAULT_IMAGE);
    }
  }, [isWhiskeyGogglesActive]);

  const sendMessageToActiveTab = async (message:string, onError?: (error: any) => void) => {
    // Find the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      console.error("Could not find active tab.");
      setMessages(["Error: Could not find active tab."]);
      return;
    }
    try {
      await chrome.tabs.sendMessage(tab.id, { type: message });
    } catch (error) {
      console.error(`Could not send ${message} message to content script:`, error);
      setMessages(['Sorry I seem to have short-circuited!', "Try reloading the page."]);
      if (onError) {
        onError(error);
      }
    }
  }

  const handleWhiskeyGogglesClick = async () => {
    console.log("Whiskey Goggles clicked. Active state:", isWhiskeyGogglesActive);
    if (!isWhiskeyGogglesActive) {
      // Activate WG mode
      console.log("Activating WG mode");
      setIsWhiskeyGogglesActive(true);
      setMessages(["DETECTING WHISKEY", "Please select your image"]);
      setWhiskeyGogglesResult(null);
      sendMessageToActiveTab("INITIATE_IMAGE_SELECTION", () => {setIsWhiskeyGogglesActive(false);});
      return;
    } 

    if (whiskeyGogglesResult) {
      // If there's a previous result, activate image selection mode
      setMessages(["DETECTING WHISKEY", "Please select your image"]);
      setWhiskeyGogglesResult(null);
      sendMessageToActiveTab("INITIATE_IMAGE_SELECTION", () => {setIsWhiskeyGogglesActive(false);});
      return;
    }

    // Deactivate WG mode
    console.log("Deactivating WG mode");
    setIsWhiskeyGogglesActive(false);
    setMessages(DEFAULT_MESSAGES);
    setWhiskeyGogglesResult(null);
    sendMessageToActiveTab("CANCEL_IMAGE_SELECTION");
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

