import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Calendar, Clock, BookOpen, Users } from 'lucide-react';

const PRIMARY = '#18453B';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const TeacherSchedule = () => {
  const [selectedDay, setSelectedDay] = useState(0);

  const weeklySchedule = [
    {
      day: 'Jumatatu',
      date: 'Jan 15',
      classes: [
        { time: '08:00 - 09:30', subject: 'Quran', class: 'Darasa la 5', room: 'Chumba 101', type: 'Somo la Kawaida' },
        { time: '10:00 - 11:30', subject: 'Hadith', class: 'Darasa la 6', room: 'Chumba 102', type: 'Somo la Kawaida' },
        { time: '14:00 - 15:30', subject: 'Tajweed', class: 'Darasa la 4', room: 'Chumba 103', type: 'Mazoezi' }
      ]
    },
    {
      day: 'Jumanne',
      date: 'Jan 16',
      classes: [
        { time: '08:00 - 09:30', subject: 'Quran', class: 'Darasa la 5', room: 'Chumba 101', type: 'Somo la Kawaida' },
        { time: '11:00 - 12:30', subject: 'Tahfeedh', class: 'Darasa la 3', room: 'Chumba 104', type: 'Somo la Kikamilifu' },
        { time: '15:00 - 16:30', subject: 'Hadith', class: 'Darasa la 6', room: 'Chumba 102', type: 'Majadiliano' }
      ]
    },
    {
      day: 'Jumatano',
      date: 'Jan 17',
      classes: [
        { time: '09:00 - 10:30', subject: 'Tajweed', class: 'Darasa la 5', room: 'Chumba 103', type: 'Mazoezi' },
        { time: '13:00 - 14:30', subject: 'Quran', class: 'Darasa la 4', room: 'Chumba 101', type: 'Somo la Kawaida' },
        { time: '16:00 - 17:30', subject: 'Tahfeedh', class: 'Darasa la 3', room: 'Chumba 104', type: 'Uhakiki' }
      ]
    },
    {
      day: 'Alhamisi',
      date: 'Jan 18',
      classes: [
        { time: '08:30 - 10:00', subject: 'Hadith', class: 'Darasa la 6', room: 'Chumba 102', type: 'Majadiliano' },
        { time: '11:30 - 13:00', subject: 'Quran', class: 'Darasa la 5', room: 'Chumba 101', type: 'Mtihani Mdogo' },
        { time: '14:30 - 16:00', subject: 'Tajweed', class: 'Darasa la 4', room: 'Chumba 103', type: 'Mazoezi' }
      ]
    },
    {
      day: 'Ijumaa',
      date: 'Jan 19',
      classes: [
        { time: '08:00 - 09:30', subject: 'Tahfeedh', class: 'Darasa la 3', room: 'Chumba 104', type: 'Somo la Kikamilifu' },
        { time: '10:00 - 11:30', subject: 'Hadith', class: 'Darasa la 6', room: 'Chumba 102', type: 'Somo la Kawaida' },
        { time: '13:30 - 15:00', subject: 'Quran', class: 'Darasa la 5', room: 'Chumba 101', type: 'Tathmini' }
      ]
    }
  ];

  const quickStats = [
    { label: 'Masomo Kwa Wiki', value: '15' },
    { label: 'Madarasa', value: '4' },
    { label: 'Saa za Kufundisha', value: '22.5' },
    { label: 'Masomo Mbalimbali', value: '4' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
          Ratiba Ya Wiki
        </Typography>
        <Typography sx={{ fontSize: 15, color: STONE }}>
          Mpango wako wa kufundisha kwa wiki nzima
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {quickStats.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 22, fontWeight: 600, color: PRIMARY }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: 12, color: STONE }}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', mb: 2.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar size={16} />
            Chagua Siku ya Wiki
          </Typography>
          <Grid container spacing={1}>
            {weeklySchedule.map((day, index) => (
              <Grid item xs={6} sm={2.4} key={index}>
                <Box
                  onClick={() => setSelectedDay(index)}
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: selectedDay === index ? PRIMARY : SOFT,
                    color: selectedDay === index ? '#fff' : PRIMARY,
                    border: `1px solid ${selectedDay === index ? PRIMARY : LINE}`
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{day.day}</Typography>
                  <Typography sx={{ fontSize: 11, opacity: 0.85 }}>{day.date}</Typography>
                  <Typography sx={{ fontSize: 11, mt: 0.5 }}>
                    Masomo: {day.classes.length}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', mb: 2.5 }}>
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${LINE}` }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: PRIMARY, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Clock size={18} />
            Ratiba ya {weeklySchedule[selectedDay].day} · {weeklySchedule[selectedDay].date}
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: SOFT }}>
                <TableCell sx={{ fontWeight: 600, fontSize: 13, color: PRIMARY }}>Muda</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 13, color: PRIMARY }}>Somo</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 13, color: PRIMARY }}>Darasa</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 13, color: PRIMARY }}>Chumba</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 13, color: PRIMARY }}>Aina</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {weeklySchedule[selectedDay].classes.map((item, index) => (
                <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell sx={{ fontSize: 13 }}>{item.time}</TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>{item.subject}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.class}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: 11,
                        fontWeight: 500,
                        bgcolor: SOFT,
                        color: PRIMARY,
                        border: `1px solid ${LINE}`,
                        borderRadius: 0.5
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{item.room}</TableCell>
                  <TableCell sx={{ fontSize: 13, color: STONE }}>{item.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <BookOpen size={16} />
            Muhtasari wa Wiki
          </Typography>
          <Grid container spacing={1.5}>
            {weeklySchedule.map((day, index) => (
              <Grid item xs={6} md={2.4} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: SOFT,
                    border: `1px solid ${LINE}`
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>{day.day}</Typography>
                  <Typography sx={{ fontSize: 11, color: STONE }}>{day.date}</Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 600, color: PRIMARY, mt: 0.5 }}>
                    {day.classes.length}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: STONE }}>Masomo</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeacherSchedule;