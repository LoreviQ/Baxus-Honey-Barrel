import axios from 'axios';
import { Listing, ListingResponseItem } from '../types/listing'; // Import the types

const API_BASE_URL="https://services.baxus.co"

export const api = axios.create({
    baseURL: API_BASE_URL,
});

export async function searchListings(
    from: number = 0,
    size: number = 20,
    listed: boolean = true
): Promise<Listing[]> { 
    const response = await api.get<ListingResponseItem[]>('/api/search/listings', {
        params: {
            from,
            size,
            listed
        }
    });
    // Extract the _source object from each item in the response array
    return response.data.map(item => item._source);
}