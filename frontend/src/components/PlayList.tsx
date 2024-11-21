import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, IconButton } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';

type MediaListProps = {
    data: any[];
};

const PlayList: React.FC<MediaListProps> = ({ data, deleteItemFromPlaylists, onRowUpdate }) => {
    const [rows, setRows] = useState(data);
    const [draggingRowId, setDraggingRowId] = useState<number | null>(null);

    useEffect(() => {
        setRows(data);
    }, [data]);


    const columns: GridColDef[] = [
        {
            field: 'drag',
            headerName: '',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <IconButton
                    draggable
                    onDragStart={() => handleDragStart(params.id as number)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(params.id as number)}
                    size="small"
                    sx={{ cursor: 'grab' }}
                >
                    <DragIndicatorIcon />
                </IconButton>
            ),
        },
        { field: 'id', headerName: 'ID', width: 100, sortable: false },
        { field: 'location', headerName: 'Location', sortable: false, width: 200 },
        {
            field: 'metadata', headerName: 'Metadata', sortable: false, editable: true, width: 400,
            renderCell: (params) => (
                <div
                    variant="outlined"
                    multiline
                    fullWidth
                    size="small"
                    maxRows={40}
                    value={params.row.metadata}


                >{params.row.metadata}</div>
            ),

        },

        {
            field: 'delete',
            headerName: '',
            width: 80,
            sortable: false,
            renderCell: (params) => (
                <IconButton
                    onClick={() => deleteItemFromPlaylists(params.id as number)}
                    size="small"
                    aria-label="delete"
                >
                    <DeleteIcon />
                </IconButton>
            ),
        },
    ];

    const handleDragStart = (id: number) => {
        setDraggingRowId(id);
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    const handleDrop = (targetRowId: number) => {
        if (draggingRowId === null || draggingRowId === targetRowId) {
            return;
        }

        const draggedRowIndex = rows.findIndex((row) => row.id === draggingRowId);
        const targetRowIndex = rows.findIndex((row) => row.id === targetRowId);

        const updatedRows = [...rows];
        const [draggedRow] = updatedRows.splice(draggedRowIndex, 1);
        updatedRows.splice(targetRowIndex, 0, draggedRow);

        setRows(updatedRows);
        setDraggingRowId(null);
    };

    return (
        <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
                rows={rows}
                processRowUpdate={(newRow) => onRowUpdate(newRow)}
                columns={columns}
                disableColumnFilter
                disableColumnMenu
                pageSize={5}
            />
        </Box>
    );
};

export default PlayList;
