import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar
} from '@mui/material';
import {
  Users,
  BookOpen,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { teachersClasses } from '../data/teachersData';

const PRIMARY = '#18453B';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const TeacherDashboard = () => {
  const teacherName = 'Sheikh Ahmed Ali';
  const teacherData = teachersClasses?.[teacherName];

  const quickStats = [
    { label: 'Wanafunzi', value: teacherData?.students?.length || 0, icon: Users },
    { label: 'Masomo', value: teacherData?.subjects?.length || 0, icon: BookOpen }
  ];

  const todaySchedule = [
    { time: '08:00 - 09:30', subject: 'Quran - Darasa la 5' },
    { time: '10:00 - 11:30', subject: 'Hadith - Darasa la 6' },
    { time: '13:00 - 14:30', subject: 'Tajweed - Darasa la 4' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
          Ukurasa wa Mwalimu
        </Typography>
        <Typography sx={{ fontSize: 15, color: STONE }}>
          Dhibiti masomo yako na wanafunzi wako
        </Typography>
      </Box>

      <Card sx={{ mb: 3, border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: PRIMARY,
                    fontSize: 20,
                    fontWeight: 600
                  }}
                >
                  {teacherName.split(' ').map((n) => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 22, fontWeight: 600, color: PRIMARY }}>
                    {teacherName}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: STONE }}>
                    {teacherData?.subjects?.join(' · ') || 'Quran · Tajweed'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                {quickStats.map((stat, index) => (
                  <Grid item xs={6} key={index}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        bgcolor: SOFT,
                        border: `1px solid ${LINE}`,
                        borderRadius: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                        <stat.icon size={18} color={PRIMARY} />
                        <Typography sx={{ fontSize: 24, fontWeight: 600, color: PRIMARY }}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 13, color: STONE }}>{stat.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone size={16} />
                Mawasiliano
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Phone size={14} color={PRIMARY} />
                <Typography sx={{ fontSize: 13, color: STONE }}>+255 789 012 345</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mail size={14} color={PRIMARY} />
                <Typography sx={{ fontSize: 13, color: STONE }}>
                  {teacherName.split(' ')[0].toLowerCase()}@alhuda.ac.tz
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Calendar size={16} />
                Ratiba ya Leo
              </Typography>
              {todaySchedule.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.25,
                    mb: 1,
                    bgcolor: SOFT,
                    border: `1px solid ${LINE}`,
                    borderRadius: 1,
                    '&:last-child': { mb: 0 }
                  }}
                >
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: PRIMARY, minWidth: 90 }}>
                    {item.time}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: STONE }}>{item.subject}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;