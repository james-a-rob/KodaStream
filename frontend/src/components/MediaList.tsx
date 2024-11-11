import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';

type MediaListProps = {
    data: any
}

const MediaList: React.FC<MediaListProps> = ({ data }) => {

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 140 },
        { field: 'name', headerName: 'Name', width: 140 },
    ];



    return (
        <div>
            <Box
                sx={{
                    height: 400,
                    bgcolor: 'white',
                    boxShadow: 3,
                    marginTop: '20px',
                    borderRadius: 2,
                    padding: 2,
                }}
            >
                <DataGrid
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 5,
                            },
                        },
                    }}
                    pageSizeOptions={[5, 10, 20]}
                    rows={data}
                    columns={columns}
                />
            </Box>
        </div>
    );
};

export default MediaList;