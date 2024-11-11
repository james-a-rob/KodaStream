import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Users from '../Studio';
import * as api from '../../services/api';

// Mock the fetchData function
vi.spyOn(api, 'fetchData').mockResolvedValue({
    data: [
        {
            "id": 1,
            "firstName": "James",
            "lastName": "Robertson",
            "age": 33
        },
        {
            "id": 2,
            "firstName": "Bob",
            "lastName": "Robertson",
            "age": 30
        },
    ]
});

describe('User list component', () => {
    test('renders loading text initially', () => {
        render(<Users />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test('renders list of users from api', async () => {
        render(<Users />);

        await waitFor(() => {
            expect(screen.getByText('Users')).toBeInTheDocument();
        });

        expect(screen.getByText('James')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });
});