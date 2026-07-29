import APIError from './APIError';
import { Alert } from 'react-native';
import { storage } from './storage';

const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

class BaseApiService {
    async request(
        url: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        params: object = {}
    ): Promise<any> {
        const token = await storage.getItem('_token');
        const baseURL = BASE_API_URL;

        const isFormData = params instanceof FormData;

        const headers: HeadersInit = {
            Accept: 'application/json',
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        let fullUrl = `${baseURL}${url}`;
        const fetchOptions: RequestInit = {
            method,
            headers,
        };

        if (method === 'GET') {
            // Build query params safely
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                    searchParams.append(key, String(val));
                }
            });
            const query = searchParams.toString();
            fullUrl += query ? `?${query}` : '';
        } else {
            fetchOptions.body = isFormData ? (params as any) : JSON.stringify(params);
        }

        try {
            const response = await fetch(fullUrl, fetchOptions);
            const data = await response.json();

            if (!response.ok) {
                switch (response.status) {
                    case 400:
                    case 404:
                    case 422:
                    case 429:
                        throw new APIError(data);
                    case 401:
                        await this.revokeAccess();
                        throw new APIError(data);
                    case 403:
                        throw new APIError({ message: 'Unauthorized. Only administrators can perform this action.' });
                    case 500:
                        throw new APIError({ message: 'Server error. Please try again. If the problem persists, contact your system administrator.' });
                    default:
                        throw new APIError({ message: 'Something went wrong. Please try again.' });
                }
            }

            return data;
        } catch (err: any) {
            if (err instanceof APIError) throw err;
            throw new APIError({ message: err.message || 'Unknown error occurred' });
        }
    }

    async revokeAccess() {
        await storage.removeItem('_token');
        await storage.removeItem('_user');
        if (typeof window !== 'undefined') {
            window.alert('Session expired. You have been logged out.');
        } else {
            Alert.alert('Session expired', 'You have been logged out.');
        }
    }
}

export const apiService = new BaseApiService();
export default BaseApiService;
