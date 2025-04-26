import { ScrapedProductData } from "../types/scrapedData";

/**
 * Checks if the current page looks like a valid FFW product page.
 */
function isFFWProductPage(): boolean {
    // Product Title
    const nameSelector = "h1.product-single__title";
    return !!document.querySelector(nameSelector);
    // TODO: Add more checks to ensure it's a valid product page
}

/**
 * Scrapes product details from the Flask Fine Wines page using native DOM APIs.
 */
function scrapeFFWProductDetails(): void {
    console.log("Honey Barrel (FFW): Scraping product details from Flask Fine Wines..."); 
    if (!isFFWProductPage()) {
        console.log("Honey Barrel (FFW): Not a product page, skipping scrape.");
        return;
    }

    try {
        // --- Selectors ---
        const nameSelector = "h1.product-single__title";
        const priceSelector = 'span[data-product-price] > span[aria-hidden="true"]'; 
        const attributeListSelector = "ul.attribute-list";

        // --- Extraction using DOM APIs ---
        const nameElement = document.querySelector(nameSelector);
        const priceElement = document.querySelector(priceSelector);
        const attributeListElement = document.querySelector(attributeListSelector);

        const productName = nameElement?.textContent?.trim() || null;
        const priceText = priceElement?.textContent?.trim() || null;

        let productPrice: number | null = null;
        let currency: string | null = null;
        let productVolumeMl: number | null = null;
        let productBrand: string | null = null;

        // --- Data Cleaning ---
        if (priceText) {
            // Match currency symbol (£, $, €) and the digits.
            // Assume the digits represent the total price in the smallest unit (e.g., pennies, cents).
            const priceMatch = priceText.match(/([£$€])?(\d+)/);
            if (priceMatch && priceMatch[2]) {
                currency = priceMatch[1] || '$'; // Assign currency symbol or default
                const priceInSmallestUnit = parseInt(priceMatch[2], 10);
                if (!isNaN(priceInSmallestUnit)) {
                    // Divide by 100 to get the correct decimal value (e.g., 35400 -> 354.00)
                    productPrice = priceInSmallestUnit / 100.0;
                }
            }
        }

        // Extract Volume and Brand from the attribute list
        if (attributeListElement) {
            const listItems = attributeListElement.querySelectorAll("li.attribute-item");
            listItems.forEach(item => {
                const labelElement = item.querySelector("span.attribute-label");
                const valueElement = item.querySelector("span.attribute-value, a.attribute-value"); // Can be span or a

                if (labelElement && valueElement) {
                    const label = labelElement.textContent?.trim();
                    const value = valueElement.textContent?.trim();

                    if (value) {
                        if (label === "Size") {
                            const volumeMatch = value.match(/(\d+)\s*ml/i);
                            if (volumeMatch) {
                                productVolumeMl = parseInt(volumeMatch[1], 10);
                            } else {
                                const clMatch = value.match(/(\d+)\s*cl/i);
                                if (clMatch) {
                                    productVolumeMl = parseInt(clMatch[1], 10) * 10; // Convert cl to ml
                                }
                            }
                        } else if (label === "Brand") {
                            productBrand = value;
                        }
                    }
                }
            });
        }


        // --- Validation ---
        if (!productName || !productPrice) {
            console.log("Honey Barrel (FFW): Could not find essential product details (name/price).");
            return;
        }

        // --- Send Data ---
        const scrapedData: ScrapedProductData = {
            name: productName,
            price: productPrice,
            currency: currency,
            volume: productVolumeMl,
            brand: productBrand,
            abv: null, // ABV not available on FFW
            sourceUrl: window.location.href,
            sourceSite: 'Flask Fine Wines',
        };
        console.log("Honey Barrel (FFW): Scraped Data:", scrapedData);
        chrome.runtime.sendMessage({ type: "SCRAPED_DATA", data: scrapedData });
    } catch (error) {
        console.error("Honey Barrel (FFW): Error during scraping:", error);
    }
}

scrapeFFWProductDetails();