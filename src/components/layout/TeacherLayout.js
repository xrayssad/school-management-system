import React from 'react';
import { Box, Toolbar } from '@mui/material';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';

const drawerWidth = 260;

const TeacherLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <TeacherHeader />
      <TeacherSidebar drawerWidth={drawerWidth} />
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

export default TeacherLayout;