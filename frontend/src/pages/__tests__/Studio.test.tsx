import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { vi } from 'vitest';
import Studio from '../Studio';
import * as api from '../../services/api';

// Mock the fetchData function
vi.spyOn(api, 'fetchData').mockImplementation((url) => {
    console.log('url', url)
    switch (url) {
        case 'event/1':
            return Promise.resolve({ data: { id: '1', name: 'Live Stream 1', status: 'stopped' } });
        case 'event/1/analytics':
            return Promise.resolve({ data: { totalViewers: 1200, averageSessionLength: 35, engagementRate: 8 } });
        case 'media':
            return Promise.resolve({ data: [{ id: '1', name: 'video.mp4' }] });
        default:
            return Promise.reject(new Error('Unknown endpoint'));
    }
});

vi.mock('react-router-dom', async () => {
    const actualRouter = await vi.importActual('react-router-dom');
    return {
        ...actualRouter,
        useParams: () => ({ id: '1' }), // Mocking the returned value of useParams
    };
});

describe('User list component', () => {
    test('renders loading text initially', () => {
        render(<Studio />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test('renders intial studio state', async () => {

        render(<BrowserRouter>
            <Studio />
        </BrowserRouter>);

        await waitFor(() => {
            expect(screen.getByText('Live Stream 1')).toBeInTheDocument();
        });

        expect(screen.getByText('Live Stream 1')).toBeInTheDocument();
        expect(screen.getByText('35 mins')).toBeInTheDocument();
        expect(screen.getByText('1200')).toBeInTheDocument();
        expect(screen.getByText('8%')).toBeInTheDocument();
        expect(screen.getByText('video.mp4')).toBeInTheDocument();



    });
});