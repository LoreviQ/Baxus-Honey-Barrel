import Fuse from 'fuse.js';
import { ScrapedProductData } from '../types/scrapedData';
import { Listing } from '../types/listing';

/**
 * Parses a size string (e.g., "70cl", "750ml") into milliliters.
 * Returns null if parsing fails.
 */
function parseVolume(sizeString: string | undefined): number | null {
    if (!sizeString) return null;
    const sizeLower = sizeString.toLowerCase().replace(/\s+/g, '');

    const mlMatch = sizeLower.match(/^(\d+(\.\d+)?)ml$/);
    if (mlMatch && mlMatch[1]) {
        return parseFloat(mlMatch[1]);
    }

    const clMatch = sizeLower.match(/^(\d+(\.\d+)?)cl$/);
    if (clMatch && clMatch[1]) {
        return parseFloat(clMatch[1]) * 10; // Convert cl to ml
    }

    const lMatch = sizeLower.match(/^(\d+(\.\d+)?)l$/);
    if (lMatch && lMatch[1]) {
        return parseFloat(lMatch[1]) * 1000; // Convert l to ml
    }

    console.warn(`Could not parse volume: ${sizeString}`);
    return null;
}


/**
 * Finds the best matching listing for the scraped product data using fuzzy search.
 *
 * @param scrapedData The data scraped from the product page.
 * @param listings A list of potential listings fetched from the API.
 * @returns The best matching Listing or null if no suitable match is found.
 */
export function findBestMatch(
    scrapedData: ScrapedProductData,
    listings: Listing[]
): Listing | null {
    if (!listings || listings.length === 0 || !scrapedData.name) {
        return null;
    }

    // Configure Fuse.js for fuzzy searching on the listing name
    const fuseOptions = {
        includeScore: true,
        keys: [
            { name: 'name', weight: 0.6 }, // Primary name field
            { name: 'attributes.Name', weight: 0.5 }, // Name within attributes
            { name: 'attributes.Series', weight: 0.2 }, 
        ],
        threshold: 0.7, 
        minMatchCharLength: 2,
        ignoreLocation: false, 
    }

    const fuse = new Fuse(listings, fuseOptions);

    // Perform the search using the scraped product name
    const results = fuse.search(scrapedData.name);
    console.log(`Fuzzy search for "${scrapedData.name}" yielded ${results.length} results:`, results);
    if (results.length === 0) {
        return null;
    }

    // Secondary checks/scoring based on other fields (brand, ABV, volume)
    const potentialMatches = results.map(result => {
        let score = result.score ?? 1.0;
        const listing = result.item;

        // Check ABV match (increase score slightly if mismatch)
        if (scrapedData.abv && listing.attributes?.ABV) {
            const listingAbv = parseFloat(String(listing.attributes.ABV).replace('%',''));
            if (!isNaN(listingAbv) && Math.abs(listingAbv - scrapedData.abv) > 1) { // 1% tolerance
                 score += 0.1;
            }
        }

        // Check Volume match (increase score slightly if mismatch)
        if (scrapedData.volume && listing.attributes?.Size) {
            const listingVolume = parseVolume(listing.attributes.Size);
            if (listingVolume && Math.abs(listingVolume - scrapedData.volume) > 50) { // 50ml tolerance
                 score += 0.1;
            }
        }


        return { ...result, score };
    }).sort((a, b) => (a.score ?? 1.0) - (b.score ?? 1.0));


    // Match threshold
    const bestMatch = potentialMatches[0];
    const SCORE_THRESHOLD = 0.75;

    if (bestMatch && bestMatch.score !== undefined && bestMatch.score < SCORE_THRESHOLD) {
         console.log("Best match found:", bestMatch.item, "with score:", bestMatch.score);
        return bestMatch.item;
    } else {
        console.log("No match found above score threshold.", bestMatch ? `Best score: ${bestMatch.score}` : '');
        return null;
    }
}
