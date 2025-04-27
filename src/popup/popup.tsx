import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './static/popup.css';

const DEFAULT_MESSAGES = ["Hello!","I'm BOB, the BAXUS Outstanding Butler!","I'll let you know if I find you any deals!"];
const DEFAULT_IMAGE = "../assets/bob.png";
const WG_IMAGE = "../assets/bobWG.png";

const Popup = () => {
  const [messages, setMessages] = useState<string[]>(DEFAULT_MESSAGES);
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_IMAGE);

  useEffect(() => {
    // Check chrome.storage.local for a message
    chrome.storage.local.get(['popupMessage'], (result) => {
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
  }, []);

  const handleWhiskeyGogglesClick = () => {
    console.log("Whiskey Goggles clicked");
    setImageSrc(WG_IMAGE);
    // Optionally, reset the image after some time or on another action
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
