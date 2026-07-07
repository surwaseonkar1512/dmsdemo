import React, { useState } from 'react';
import { 
  Box, Typography, Button, TextField, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Chip, InputAdornment, Pagination, CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Download, PictureAsPdf } from '@mui/icons-material';
import api from '../services/api';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const handleSearch = async (e?: React.FormEvent, newPage = 1) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { data } = await api.get(`/documents/search?q=${encodeURIComponent(query)}&page=${newPage}&limit=${limit}`);
      setResults(data.data);
      setTotal(data.pages);
      setPage(data.page);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: string, filename: string) => {
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

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Full-Text Search</Typography>
      
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <form onSubmit={handleSearch}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flexGrow: 1, width: '100%' }}>
                <TextField
                  fullWidth
                  placeholder="Search invoices, GST, vendors, amounts, or any text..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2, bgcolor: 'background.default' }
                    }
                  }}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
                <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  size="large"
                  disabled={loading || !query.trim()}
                  sx={{ py: 1.5, minWidth: '120px' }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>File Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Uploader</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((doc) => (
                <TableRow key={doc._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PictureAsPdf color="error" sx={{ mr: 1.5 }} />
                      <Typography sx={{ fontWeight: 500 }}>{doc.originalFileName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(doc.uploadedDate).toLocaleDateString()}</TableCell>
                  <TableCell>{(doc.fileSize / 1024).toFixed(1)} KB</TableCell>
                  <TableCell>
                    <Chip size="small" label={doc.uploadedBy?.name || 'Unknown'} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleDownload(doc._id, doc.originalFileName)}>
                      <Download />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {total > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination count={total} page={page} onChange={(_, p) => handleSearch(undefined, p)} color="primary" />
            </Box>
          )}
        </TableContainer>
      )}

      {!loading && query && results.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" color="text.secondary">No documents found matching "{query}"</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Search;
