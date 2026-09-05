import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Box,
  InputBase
} from '@mui/material';
import {
  Bell,
  User,
  Search,
  Menu as MenuIcon,
  LogOut,
  Settings
} from 'lucide-react';

const PRIMARY = '#18453B';
const MINT = '#a2f2d5';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const Header = ({ onMenuToggle }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: '#fff',
        borderBottom: `1px solid ${LINE}`,
        color: PRIMARY
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <IconButton
          edge="start"
          onClick={onMenuToggle}
          sx={{
            mr: 1.5,
            display: { md: 'none' },
            color: PRIMARY
          }}
        >
          <MenuIcon size={22} />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Avatar
            sx={{
              mr: 1.5,
              bgcolor: PRIMARY,
              width: 36,
              height: 36,
              fontSize: 14,
              fontWeight: 600
            }}
          >
            HM
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, lineHeight: 1.2 }}>
              Madrasa Habib el Mustwafa
            </Typography>
            <Typography sx={{ fontSize: 11, color: STONE, display: { xs: 'none', sm: 'block' } }}>
              Mfumo wa Usimamizi
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexGrow: 1,
            maxWidth: 360,
            alignItems: 'center',
            bgcolor: SOFT,
            border: `1px solid ${LINE}`,
            borderRadius: 1,
            px: 1.5,
            py: 0.5,
            mr: 2
          }}
        >
          <Search size={18} color={PRIMARY} style={{ marginRight: 8 }} />
          <InputBase
            placeholder="Tafuta..."
            sx={{
              flex: 1,
              fontSize: 14,
              color: PRIMARY,
              '& input::placeholder': { color: STONE, opacity: 1 }
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton sx={{ mr: 0.5, color: PRIMARY }}>
          <Badge badgeContent={4} color="error">
            <Bell size={20} />
          </Badge>
        </IconButton>

        <IconButton onClick={handleProfileMenuOpen} sx={{ color: PRIMARY }}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: PRIMARY,
              fontSize: 13,
              fontWeight: 600
            }}
          >
            AM
          </Avatar>
        </IconButton>

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
          <MenuItem onClick={handleMenuClose} sx={{ fontSize: 14, gap: 1.5, color: '#c62828' }}>
            <LogOut size={16} />
            Toka
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;