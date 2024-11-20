import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import type { User } from '../types';

type StreamListProps = {
    data: any
}

const EventList: React.FC<StreamListProps> = ({ data, handleRowClick }) => {

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'status', headerName: 'Status', width: 150 },
        { field: 'url', headerName: 'url', width: 200 }
    ];



    return (
        <div>

            <DataGrid
                onRowClick={(params) => {
                    handleRowClick(params.row.id)
                }}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 20,
                        },
                    },
                }}
                pageSizeOptions={[5, 10, 20]}
                sx={{ height: 500 }}
                rows={data}
                columns={columns}
            />

        </div>
    );
};

export default EventList;