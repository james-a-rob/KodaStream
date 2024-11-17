import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, IconButton } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';

type MediaListProps = {
    data: any[];
};

const MediaList: React.FC<MediaListProps> = ({ data }) => {
    const [rows, setRows] = useState(data);
    const [draggingRowId, setDraggingRowId] = useState<number | null>(null);

    useEffect(() => {
        setRows(data);
    }, [data]);

    const handleDelete = (id: number) => {
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    };

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
        { field: 'id', headerName: 'ID', width: 140, sortable: false },
        { field: 'location', headerName: 'Location', sortable: false, width: 300 },
        {
            field: 'delete',
            headerName: '',
            width: 80,
            sortable: false,
            renderCell: (params) => (
                <IconButton
                    onClick={() => handleDelete(params.id as number)}
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
        <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                disableColumnFilter
                disableColumnMenu
                disableSelectionOnClick
                pageSize={5}
            />
        </Box>
    );
};

export default MediaList;
