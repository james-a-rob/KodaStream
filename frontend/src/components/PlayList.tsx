import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, IconButton, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import MetadataEditorModal from './MetaDataEditorModal';

type MediaListProps = {
    data: any[];
};

const PlayList: React.FC<MediaListProps> = ({ data, deleteItemFromPlaylists, onMetadataUpdate }) => {
    const [rows, setRows] = useState(data);
    const [editorModalOpen, setEditorModalOpen] = useState(false);
    const [currentlyEditingMetadata, setCurrentlyEditingMetadata] = useState();

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
            field: 'metadata', headerName: 'Metadata', sortable: false, editable: false, width: 400,
            renderCell: (params) => (
                <Typography
                    onClick={() => {
                        setCurrentlyEditingMetadata([params.row.metadata, params.row.id])
                        setEditorModalOpen(true)
                    }}
                    component="a"
                    sx={{
                        cursor: 'pointer',
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                            textDecoration: 'underline',
                        },
                    }}



                >edit</Typography>
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
            {editorModalOpen && <MetadataEditorModal
                open={editorModalOpen}
                onClose={() => {
                    setEditorModalOpen(false)
                }}
                metadata={currentlyEditingMetadata}
                onMetadataUpdate={onMetadataUpdate}
                description="This modal accepts dynamic input data and actions."
            ></MetadataEditorModal>}
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
