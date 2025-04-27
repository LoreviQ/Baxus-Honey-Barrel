import { searchListings } from './api';
import { ScrapedProductData } from '../types/scrapedData';
import { ListingSource } from '../types/listing'; 
import { findBestMatch } from './matching'; 

/**
 * Process scraped data and find the best BAXUS match
 * @param scrapedData The data scraped from the product page.
 * @returns ListingSource | null The best matching listing source or null if no match is found.
 */
export async function checkBaxus(scrapedData: ScrapedProductData): Promise<ListingSource | null> {
    try {
        // Construct a query for the API based on scraped data and fetch listings
        const queryParts = [scrapedData.brand, scrapedData.name, scrapedData.volume, scrapedData.abv];
        const query = queryParts.filter(Boolean).join(' ');
        const listings = await searchListings(0, 20, true, query || undefined);
        console.log(`Honey Barrel (Background): Found ${listings.length} potential listings.`);
        if (listings.length === 0) {
            return null;
        }
        // Find the best match using the fuzzy matching utility
        const bestMatch = findBestMatch(scrapedData, listings);
        if (!bestMatch) {
            console.log("Honey Barrel (Background): No suitable match found after fuzzy matching.");
            return null;
        }

        console.log("Honey Barrel (Background): Best match found!", bestMatch);
        return bestMatch;

    } catch (error) {
        console.error("Honey Barrel (Background): Error processing scraped data:", error);
        return null;
    }
}
