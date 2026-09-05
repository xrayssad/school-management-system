import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  LinearProgress
} from '@mui/material';
import {
  User,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Edit3,
  BookOpen,
  Award,
  Target
} from 'lucide-react';
import { madrasaSubjects, studentProgress } from '../data/madrasaData';

const PRIMARY = '#18453B';
const MINT = '#a2f2d5';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const Profile = () => {
  const studentInfo = {
    name: 'Ahmed Mohammed',
    studentId: 'MAD-2024-001',
    grade: 'Darasa la 5 - Tahfeedh',
    age: '12 years',
    joinDate: 'January 15, 2022',
    phone: '+255 789 012 345',
    email: 'ahmed.m@alhuda.ac.tz',
    address: 'Sinza, Dar es Salaam',
    parentName: 'Mohammed Juma',
    parentPhone: '+255 713 456 789',
    teacher: 'Sheikh Ahmed Ali',
    class: 'Quran & Tajweed Advanced'
  };

  const academicStats = [
    { label: 'Juz Zilizokaririwa', value: '12/30', progress: 40, icon: BookOpen },
    { label: 'Hadith Zilizojifunza', value: '25/40', progress: 62, icon: Target },
    { label: 'Wastani wa Mitihani', value: '85%', progress: 85, icon: GraduationCap },
    { label: 'Ukadiriaji wa Hudhurio', value: '94%', progress: 94, icon: Calendar }
  ];

  const achievements = [
    { title: 'Mshindi wa Tahfeedh', description: 'Alimaliza Juz 30 kwa rekodi', date: 'Dec 2023', type: 'academic' },
    { title: 'Bingwa wa Hadith', description: 'Alihifadhi Hadith 40 za Nawawi', date: 'Nov 2023', type: 'academic' },
    { title: 'Mtulivu wa Kelasi', description: 'Hudhurio kamili kwa mwaka mzima', date: 'Jan 2024', type: 'behavior' },
    { title: 'Msaada wa Kijamii', description: 'Kuhudumia jamii ya Madrasa', date: 'Oct 2023', type: 'social' }
  ];

  const typeLabel = {
    academic: 'Kielimu',
    behavior: 'Tabia',
    social: 'Kijamii'
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
          Wasifu wa Mwanafunzi
        </Typography>
        <Typography sx={{ fontSize: 15, color: STONE }}>
          Taarifa binafsi na maendeleo ya kielimu
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={4}>
          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: PRIMARY,
                  fontSize: '2rem',
                  fontWeight: 600
                }}
              >
                AM
              </Avatar>

              <Typography sx={{ fontSize: 20, fontWeight: 600, color: PRIMARY, mb: 0.75 }}>
                {studentInfo.name}
              </Typography>

              <Chip
                label={studentInfo.studentId}
                size="small"
                sx={{
                  height: 24,
                  fontSize: 12,
                  fontWeight: 500,
                  bgcolor: SOFT,
                  color: PRIMARY,
                  border: `1px solid ${LINE}`,
                  borderRadius: 0.5,
                  mb: 1.5
                }}
              />

              <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY }}>
                {studentInfo.grade}
              </Typography>
              <Typography sx={{ fontSize: 13, color: STONE, mb: 2 }}>
                {studentInfo.class}
              </Typography>

              <Button
                variant="outlined"
                startIcon={<Edit3 size={16} />}
                sx={{
                  borderColor: LINE,
                  color: PRIMARY,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 1,
                  '&:hover': {
                    borderColor: PRIMARY,
                    bgcolor: SOFT
                  }
                }}
              >
                Badilisha Taarifa
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2.5, border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone size={16} />
                Mawasiliano
              </Typography>

              <List dense disablePadding>
                <ListItem sx={{ px: 0, py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Phone size={15} color={PRIMARY} />
                  </ListItemIcon>
                  <ListItemText
                    primary={studentInfo.phone}
                    secondary="Namba ya Simu"
                    primaryTypographyProps={{ fontSize: 14 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Mail size={15} color={PRIMARY} />
                  </ListItemIcon>
                  <ListItemText
                    primary={studentInfo.email}
                    secondary="Barua Pepe"
                    primaryTypographyProps={{ fontSize: 14 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <MapPin size={15} color={PRIMARY} />
                  </ListItemIcon>
                  <ListItemText
                    primary={studentInfo.address}
                    secondary="Anuani"
                    primaryTypographyProps={{ fontSize: 14 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 1.75, borderColor: LINE }} />

              <Typography sx={{ fontSize: 14, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
                Mzazi / Walezi
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                {studentInfo.parentName}
              </Typography>
              <Typography sx={{ fontSize: 13, color: STONE }}>
                {studentInfo.parentPhone}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', mb: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <GraduationCap size={16} />
                Takwimu za Kielimu
              </Typography>

              <Grid container spacing={2}>
                {academicStats.map((stat, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        border: `1px solid ${LINE}`,
                        borderRadius: 1,
                        bgcolor: '#fff'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: SOFT,
                            border: `1px solid ${LINE}`,
                            borderRadius: 1,
                            color: PRIMARY
                          }}
                        >
                          <stat.icon size={18} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: 12, color: STONE }}>
                            {stat.label}
                          </Typography>
                          <Typography sx={{ fontSize: 18, fontWeight: 600, color: PRIMARY }}>
                            {stat.value}
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={stat.progress}
                        sx={{
                          height: 5,
                          borderRadius: 1,
                          bgcolor: SOFT,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: PRIMARY,
                            borderRadius: 1
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', mb: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BookOpen size={16} />
                Maendeleo ya Masomo
              </Typography>

              <Grid container spacing={2}>
                {Object.entries(studentProgress || {}).map(([subject, data]) => (
                  <Grid item xs={12} sm={6} md={4} key={subject}>
                    <Box
                      sx={{
                        p: 2,
                        border: `1px solid ${LINE}`,
                        borderRadius: 1,
                        bgcolor: '#fff',
                        textAlign: 'center'
                      }}
                    >
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: PRIMARY }}>
                        {subject}
                      </Typography>
                      <Typography sx={{ fontSize: 20, fontWeight: 600, my: 0.75 }}>
                        {data.grade}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: STONE, mb: 1.25 }}>
                        {data.marks}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={data.progress}
                        sx={{
                          height: 5,
                          borderRadius: 1,
                          bgcolor: SOFT,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: PRIMARY,
                            borderRadius: 1
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Award size={16} />
                Mafanikio na Tuzo
              </Typography>

              <Grid container spacing={2}>
                {achievements.map((item, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        border: `1px solid ${LINE}`,
                        borderRadius: 1,
                        bgcolor: '#fff'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                        <Chip
                          label={typeLabel[item.type]}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: 11,
                            fontWeight: 500,
                            bgcolor: SOFT,
                            color: PRIMARY,
                            border: `1px solid ${LINE}`,
                            borderRadius: 0.5
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: 13, color: STONE, mb: 0.75 }}>
                        {item.description}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: STONE, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Calendar size={12} />
                        {item.date}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;