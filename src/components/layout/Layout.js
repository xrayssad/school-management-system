import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const drawerWidth = 240;

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <Header />
      <Sidebar drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;