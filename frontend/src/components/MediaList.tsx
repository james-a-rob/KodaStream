import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';

type MediaListProps = {
    data: any
}

const MediaList: React.FC<MediaListProps> = ({ data, addItemToPlaylist }) => {

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 20 },
        { field: 'location', headerName: 'Location', width: 220 },
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
                sx={{ height: 400 }}
                pageSizeOptions={[5, 10, 20]}
                rows={data}
                columns={columns}
                onRowClick={(params) => {
                    addItemToPlaylist(params.row)
                }}
            />

        </div>
    );
};

export default MediaList;