import axios from 'axios';

// Define the base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define a generic function to fetch data
export const fetchData = async <T>(path: string): Promise<T> => {
    try {
        const response = await axios.get<T>(`${API_BASE_URL}/${path}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const postData = async <T, R>(path: string, data: T): Promise<R> => {
    try {
        const response = await axios.put<R>(
            `${API_BASE_URL}/${path}`,
            data,
            {
                headers: {
                    accessKey: 'dev-key',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};