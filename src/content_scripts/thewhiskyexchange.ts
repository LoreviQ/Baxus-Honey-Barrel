import { ScrapedProductData } from "../types/scrapedData";

/**
 * Checks if the current page looks like a valid TWE product page.
 */
function isTWEProductPage(): boolean {
    // Product Title
    const nameSelector = "h1.product-main__name";
    return !!document.querySelector(nameSelector);
    // TODO: Add more checks to ensure it's a valid product page
}

/**
 * Scrapes product details from The Whisky Exchange page using native DOM APIs.
 */
function scrapeTWEProductDetails(): void {
    console.log("Scraping product details from The Whisky Exchange...");
    if (!isTWEProductPage()) {
        console.log("Honey Barrel (TWE): Not a product page, skipping scrape.");
        return;
    }

    try {
        // --- Selectors ---
        const nameSelector = "h1.product-main__name";
        const priceSelector = ".product-action__price";
        const volumeAbvSelector = ".product-main__data";
        const brandLinkSelector = 'nav.product-navigation a[title^="More from"]';


        // --- Extraction using DOM APIs ---
        const nameElement = document.querySelector(nameSelector);
        const priceElement = document.querySelector(priceSelector);
        const volumeAbvElement = document.querySelector(volumeAbvSelector);
        const brandLinkElement = document.querySelector(brandLinkSelector);


        const productName = nameElement?.textContent?.trim() || null;
        const priceText = priceElement?.textContent?.trim() || null;
        // Get text like "70cl / 46%"
        const volumeAbvText = volumeAbvElement?.textContent?.trim() || null;
        // Get text like "More from Glenallachie"
        const brandLinkText = brandLinkElement?.textContent?.trim() || null;


        let productPrice: number | null = null;
        let currency: string | null = null;
        let productVolumeMl: number | null = null;
        let productAbv: number | null = null;
        let productBrand: string | null = null;

        // --- Data Cleaning ---
        if (priceText) {
            const priceMatch = priceText.match(/([£$€])?(\d+(\.\d{1,2})?)/);
            if (priceMatch) {
                currency = priceMatch[1] || '£'; // Default to £ for TWE
                productPrice = parseFloat(priceMatch[2]);
            }
        }

        // Parse Volume and ABV from volumeAbvText
        if (volumeAbvText) {
            // Extract Volume (cl or ml)
            const volumeMatchCl = volumeAbvText.match(/(\d+)\s*cl/i);
            if (volumeMatchCl) {
                productVolumeMl = parseInt(volumeMatchCl[1], 10) * 10; // Convert cl to ml
            } else {
                 const volumeMatchMl = volumeAbvText.match(/(\d+)\s*ml/i);
                 if (volumeMatchMl) {
                     productVolumeMl = parseInt(volumeMatchMl[1], 10);
                 }
            }

            // Extract ABV (%)
            const abvMatch = volumeAbvText.match(/(\d+(\.\d+)?)\s*%/);
            if (abvMatch) {
                productAbv = parseFloat(abvMatch[1]);
            }
        }

        // Parse Brand from brandLinkText
        if (brandLinkText) {
            const brandMatch = brandLinkText.match(/More from\s+(.+)/i);
            if (brandMatch && brandMatch[1]) {
                productBrand = brandMatch[1].trim();
            }
        }


        // --- Validation ---
        if (!productName || !productPrice) {
            console.log("Honey Barrel (TWE): Could not find essential product details (name/price).");
            return;
        }

        // --- Send Data ---
        const scrapedData: ScrapedProductData = {
            name: productName,
            price: productPrice,
            currency: currency,
            volume: productVolumeMl,
            brand: productBrand,
            abv: productAbv,
            sourceUrl: window.location.href,
            sourceSite: 'The Whisky Exchange'
        };
        console.log("Honey Barrel (TWE): Scraped Data:", scrapedData);
        chrome.runtime.sendMessage({ type: "SCRAPED_DATA", data: scrapedData });

    } catch (error) {
        console.error("Honey Barrel (TWE): Error during scraping:", error);
    }
}

scrapeTWEProductDetails();