import { searchListings } from './api'; // Assuming api.ts is in the same utils directory
import { ScrapedProductData } from '../types/scrapedData';
import { findBestMatch } from './matching'; // Assuming matching.ts is in the same utils directory

/**
 * Process scraped data and find the best BAXUS match
 * @param scrapedData The data scraped from the product page.
 * @returns void
 */
export async function checkBaxus(scrapedData: ScrapedProductData) {
    try {
        // Construct a query for the API based on scraped data and fetch listings
        const queryParts = [scrapedData.brand, scrapedData.name, scrapedData.volume, scrapedData.abv];
        const query = queryParts.filter(Boolean).join(' ');
        const listings = await searchListings(0, 20, true, query || undefined);
        console.log(`Honey Barrel (Background): Found ${listings.length} potential listings.`);
        if (listings.length === 0) {
            return;
        }
        // Find the best match using the fuzzy matching utility
        const bestMatch = findBestMatch(scrapedData, listings);
        if (!bestMatch) {
            console.log("Honey Barrel (Background): No suitable match found after fuzzy matching.");
            return;
        }

        console.log("Honey Barrel (Background): Best match found!", bestMatch);
        // TODO: Do something with the matched listing (e.g., display to user)

    } catch (error) {
        console.error("Honey Barrel (Background): Error processing scraped data:", error);
    }
}
