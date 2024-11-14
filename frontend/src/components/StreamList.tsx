import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import type { User } from '../types';

type StreamListProps = {
    data: any
}

const EventList: React.FC<StreamListProps> = ({ data }) => {

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'firstName', headerName: 'First Name', width: 150 },
        { field: 'lastName', headerName: 'Last Name', width: 200 },
        { field: 'age', headerName: 'Age', width: 100 },
    ];



    return (
        <div>

            <DataGrid
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 5,
                        },
                    },
                }}
                pageSizeOptions={[5, 10, 20]}
                sx={{ height: 400 }}
                rows={data}
                columns={columns}
            />

        </div>
    );
};

export default EventList;