import { useState, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Search from './pages/Search';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const { isAuthenticated } = useAuth();

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <MainLayout toggleTheme={toggleTheme} mode={mode} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<Documents />} />
          <Route path="search" element={<Search />} />
          {/* other pages like Users, Folders, Settings can go here */}
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
