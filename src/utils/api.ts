import axios from 'axios';
import { Listing, ListingResponseItem } from '../types/listing'; 
import { PredictionResponse } from '../types/prediction'; 

const API_BASE_URL="https://services.baxus.co"

export const api = axios.create({
    baseURL: API_BASE_URL,
});

export async function searchListings(
    from: number = 0,
    size: number = 20,
    listed: boolean = true,
    query: string | undefined = undefined
): Promise<Listing[]> { 
    const response = await api.get<ListingResponseItem[]>('/api/search/listings', {
        params: {
            from,
            size,
            listed,
            query,
        }
    });
    // Extract the _source object from each item in the response array
    return response.data.map(item => item._source);
}

export async function predictImage(image: File): Promise<PredictionResponse> {
    const formData = new FormData();
    // Ensure the key 'image' matches what your backend expects
    formData.append('image', image);

    try {
        const response = await axios.post<PredictionResponse>(
            'http://127.0.0.1:5000/predict',
            formData
        );
        return response.data;
    } catch (error) {
        console.error('Error predicting image:', error);
        throw error;
    }
}

export async function checkWhiskeyGogglesHealth(): Promise<boolean> {
    try {
        // Use a simple GET request to the root or a dedicated health endpoint if available
        const response = await axios.get('http://127.0.0.1:5000/');
        // Check if the status code is in the 2xx range
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        console.error('Whiskey Goggles service health check failed:', error);
        return false; // Service is likely down or unreachable
    }
}
