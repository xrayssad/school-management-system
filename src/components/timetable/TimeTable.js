import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip
} from '@mui/material';
import { Calendar, Clock, BookOpen, Users } from 'lucide-react';
import { weeklyTimetable, madrasaSubjects } from '../../data/madrasaData';

const PRIMARY = '#18453B';
const MINT = '#a2f2d5';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const TimeTable = () => {
  const days = [
    { name: 'Jumatatu', date: 'Jan 15' },
    { name: 'Jumanne', date: 'Jan 16' },
    { name: 'Jumatano', date: 'Jan 17' },
    { name: 'Alhamisi', date: 'Jan 18' },
    { name: 'Ijumaa', date: 'Jan 19' }
  ];

  const periodTimes = [
    '08:00 - 09:00',
    '09:15 - 10:15',
    '10:30 - 11:30',
    '11:45 - 12:00',
    '12:00 - 13:00'
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
          Ratiba ya Wiki
        </Typography>
        <Typography sx={{ fontSize: 15, color: STONE }}>
          Masomo ya Quran, Hadith, na Dini kwa wiki hii
        </Typography>
      </Box>

      <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', mb: 2.5, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 780 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    bgcolor: PRIMARY,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 13,
                    width: 130,
                    border: 0,
                    py: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock size={16} />
                    Muda
                  </Box>
                </TableCell>
                {days.map((day) => (
                  <TableCell
                    key={day.name}
                    align="center"
                    sx={{
                      bgcolor: PRIMARY,
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 13,
                      border: 0,
                      py: 2
                    }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{day.name}</Typography>
                    <Typography sx={{ fontSize: 12, opacity: 0.85 }}>{day.date}</Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {periodTimes.map((time, periodIndex) => (
                <TableRow key={periodIndex}>
                  <TableCell
                    sx={{
                      bgcolor: SOFT,
                      borderBottom: `1px solid ${LINE}`,
                      py: 2,
                      verticalAlign: 'middle'
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY, textAlign: 'center' }}>
                      Kipindi {periodIndex + 1}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: STONE, textAlign: 'center' }}>
                      {time}
                    </Typography>
                  </TableCell>
                  {days.map((day) => {
                    const dayKey = day.name.split(' ')[0];
                    const daySchedule = weeklyTimetable?.[dayKey];
                    const classData = daySchedule ? daySchedule[periodIndex] : null;

                    if (!classData) {
                      return (
                        <TableCell
                          key={day.name}
                          align="center"
                          sx={{ borderBottom: `1px solid ${LINE}`, py: 1.5 }}
                        >
                          <Typography sx={{ fontSize: 12, color: STONE }}>
                            Hakuna Somo
                          </Typography>
                        </TableCell>
                      );
                    }

                    if (classData.type === 'break') {
                      return (
                        <TableCell
                          key={day.name}
                          align="center"
                          sx={{ borderBottom: `1px solid ${LINE}`, py: 1.5 }}
                        >
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: SOFT,
                              border: `1px solid ${LINE}`,
                              borderRadius: 1,
                              minHeight: 72,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: PRIMARY }}>
                              PUMZIKA
                            </Typography>
                          </Box>
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell
                        key={day.name}
                        align="center"
                        sx={{ borderBottom: `1px solid ${LINE}`, py: 1.5 }}
                      >
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: '#fff',
                            border: `1px solid ${LINE}`,
                            borderRadius: 1,
                            minHeight: 72,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>
                            {classData.subject}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: STONE, mt: 0.5 }}>
                            {classData.teacher}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: STONE }}>
                            {classData.room}
                          </Typography>
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', mb: 2.5 }}>
        <CardContent sx={{ py: 2, px: 2.5 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <BookOpen size={18} />
            Aina za Masomo
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(madrasaSubjects || {}).map(([subject, data]) => (
              <Chip
                key={subject}
                label={subject}
                size="small"
                sx={{
                  height: 26,
                  fontSize: 12,
                  fontWeight: 500,
                  bgcolor: SOFT,
                  color: PRIMARY,
                  border: `1px solid ${LINE}`,
                  borderRadius: 0.5
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', bgcolor: SOFT }}>
        <CardContent sx={{ py: 2.5, px: 2.5, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, mb: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Users size={18} />
            Ukumbusho wa Ijumaa
          </Typography>
          <Typography sx={{ fontSize: 14, color: STONE }}>
            Ijumaa ni siku muhimu. Masomo yanaanza baada ya Swala ya Ijumaa.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TimeTable;