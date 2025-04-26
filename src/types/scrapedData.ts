/**
 * Represents the data scraped from a product page on an e-commerce site.
 */
export interface ScrapedProductData {
    /** The name of the product. */
    name: string | null;
    /** The price of the product. */
    price: number | null;
    /** The currency symbol (e.g., £, $, €). */
    currency: string | null;
    /** The volume of the product in milliliters (ml). */
    volume: number | null;
    /** The brand of the product. */
    brand: string | null;
    /** The Alcohol By Volume (ABV) percentage. */
    abv: number | null;
    /** The URL of the page where the data was scraped. */
    sourceUrl: string;
    /** The name of the website where the data was scraped (e.g., 'The Whisky Exchange'). */
    sourceSite: string;
}
