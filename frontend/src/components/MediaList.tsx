import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

type MediaListProps = {
    data: any
}

const MediaList: React.FC<MediaListProps> = ({ data, addItemToPlaylist }) => {

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'id', width: 300, },
        { field: 'location', headerName: 'location', width: 300 },

    ];


    return (
        <div>
            <DataGrid
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 10,
                        },
                    },
                }}
                sx={{ height: 500 }}
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