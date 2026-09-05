import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton
} from '@mui/material';
import { BookOpen, Users, ChevronDown } from 'lucide-react';

const PRIMARY = '#18453B';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const TeacherSubjects = () => {
  const [expandedSubject, setExpandedSubject] = useState(null);

  const subjectsData = [
    {
      name: 'Quran',
      students: 25,
      class: 'Darasa la 5',
      teacher: 'Sheikh Ahmed Ali',
      studentsList: [
        { id: 'ST001', name: 'Ahmed Mohammed', grade: 'A', phone: '+255 712 345 678' },
        { id: 'ST002', name: 'Fatima Juma', grade: 'B+', phone: '+255 713 456 789' },
        { id: 'ST003', name: 'Omar Said', grade: 'A-', phone: '+255 714 567 890' },
        { id: 'ST004', name: 'Aisha Hassan', grade: 'B', phone: '+255 715 678 901' },
        { id: 'ST005', name: 'Yusuf Abdullah', grade: 'A+', phone: '+255 716 789 012' }
      ]
    },
    {
      name: 'Hadith',
      students: 18,
      class: 'Darasa la 6',
      teacher: 'Sheikh Ahmed Ali',
      studentsList: [
        { id: 'ST006', name: 'Zainab Omar', grade: 'A-', phone: '+255 717 890 123' },
        { id: 'ST007', name: 'Khalid Ibrahim', grade: 'B+', phone: '+255 718 901 234' },
        { id: 'ST008', name: 'Maryam Ali', grade: 'A', phone: '+255 719 012 345' },
        { id: 'ST009', name: 'Hamisi Rajab', grade: 'B-', phone: '+255 720 123 456' },
        { id: 'ST010', name: 'Safia Mohammed', grade: 'B+', phone: '+255 721 234 567' }
      ]
    }
  ];

  const handleExpandClick = (index) => {
    setExpandedSubject(expandedSubject === index ? null : index);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
          Masomo Yangu
        </Typography>
        <Typography sx={{ fontSize: 15, color: STONE }}>
          Dola ya masomo unayoyafundisha na orodha ya wanafunzi
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {subjectsData.map((subject, index) => (
          <Grid item xs={12} key={index}>
            <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: SOFT,
                        color: PRIMARY,
                        width: 48,
                        height: 48,
                        border: `1px solid ${LINE}`
                      }}
                    >
                      <BookOpen size={22} />
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontSize: 18, fontWeight: 600, color: PRIMARY }}>
                        {subject.name}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: STONE }}>
                        {subject.teacher}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={() => handleExpandClick(index)}
                    sx={{
                      color: PRIMARY,
                      transform: expandedSubject === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <ChevronDown size={20} />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Users size={16} color={PRIMARY} />
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: PRIMARY }}>
                      {subject.students}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: STONE }}>Wanafunzi</Typography>
                  </Box>
                  <Chip
                    label={subject.class}
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
                </Box>

                <Collapse in={expandedSubject === index}>
                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${LINE}` }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: PRIMARY, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Users size={16} />
                      Orodha ya Wanafunzi ({subject.studentsList.length})
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: SOFT }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Mwanafunzi</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Simu</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Alama</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {subject.studentsList.map((student) => (
                            <TableRow key={student.id} sx={{ '&:last-child td': { border: 0 } }}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      bgcolor: SOFT,
                                      color: PRIMARY,
                                      fontSize: 11,
                                      fontWeight: 600,
                                      border: `1px solid ${LINE}`
                                    }}
                                  >
                                    {student.name.split(' ').map((n) => n[0]).join('')}
                                  </Avatar>
                                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                                    {student.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontSize: 12, color: STONE }}>{student.id}</TableCell>
                              <TableCell sx={{ fontSize: 12 }}>{student.phone}</TableCell>
                              <TableCell>
                                <Chip
                                  label={student.grade}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    bgcolor: SOFT,
                                    color: PRIMARY,
                                    border: `1px solid ${LINE}`,
                                    borderRadius: 0.5,
                                    minWidth: 36
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TeacherSubjects;