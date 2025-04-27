import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './static/popup.css';

const Popup = () => {
  const [message, setMessage] = useState<string>('Loading message...');

  useEffect(() => {
    // Check chrome.storage.local for a message
    chrome.storage.local.get(['popupMessage'], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving message:", chrome.runtime.lastError);
        setMessage('Error loading message.');
        return;
      }

      const storedMessage = result.popupMessage;
      if (storedMessage) {
        setMessage(storedMessage);
        chrome.storage.local.remove('popupMessage');
        chrome.action.setBadgeText({ text: '' });
      } else {
        setMessage('No new match found.'); 
      }
    });
  }, []);

  return (
    <div className="container">
      <div className="content-area">
        <div className="left-column">
          <div className="greeting" id="message-display">
            {message}
          </div>
        </div>
        <div className="right-column">
          <img id="popup-image" src="../assets/bob.png" alt="Popup Image" />
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
