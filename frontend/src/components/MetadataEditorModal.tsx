import React from 'react';
import { Modal, Box, Typography } from '@mui/material';

const MetadataEditorModal = ({ open, onClose, metadata }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <Typography id="modal-title" variant="h6" component="h2">
                    edit metadata
                </Typography>

                <Box sx={{ mt: 2 }}>

                    {JSON.stringify(metadata)}
                </Box>


            </Box>
        </Modal>
    );
};

export default MetadataEditorModal;