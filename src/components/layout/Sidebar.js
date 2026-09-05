import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Toolbar,
  Box,
  Avatar,
  Typography,
  Divider
} from '@mui/material';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CalendarDays,
  Users,
  User
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const PRIMARY = '#18453B';
const MINT = '#a2f2d5';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const menuItems = [
  { text: 'Dashibodi', icon: LayoutDashboard, path: '/' },
  { text: 'Ratiba ya Masomo', icon: Calendar, path: '/timetable' },
  { text: 'Mitihani', icon: FileText, path: '/exams' },
  { text: 'Matukio', icon: CalendarDays, path: '/events' },
  { text: 'Waalimu', icon: Users, path: '/teachers' },
  { text: 'Wasifu Wangu', icon: User, path: '/profile' }
];

const Sidebar = ({ drawerWidth = 240 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#fff',
          borderRight: `1px solid ${LINE}`
        }
      }}
    >
      <Toolbar />

      <Box sx={{ p: 2, borderBottom: `1px solid ${LINE}`, bgcolor: SOFT }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              mr: 1.5,
              bgcolor: PRIMARY,
              fontSize: 14,
              fontWeight: 600
            }}
          >
            AM
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: PRIMARY }}>
              Ahmed Mohammed
            </Typography>
            <Typography sx={{ fontSize: 12, color: STONE }}>
              Darasa la 5 · ID: ST001
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>95%</Typography>
            <Typography sx={{ fontSize: 11, color: STONE }}>Hudhurio</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>A-</Typography>
            <Typography sx={{ fontSize: 11, color: STONE }}>Wastani</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>12</Typography>
            <Typography sx={{ fontSize: 11, color: STONE }}>Kazi</Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ py: 1, px: 1 }}>
        {menuItems.map((item) => {
          const selected = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selected}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1,
                  py: 1.25,
                  '&.Mui-selected': {
                    bgcolor: PRIMARY,
                    color: '#fff',
                    '&:hover': { bgcolor: '#0F2F28' },
                    '& .MuiListItemIcon-root': { color: '#fff' }
                  },
                  '&:hover': {
                    bgcolor: SOFT
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: selected ? '#fff' : PRIMARY
                  }}
                >
                  <Icon size={18} />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: 600
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 2, borderTop: `1px solid ${LINE}`, bgcolor: SOFT }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: PRIMARY, mb: 1 }}>
          MABADILIKO YA LEO
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>2</Typography>
            <Typography sx={{ fontSize: 11, color: STONE }}>Masomo</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>1</Typography>
            <Typography sx={{ fontSize: 11, color: STONE }}>Kazi Mpya</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>0</Typography>
            <Typography sx={{ fontSize: 11, color: STONE }}>Mitihani</Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;