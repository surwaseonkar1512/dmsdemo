import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Divider, List, ListItem, ListItemText } from '@mui/material';
import { Description, Folder, People, Storage } from '@mui/icons-material';
import api from '../services/api';

interface Stats {
  totalDocuments: number;
  folderCount: number;
  userCount: number;
  storageUsed: number;
  todaysUploads: number;
  recentUploads: any[];
}

const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ position: 'absolute', top: -15, right: -15, opacity: 0.1, transform: 'scale(3)' }}>
      {React.cloneElement(icon as React.ReactElement<any>, { sx: { color, fontSize: 100 } })}
    </Box>
    <CardContent sx={{ flexGrow: 1, zIndex: 1 }}>
      <Typography color="text.secondary" gutterBottom variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
        {title}
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 'bold' }} color="text.primary">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>;
  if (!stats) return <Typography>Error loading dashboard.</Typography>;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Dashboard Overview</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Documents" value={stats.totalDocuments} icon={<Description />} color="#4361ee" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Folders" value={stats.folderCount} icon={<Folder />} color="#f72585" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Active Users" value={stats.userCount} icon={<People />} color="#3f37c9" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Storage Used" value={formatBytes(stats.storageUsed)} icon={<Storage />} color="#4cc9f0" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Recent Uploads</Typography>
              <Divider sx={{ mb: 2 }} />
              {stats.recentUploads.length === 0 ? (
                <Typography color="text.secondary">No recent uploads.</Typography>
              ) : (
                <List disablePadding>
                  {stats.recentUploads.map((doc, idx) => (
                    <React.Fragment key={doc._id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <Box sx={{ mr: 2, mt: 1, color: 'error.main' }}><Description /></Box>
                        <ListItemText
                          primary={<Typography sx={{ fontWeight: 600 }}>{doc.originalFileName}</Typography>}
                          secondary={`Uploaded by ${doc.uploadedBy?.name} on ${new Date(doc.uploadedDate).toLocaleDateString()}`}
                        />
                      </ListItem>
                      {idx < stats.recentUploads.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Activity Today</Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h2" sx={{ fontWeight: 'bold', mr: 1 }}>{stats.todaysUploads}</Typography>
                <Typography variant="subtitle1">new documents</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
