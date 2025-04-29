import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import './popup.css';
import { Listing } from '../types/listing'; 
import { ScrapedProductData } from '../types/scrapedData';
import { PredictionResponse } from '../types/prediction';
import { checkWhiskeyGogglesHealth } from '../utils/api';

const DEFAULT_MESSAGES = ["Hello!","I'm BOB, the BAXUS Outstanding Butler!","I'll let you know if I find you any deals!"];
const DEFAULT_IMAGE = "../assets/bob.png";
const WG_IMAGE = "../assets/bobWG.png";

type MessageType = string | React.ReactNode;

const Popup = () => {
  const [messages, setMessages] = useState<MessageType[]>(DEFAULT_MESSAGES);
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_IMAGE);
  const [isWhiskeyGogglesActive, setIsWhiskeyGogglesActive] = useState<boolean>(false);
  const [whiskeyGogglesResult, setWhiskeyGogglesResult] = useState<PredictionResponse | null>(null);

  useEffect(() => {
    // Check chrome.storage.local for WG results or bestMatch on initial load
    chrome.storage.local.get(['whiskeyGogglesResult', 'bestMatch', 'scrapedData'], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving from storage:", chrome.runtime.lastError);
        const errMessage = chrome.runtime.lastError.message ? chrome.runtime.lastError.message : "Unknown error";
        setMessages(['Sorry I seem to have short-circuited!', errMessage]);
        return;
      }
      console.log("Storage retrieval result:", result);
      const storedWGResult: PredictionResponse | undefined = result.whiskeyGogglesResult;
      const storedBestMatch: Listing | undefined = result.bestMatch;
      const scrapedData: ScrapedProductData | undefined = result.scrapedData;

      if (storedWGResult) {
        // If we have a whiskey goggles result, display it with confidence
        console.log("Found WG result in storage:", storedWGResult);
        setWhiskeyGogglesResult(storedWGResult);
        setMessages([
          "WHISKEY IDENTIFIED",
          storedWGResult.name,
          `CONFIDENCE LEVEL ${storedWGResult.final_score_percent.toFixed(1)}%`
        ]);
        setIsWhiskeyGogglesActive(true);
        chrome.storage.local.remove('whiskeyGogglesResult');
        chrome.action.setBadgeText({ text: '' });
      } else if (storedBestMatch) {
        // If we have a bestMatch, display it with a link
        console.log("Found bestMatch in storage:", storedBestMatch);
        const matchLink = (
          <a href={`https://www.baxus.co/asset/${storedBestMatch.id}`} target="_blank" rel="noopener noreferrer">
            {storedBestMatch.name}
          </a>
        );
        let messages = ["SAVINGS DETECTED", matchLink];
        if (scrapedData && scrapedData.price) {
          const priceDifference = scrapedData.price - storedBestMatch.price;
          const currency = scrapedData.currency || '$';
          messages.push(`Money Saved: ${currency}${priceDifference.toFixed(2)}`);
        }
        setMessages(messages);
        chrome.storage.local.remove('bestMatch'); // Clear the stored match
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
    
    // Check if the service is running before proceeding
    const isServiceHealthy = await checkWhiskeyGogglesHealth();
    if (!isServiceHealthy) {
      alert("Whiskey Goggles needs to be running locally to work.");
      return;
    }

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
          <button onClick={() => chrome.tabs.create({ url: 'https://baxathon.oliver.tj/bob' })}>Chat to BOB</button>
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

