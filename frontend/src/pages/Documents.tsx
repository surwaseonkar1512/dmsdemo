import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Breadcrumbs, Link, Card,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip
} from '@mui/material';
import {
  Folder as FolderIcon, PictureAsPdf, CreateNewFolder, CloudUpload, NavigateNext, Delete
} from '@mui/icons-material';
import api from '../services/api';
import UploadModal from '../components/UploadModal';

interface FolderNode {
  _id: string;
  name: string;
  parentId: string | null;
  path: string;
}

const Documents = () => {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderNode | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<FolderNode[]>([]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const loadContents = async (folder: FolderNode | null) => {
    try {
      const parentIdQuery = folder ? `?parentId=${folder._id}` : '';
      const folderRes = await api.get(`/folders${parentIdQuery}`);
      setFolders(folderRes.data);

      if (folder) {
        const docRes = await api.get(`/documents/search?folderId=${folder._id}`);
        setDocuments(docRes.data.data || []);
      } else {
        setDocuments([]); // No loose documents at root
      }
    } catch (error) {
      console.error('Failed to load contents', error);
    }
  };

  useEffect(() => {
    loadContents(currentFolder);
  }, [currentFolder]);

  const handleFolderClick = (folder: FolderNode) => {
    setCurrentFolder(folder);
    setBreadcrumbs([...breadcrumbs, folder]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentFolder(null);
      setBreadcrumbs([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1]);
      setBreadcrumbs(newBreadcrumbs);
    }
  };

  const handleCreateFolder = async () => {
    try {
      await api.post('/folders', {
        name: newFolderName,
        parentId: currentFolder ? currentFolder._id : null
      });
      setNewFolderOpen(false);
      setNewFolderName('');
      loadContents(currentFolder);
    } catch (error) {
      console.error('Failed to create folder');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (window.confirm('Delete this folder?')) {
      try {
        await api.delete(`/folders/${id}`);
        loadContents(currentFolder);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete folder');
      }
    }
  }

  const handleDownloadDoc = async (id: string, filename: string) => {
    try {
      const response = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (window.confirm('Delete this document?')) {
      try {
        await api.delete(`/documents/${id}`);
        loadContents(currentFolder);
      } catch (error) {
        console.error('Delete failed', error);
      }
    }
  };

  const handleApproveDoc: any = async (id: string, folderId: string | null) => {
    if (window.confirm('Are you sure you want to approve this document? This will permanently add an "APPROVED" stamp to the file.')) {
      try {
        await api.put(`/documents/${id}/approve`);
        // Refresh the folder that actually contains this document
        if (folderId) {
          const folder = folders.find((f) => f._id === folderId) || null;
          loadContents(folder);
        } else {
          loadContents(null);
        }
      } catch (error) {
        console.error('Approve failed', error);
      }
    }
  };


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>File Manager</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<CreateNewFolder />}
            onClick={() => setNewFolderOpen(true)}
            sx={{ mr: 2, borderRadius: 2 }}
          >
            New Folder
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => setUploadOpen(true)}
            sx={{ borderRadius: 2 }}
            disabled={!currentFolder}
          >
            Upload Document
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3, p: 2, borderRadius: 3, bgcolor: 'background.paper' }}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb">
          <Link
            component="button"
            variant="body1"
            onClick={() => handleBreadcrumbClick(-1)}
            underline="hover"
            color={currentFolder === null ? 'text.primary' : 'inherit'}
            sx={{ fontWeight: currentFolder === null ? 'bold' : 'normal' }}
          >
            Root
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={crumb._id}
              component="button"
              variant="body1"
              onClick={() => handleBreadcrumbClick(index)}
              underline="hover"
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
              sx={{ fontWeight: index === breadcrumbs.length - 1 ? 'bold' : 'normal' }}
            >
              {crumb.name}
            </Link>
          ))}
        </Breadcrumbs>
      </Card>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {folders.length === 0 && documents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">This folder is empty.</Typography>
                </TableCell>
              </TableRow>
            )}

            {/* Folders */}
            {folders.map(folder => (
              <TableRow key={folder._id} hover sx={{ cursor: 'pointer' }}>
                <TableCell onClick={() => handleFolderClick(folder)}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FolderIcon color="warning" sx={{ mr: 2, fontSize: 28 }} />
                    <Typography sx={{ fontWeight: 600 }}>{folder.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell onClick={() => handleFolderClick(folder)}>--</TableCell>
                <TableCell onClick={() => handleFolderClick(folder)}>Folder</TableCell>
                <TableCell onClick={() => handleFolderClick(folder)}>--</TableCell>
                <TableCell onClick={() => handleFolderClick(folder)}>--</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder._id); }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {/* Documents */}
            {documents.map(doc => (
              <TableRow key={doc._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PictureAsPdf color="error" sx={{ mr: 2, fontSize: 28 }} />
                    <Typography>{doc.originalFileName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{(doc.fileSize / 1024).toFixed(1)} KB</TableCell>
                <TableCell>PDF</TableCell>
                <TableCell>
                  <Chip
                    label={doc.status}
                    color={doc.status === 'Approved' ? 'success' : doc.status === 'Active' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(doc.uploadedDate).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  {doc.status !== 'Approved' && (
                    <Button size="small" color="success" onClick={() => handleApproveDoc(doc._id, doc.folderId)}>Approve</Button>
                  )}
                  <Button size="small" onClick={() => handleDownloadDoc(doc._id, doc.originalFileName)}>Download</Button>
                  <Button size="small" color="error" onClick={() => handleDeleteDoc(doc._id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        folderId={currentFolder?._id || null}
        onUploadSuccess={() => loadContents(currentFolder)}
      />

      <Dialog open={newFolderOpen} onClose={() => setNewFolderOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setNewFolderOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained" disabled={!newFolderName.trim()}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Documents;
