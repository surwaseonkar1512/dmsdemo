import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { CloudUpload } from '@mui/icons-material';
import api from '../services/api';

interface Props {
  open: boolean;
  onClose: () => void;
  folderId: string | null;
  onUploadSuccess: () => void;
}

const UploadModal: React.FC<Props> = ({ open, onClose, folderId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1 
  });

  const handleUpload = async () => {
    if (!file) return;
    if (!folderId) {
      setError('Please select a folder first to upload documents.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', folderId);
    // formData.append('enableOcr', 'true'); // optional based on UI toggle

    setUploading(true);
    setError('');

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUploadSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight="bold">Upload Document</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box 
          {...getRootProps()} 
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 5,
            textAlign: 'center',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover'
            }
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: isDragActive ? 'primary.main' : 'text.secondary', mb: 2 }} />
          {file ? (
            <Typography variant="h6" color="primary">{file.name}</Typography>
          ) : (
            <>
              <Typography variant="h6">Drag & drop a PDF here</Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>or click to select file</Typography>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} color="inherit" disabled={uploading}>Cancel</Button>
        <Button 
          onClick={handleUpload} 
          variant="contained" 
          disabled={!file || uploading}
          startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadModal;
