import axios from 'axios';

// Define the base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const API_KEY = import.meta.env.VITE_API_KEY || 'dev-key';


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

export const putData = async <T, R>(path: string, data: T): Promise<R> => {
    try {
        const response = await axios.put<R>(
            `${API_BASE_URL}/${path}`,
            data,
            {
                headers: {
                    accessKey: API_KEY,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};

export const postData = async <T, R>(path: string, data: T): Promise<R> => {
    try {
        const response = await axios.post<R>(
            `${API_BASE_URL}/${path}`,
            data,
            {
                headers: {
                    accessKey: API_KEY,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};