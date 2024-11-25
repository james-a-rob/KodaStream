import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import ControlledEditor from '@uiw/react-codemirror';
// import 'codemirror/lib/codemirror.css';
// import 'codemirror/theme/material.css';
// import 'codemirror/mode/javascript/javascript.js';
const MetadataEditorModal = ({ open, onClose, metadata, onMetadataUpdate }) => {

    const [metadataValue, setMetadataValue] = useState(metadata[0] || {});

    useEffect(() => {
        if (metadata[0]) {
            if (typeof metadata[0] === 'object') {
                // If it's an object, stringify it
                setMetadataValue(JSON.stringify(metadata[0], null, 2));
            } else
                setMetadataValue(metadata[0]); // If parsing fails, keep as string
        }
    }, [metadata]);

    const handleEditorChange = (value) => {
        setMetadataValue(value); // Pass the updated value to the parent
    };

    if (!metadataValue) {
        return;
    }


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
                    width: '70vw', // Set width to 70% of viewport width
                    maxWidth: '900px', // Optional max width for larger screens
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2, // Optional: rounded corners
                }}
            >
                <Typography id="modal-title" variant="h6" component="h2">
                    edit metadata
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <ControlledEditor
                        value={metadataValue}
                        options={{
                            mode: 'application/json',
                            theme: 'material',
                            lineNumbers: true,
                            indentUnit: 2, // Indentation for JSON
                            gutters: ['CodeMirror-lint-markers'],
                        }}
                        onChange={handleEditorChange}
                    />
                    {/* {JSON.stringify(metadata)} */}
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ 'marginTop': '12px' }}
                    onClick={
                        () => {
                            onMetadataUpdate(metadataValue, metadata[1])
                            onClose()
                        }
                    }>Set Metadata</Button>

            </Box>
        </Modal>
    );
};

export default MetadataEditorModal;