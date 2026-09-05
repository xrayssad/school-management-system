import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  Calendar,
  Clock,
  BookOpen,
  AlertCircle
} from 'lucide-react';

const PRIMARY = '#18453B';
const MINT = '#a2f2d5';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
  </div>
);

const Exams = () => {
  const [tabValue, setTabValue] = useState(0);

  const upcomingExams = [
    {
      subject: 'Quran',
      topic: 'Surah Al-Baqarah (Aya 1-50)',
      date: 'Jan 25, 2024',
      time: '08:00 - 10:00',
      type: 'Practical',
      duration: '2 hours',
      room: 'Masjid Kubwa'
    },
    {
      subject: 'Tajweed',
      topic: 'Makharij Al-Huruf & Sifat',
      date: 'Jan 28, 2024',
      time: '09:00 - 10:30',
      type: 'Theory',
      duration: '1.5 hours',
      room: 'Chumba 1'
    },
    {
      subject: 'Hadith',
      topic: '40 Hadith Nawawi (1-20)',
      date: 'Feb 2, 2024',
      time: '10:00 - 11:30',
      type: 'Written',
      duration: '1.5 hours',
      room: 'Chumba 2'
    }
  ];

  const examResults = [
    {
      subject: 'Tahfeedh',
      exam: 'Juz 28 & 29 Revision',
      date: 'Jan 15, 2024',
      marks: '45/50',
      grade: 'A',
      percentage: 90,
      teacher: 'Ustadha Fatima Noor'
    },
    {
      subject: 'Sira',
      exam: 'Life of Prophet Muhammad (SAW)',
      date: 'Jan 10, 2024',
      marks: '38/50',
      grade: 'A-',
      percentage: 76,
      teacher: 'Sheikh Ibrahim Omar'
    },
    {
      subject: 'Fiqh',
      exam: 'Tahara & Salah',
      date: 'Jan 5, 2024',
      marks: '42/50',
      grade: 'A',
      percentage: 84,
      teacher: 'Ustadh Mohammed Hassan'
    }
  ];

  const performanceStats = [
    { label: 'Wastani wa Mitihani', value: '85%' },
    { label: 'Mitihani Iliyokamilika', value: '12' },
    { label: 'Mshindi wa Tuzo', value: '3' },
    { label: 'Mabadiliko ya Hivi Karibuni', value: '+5%' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
          Mitihani na Matokeo
        </Typography>
        <Typography sx={{ fontSize: 15, color: STONE }}>
          Fuata ratiba ya mitihani na angalia matokeo yako
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        {performanceStats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 26, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: 13, color: STONE }}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', mb: 2.5 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          variant="fullWidth"
          sx={{
            borderBottom: `1px solid ${LINE}`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 14,
              color: STONE,
              py: 1.75
            },
            '& .Mui-selected': { color: `${PRIMARY} !important` },
            '& .MuiTabs-indicator': { backgroundColor: PRIMARY, height: 2 }
          }}
        >
          <Tab label="Mitihani Inayokuja" />
          <Tab label="Matokeo ya Zamani" />
          <Tab label="Maagizo" />
        </Tabs>
      </Card>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={2}>
          {upcomingExams.map((exam, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card sx={{ height: '100%', border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
                    {exam.subject}
                  </Typography>
                  <Chip
                    label={exam.type}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: SOFT,
                      color: PRIMARY,
                      border: `1px solid ${LINE}`,
                      borderRadius: 0.5,
                      mb: 1.25
                    }}
                  />
                  <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 1.5 }}>
                    {exam.topic}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: STONE, display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    <Calendar size={14} /> {exam.date}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: STONE, display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    <Clock size={14} /> {exam.time} ({exam.duration})
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: STONE, mb: 1.5 }}>
                    {exam.room}
                  </Typography>
                  <Box
                    sx={{
                      p: 1.25,
                      bgcolor: SOFT,
                      border: `1px solid ${LINE}`,
                      borderRadius: 0.5,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1
                    }}
                  >
                    <AlertCircle size={15} color={PRIMARY} style={{ marginTop: 2, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 12, color: STONE }}>
                      Jihadharie na mada zilizopangwa kwenye mitaala
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Somo', 'Mtihani', 'Tarehe', 'Alama', 'Grade', 'Asilimia'].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        bgcolor: PRIMARY,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 13,
                        border: 0,
                        py: 1.75
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {examResults.map((r, i) => (
                  <TableRow key={i} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{r.subject}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 14 }}>{r.exam}</Typography>
                      <Typography sx={{ fontSize: 12, color: STONE }}>{r.teacher}</Typography>
                    </TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{r.marks}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.grade}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: 12,
                          fontWeight: 600,
                          bgcolor: SOFT,
                          color: PRIMARY,
                          border: `1px solid ${LINE}`,
                          borderRadius: 0.5
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={r.percentage}
                          sx={{
                            flex: 1,
                            height: 5,
                            borderRadius: 1,
                            bgcolor: SOFT,
                            '& .MuiLinearProgress-bar': { bgcolor: PRIMARY, borderRadius: 1 }
                          }}
                        />
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY, minWidth: 36 }}>
                          {r.percentage}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, mb: 1.5 }}>
                  Maagizo ya Kujiandaa
                </Typography>
                <Box component="ul" sx={{ pl: 2.5, m: 0, color: STONE }}>
                  <li><Typography sx={{ fontSize: 14, mb: 0.75 }}>Anza mapema usubuhi baada ya Swala</Typography></li>
                  <li><Typography sx={{ fontSize: 14, mb: 0.75 }}>Rudia mada zote zilizofunzwa</Typography></li>
                  <li><Typography sx={{ fontSize: 14, mb: 0.75 }}>Fanya mazoezi ya kuandika na kusoma</Typography></li>
                  <li><Typography sx={{ fontSize: 14 }}>Omba mwongozo wa Mwenyezi Mungu</Typography></li>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, mb: 1.5 }}>
                  Ratiba ya Kujifunza
                </Typography>
                <Typography sx={{ fontSize: 14, color: STONE, mb: 1 }}>
                  <strong>Asubuhi (6:00 - 8:00):</strong> Tahfeedh na Quran
                </Typography>
                <Typography sx={{ fontSize: 14, color: STONE, mb: 1 }}>
                  <strong>Alasiri (4:00 - 6:00):</strong> Hadith na Fiqh
                </Typography>
                <Typography sx={{ fontSize: 14, color: STONE }}>
                  <strong>Usiku (8:00 - 10:00):</strong> Sira na Tajweed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default Exams;