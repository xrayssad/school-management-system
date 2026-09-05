import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Box
} from '@mui/material';
import {
  Bell,
  Menu as MenuIcon,
  Settings,
  LogOut,
  User,
  Globe
} from 'lucide-react';

const PRIMARY = '#18453B';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const TeacherHeader = ({ onMenuToggle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchorEl(null);
  };

  const notifications = [
    { id: 1, text: 'Kazi mpya imetumwa - Quran Darasa la 5', time: '5 dakika zilizopita' },
    { id: 2, text: 'Majibu 5 yamewasilishwa - Tajweed', time: 'Saa 1 iliyopita' },
    { id: 3, text: 'Mkutano wa walimu kesho', time: 'Saa 2 zilizopita' }
  ];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: PRIMARY,
        borderBottom: `1px solid ${PRIMARY}`
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <IconButton
          edge="start"
          onClick={onMenuToggle}
          sx={{
            mr: 1.5,
            display: { md: 'none' },
            color: '#fff'
          }}
        >
          <MenuIcon size={22} />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              mr: 1.5,
              bgcolor: '#fff',
              color: PRIMARY,
              width: 36,
              height: 36,
              fontSize: 13,
              fontWeight: 600
            }}
          >
            HM
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
              Madrasa Habib el Mustwafa
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', display: { xs: 'none', sm: 'block' } }}>
              Ukurasa wa Mwalimu
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton
          onClick={handleNotificationsMenuOpen}
          sx={{ mr: 0.5, color: '#fff' }}
        >
          <Badge badgeContent={notifications.length} color="error">
            <Bell size={20} />
          </Badge>
        </IconButton>

        <IconButton onClick={handleProfileMenuOpen} sx={{ color: '#fff' }}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: '#fff',
              color: PRIMARY,
              fontSize: 13,
              fontWeight: 600
            }}
          >
            SA
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={notificationsAnchorEl}
          open={Boolean(notificationsAnchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 2,
            sx: {
              mt: 1.5,
              minWidth: 300,
              maxWidth: 360,
              border: `1px solid ${LINE}`,
              borderRadius: 1,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }
          }}
        >
          <MenuItem
            sx={{
              justifyContent: 'space-between',
              borderBottom: `1px solid ${LINE}`,
              py: 1.25
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>
              Arifa ({notifications.length})
            </Typography>
            <Typography sx={{ fontSize: 12, color: PRIMARY, cursor: 'pointer' }}>
              Soma Zote
            </Typography>
          </MenuItem>
          {notifications.map((n) => (
            <MenuItem
              key={n.id}
              onClick={handleMenuClose}
              sx={{
                py: 1.5,
                borderBottom: `1px solid ${LINE}`,
                '&:last-child': { borderBottom: 0 },
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{n.text}</Typography>
              <Typography sx={{ fontSize: 11, color: STONE, mt: 0.25 }}>{n.time}</Typography>
            </MenuItem>
          ))}
        </Menu>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 2,
            sx: {
              mt: 1.5,
              minWidth: 180,
              border: `1px solid ${LINE}`,
              borderRadius: 1,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }
          }}
        >
          <MenuItem onClick={handleMenuClose} sx={{ fontSize: 14, gap: 1.5 }}>
            <User size={16} color={PRIMARY} />
            Wasifu Wangu
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ fontSize: 14, gap: 1.5 }}>
            <Settings size={16} color={PRIMARY} />
            Mipangilio
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ fontSize: 14, gap: 1.5 }}>
            <Globe size={16} color={PRIMARY} />
            Badilisha Lugha
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ fontSize: 14, gap: 1.5, color: '#c62828' }}>
            <LogOut size={16} />
            Toka
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TeacherHeader;