import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Toolbar,
  Box,
  Chip,
  Avatar,
  Typography
} from '@mui/material';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Star,
  FileText,
  School,
  Bell,
  MessageSquare,
  BarChart3,
  User
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const PRIMARY = '#18453B';
const MINT = '#a2f2d5';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const menuItems = [
  { text: 'Dashibodi ya Mwalimu', icon: LayoutDashboard, path: '/teacher/dashboard' },
  { text: 'Wanafunzi Wangu', icon: Users, path: '/teacher/students' },
  { text: 'Masomo Yangu', icon: BookOpen, path: '/teacher/subjects' },
  { text: 'Ratiba Yangu', icon: Calendar, path: '/teacher/schedule' }
];

const gradeItems = [
  { text: 'Weka Maksi', icon: Star, path: '/teacher/grades' },
  { text: 'Kazi na Majibu', icon: FileText, path: '/teacher/assignments' },
  { text: 'Mitihani', icon: School, path: '/teacher/exams' }
];

const communicationItems = [
  { text: 'Matangazo', icon: Bell, path: '/teacher/announcements' },
  { text: 'Ujumbe kwa Wazazi', icon: MessageSquare, path: '/teacher/messages' },
  { text: 'Ripoti za Mwezi', icon: BarChart3, path: '/teacher/reports' }
];

const otherItems = [
  { text: 'Takwimu za Maendeleo', icon: BarChart3, path: '/teacher/analytics' },
  { text: 'Wasifu Wangu', icon: User, path: '/teacher/profile' }
];

const TeacherSidebar = ({ drawerWidth = 260 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const MenuSection = ({ title, items }) => (
    <Box sx={{ mb: 2 }}>
      <Typography
        sx={{
          px: 2,
          py: 0.75,
          fontSize: 11,
          fontWeight: 600,
          color: PRIMARY,
          letterSpacing: '0.04em'
        }}
      >
        {title}
      </Typography>
      <List dense disablePadding>
        {items.map((item) => {
          const selected = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1, mb: 0.25 }}>
              <ListItemButton
                selected={selected}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1,
                  py: 1,
                  '&.Mui-selected': {
                    bgcolor: PRIMARY,
                    color: '#fff',
                    '&:hover': { bgcolor: '#0F2F28' },
                    '& .MuiListItemIcon-root': { color: '#fff' }
                  },
                  '&:hover': { bgcolor: SOFT }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: selected ? '#fff' : PRIMARY }}>
                  <Icon size={17} />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

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
            SA
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: PRIMARY }}>
              Sheikh Ahmed Ali
            </Typography>
            <Typography sx={{ fontSize: 12, color: STONE }}>
              Mwalimu wa Quran na Tajweed
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="Wanafunzi: 15"
            size="small"
            sx={{
              height: 24,
              fontSize: 11,
              fontWeight: 500,
              bgcolor: '#fff',
              color: PRIMARY,
              border: `1px solid ${LINE}`,
              borderRadius: 0.5
            }}
          />
          <Chip
            label="Masomo: 2"
            size="small"
            sx={{
              height: 24,
              fontSize: 11,
              fontWeight: 500,
              bgcolor: '#fff',
              color: PRIMARY,
              border: `1px solid ${LINE}`,
              borderRadius: 0.5
            }}
          />
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', py: 1.5, flexGrow: 1 }}>
        <MenuSection title="MSINGI" items={menuItems} />
        <Divider sx={{ mx: 2, my: 1, borderColor: LINE }} />
        <MenuSection title="USIMAMIZI WA MAKSI" items={gradeItems} />
        <Divider sx={{ mx: 2, my: 1, borderColor: LINE }} />
        <MenuSection title="MAWASILIANO" items={communicationItems} />
        <Divider sx={{ mx: 2, my: 1, borderColor: LINE }} />
        <MenuSection title="ZAIDI" items={otherItems} />
      </Box>

      <Box sx={{ p: 2, borderTop: `1px solid ${LINE}`, bgcolor: SOFT }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: PRIMARY, mb: 1 }}>
          TAKWIMU ZA LEO
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>92%</Typography>
            <Typography sx={{ fontSize: 11, color: STONE }}>Hudhurio</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>5/8</Typography>
            <Typography sx={{ fontSize: 11, color: STONE }}>Kazi</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>15</Typography>
            <Typography sx={{ fontSize: 11, color: STONE }}>Wanafunzi</Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default TeacherSidebar;