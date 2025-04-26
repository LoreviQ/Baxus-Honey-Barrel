import axios from 'axios';

const API_BASE_URL="https://services.baxus.co"

export const api = axios.create({
    baseURL: API_BASE_URL,
});

export async function searchListings(
    from: number = 0,
    size: number = 20,
    listed: boolean = true
) {
    return await api.get('/api/search/listings', {
        params: {
            from,
            size,
            listed
        }
    });
}