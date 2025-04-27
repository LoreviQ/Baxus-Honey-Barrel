console.log("Honey Barrel: Whiskey Goggles Content script loaded.");

const HIGHLIGHT_CLASS = 'honey-barrel-highlight-element';
let currentHighlightedElement: HTMLElement | null = null;

// Function to add highlight style
function addHighlight(element: HTMLElement) {
  removeHighlight(); // Remove previous highlight
  element.classList.add(HIGHLIGHT_CLASS);
  currentHighlightedElement = element;
}

// Function to remove highlight style
function removeHighlight() {
  if (currentHighlightedElement) {
    currentHighlightedElement.classList.remove(HIGHLIGHT_CLASS);
    currentHighlightedElement = null;
  }
}

// Mouseover handler to highlight images
const handleMouseOver = (event: MouseEvent) => {
  if (event.target instanceof HTMLImageElement) {
    addHighlight(event.target);
  } else {
    removeHighlight(); // Remove highlight if not hovering over an image
  }
};

// Click handler to select the image
const handleClick = (event: MouseEvent) => {
  event.preventDefault(); // Prevent default click behavior (e.g., navigation)
  event.stopPropagation(); // Stop the event from bubbling up

  if (event.target instanceof HTMLImageElement) {
    const imageSrc = event.target.src;
    console.log("Honey Barrel: Image selected:", imageSrc);
    // Send message to the runtime (background script will listen)
    chrome.runtime.sendMessage({ type: "IMAGE_SELECTED", data: { src: imageSrc } });
    cleanup(); // Clean up listeners and styles
  } else {
    console.log("Honey Barrel: Clicked element is not an image.");
    // Optionally handle clicks on non-image elements (e.g., cancel selection)
    cleanup(); // Cleanup even if not an image
  }
};

// Function to remove listeners and styles
const cleanup = () => {
  console.log("Honey Barrel: Cleaning up image selection listeners.");
  removeHighlight();
  document.body.style.cursor = 'default'; // Restore cursor
  document.body.classList.remove('honey-barrel-selecting'); // Remove body class
  document.removeEventListener('mouseover', handleMouseOver, true);
  document.removeEventListener('click', handleClick, true);
  // Style element removal is no longer needed as CSS is injected via manifest
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Honey Barrel (Whiskey Goggles Content Script): Message received", message);
  if (message.type === "INITIATE_IMAGE_SELECTION") {
    console.log("Honey Barrel: Initiating image selection mode.");
    document.body.style.cursor = 'crosshair'; // Change cursor
    document.body.classList.add('honey-barrel-selecting'); // Add body class
    // Use capturing phase for listeners to catch events early
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('click', handleClick, true);
  } else if (message.type === "CANCEL_IMAGE_SELECTION") {
    console.log("Honey Barrel: Cancelling image selection mode.");
    cleanup();
  }
});
