import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { Star, Users, BookOpen, Plus, X } from 'lucide-react';

const PRIMARY = '#18453B';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const TeacherGrades = () => {
  const [selectedSubject, setSelectedSubject] = useState('Quran');
  const [selectedClass, setSelectedClass] = useState('Darasa la 5');
  const [gradeDialog, setGradeDialog] = useState({ open: false, student: null });
  const [studentMarks, setStudentMarks] = useState({});
  const [assignmentType, setAssignmentType] = useState('mazoezi');

  const subjects = [
    { name: 'Quran', classes: ['Darasa la 5', 'Darasa la 6'] },
    { name: 'Tajweed', classes: ['Darasa la 4', 'Darasa la 5'] },
    { name: 'Hadith', classes: ['Darasa la 6'] },
    { name: 'Tahfeedh', classes: ['Darasa la 3', 'Darasa la 4'] }
  ];

  const assignmentTypes = [
    { value: 'mazoezi', label: 'Mazoezi' },
    { value: 'mtihani_mdogo', label: 'Mtihani Mdogo' },
    { value: 'mtihani_mkuu', label: 'Mtihani Mkuu' },
    { value: 'kazi_ya_nyumbani', label: 'Kazi ya Nyumbani' }
  ];

  const studentsData = {
    Quran: {
      'Darasa la 5': [
        { id: 'S001', name: 'Ahmed Mohammed', assignments: 5 },
        { id: 'S002', name: 'Fatima Juma', assignments: 4 },
        { id: 'S004', name: 'Aisha Salim', assignments: 5 }
      ],
      'Darasa la 6': [
        { id: 'S006', name: 'Zainab Omar', assignments: 3 },
        { id: 'S007', name: 'Khalid Ibrahim', assignments: 6 }
      ]
    },
    Tajweed: {
      'Darasa la 4': [
        { id: 'S003', name: 'Omar Hassan', assignments: 6 },
        { id: 'S005', name: 'Yusuf Abdullah', assignments: 3 }
      ],
      'Darasa la 5': [
        { id: 'S001', name: 'Ahmed Mohammed', assignments: 4 },
        { id: 'S002', name: 'Fatima Juma', assignments: 3 }
      ]
    },
    Hadith: {
      'Darasa la 6': [
        { id: 'S006', name: 'Zainab Omar', assignments: 5 },
        { id: 'S007', name: 'Khalid Ibrahim', assignments: 4 }
      ]
    },
    Tahfeedh: {
      'Darasa la 3': [
        { id: 'S008', name: 'Hamisi Rajab', assignments: 2 },
        { id: 'S009', name: 'Safia Mohammed', assignments: 3 }
      ],
      'Darasa la 4': [
        { id: 'S003', name: 'Omar Hassan', assignments: 4 },
        { id: 'S005', name: 'Yusuf Abdullah', assignments: 5 }
      ]
    }
  };

  const getCurrentStudents = () => studentsData[selectedSubject]?.[selectedClass] || [];

  const calculateGrade = (marks) => {
    if (marks >= 90) return 'A';
    if (marks >= 85) return 'A-';
    if (marks >= 80) return 'B+';
    if (marks >= 75) return 'B';
    if (marks >= 70) return 'B-';
    if (marks >= 65) return 'C+';
    if (marks >= 60) return 'C';
    if (marks >= 55) return 'D';
    return 'F';
  };

  const getFilteredClasses = () => {
    const subject = subjects.find((s) => s.name === selectedSubject);
    return subject ? subject.classes : [];
  };

  const handleOpenGradeDialog = (student) => setGradeDialog({ open: true, student });
  const handleCloseGradeDialog = () => setGradeDialog({ open: false, student: null });
  const handleSaveMarks = () => {
    if (gradeDialog.student && studentMarks[gradeDialog.student.id]) handleCloseGradeDialog();
  };
  const handleMarksChange = (studentId, marks) => {
    setStudentMarks((prev) => ({ ...prev, [studentId]: parseInt(marks) || 0 }));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
          Weka Maksi
        </Typography>
        <Typography sx={{ fontSize: 15, color: STONE }}>
          Weka alama za wanafunzi kwa mitihani na kazi
        </Typography>
      </Box>

      <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', mb: 2.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Somo"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  const classes = subjects.find((s) => s.name === e.target.value)?.classes || [];
                  setSelectedClass(classes[0] || '');
                }}
              >
                {subjects.map((s) => (
                  <MenuItem key={s.name} value={s.name}>{s.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Darasa"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {getFilteredClasses().map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Aina ya Kazi"
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value)}
              >
                {assignmentTypes.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Plus size={18} />}
                sx={{
                  bgcolor: PRIMARY,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': { bgcolor: '#0F2F28' }
                }}
              >
                Tuma Kazi Mpya
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
            <Box sx={{ p: 2.5, borderBottom: `1px solid ${LINE}` }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Users size={16} />
                Wanafunzi wa {selectedClass} · {selectedSubject} ({getCurrentStudents().length})
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: SOFT }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Mwanafunzi</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Alama</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Kazi</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Vitendo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getCurrentStudents().map((student) => {
                    const marks = studentMarks[student.id];
                    const grade = marks ? calculateGrade(marks) : '-';
                    return (
                      <TableRow key={student.id} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ p: 0.75, bgcolor: SOFT, border: `1px solid ${LINE}`, borderRadius: 0.5, color: PRIMARY }}>
                              <BookOpen size={14} />
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{student.name}</Typography>
                              <Typography sx={{ fontSize: 11, color: STONE }}>ID: {student.id}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>
                            {marks || 0}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={grade}
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
                        <TableCell sx={{ fontSize: 13 }}>{student.assignments} kazi</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenGradeDialog(student)}
                            sx={{
                              textTransform: 'none',
                              fontSize: 12,
                              borderColor: LINE,
                              color: PRIMARY,
                              '&:hover': { borderColor: PRIMARY, bgcolor: SOFT }
                            }}
                          >
                            Weka Alama
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: PRIMARY, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star size={16} />
                Takwimu
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, bgcolor: SOFT, borderRadius: 1, mb: 1, border: `1px solid ${LINE}` }}>
                <Typography sx={{ fontSize: 13, color: STONE }}>Wanafunzi</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>{getCurrentStudents().length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, bgcolor: SOFT, borderRadius: 1, mb: 1, border: `1px solid ${LINE}` }}>
                <Typography sx={{ fontSize: 13, color: STONE }}>Wastani</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>
                  {getCurrentStudents().length > 0
                    ? Math.round(getCurrentStudents().reduce((s, st) => s + (studentMarks[st.id] || 0), 0) / getCurrentStudents().length)
                    : 0}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, bgcolor: SOFT, borderRadius: 1, border: `1px solid ${LINE}` }}>
                <Typography sx={{ fontSize: 13, color: STONE }}>Wamekamilisha</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>
                  {getCurrentStudents().filter((s) => studentMarks[s.id]).length}/{getCurrentStudents().length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={gradeDialog.open} onClose={handleCloseGradeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${LINE}`, pb: 1.5 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: PRIMARY }}>
            Weka Alama · {gradeDialog.student?.name}
          </Typography>
          <IconButton size="small" onClick={handleCloseGradeDialog}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <TextField
            fullWidth
            label="Alama (0-100)"
            type="number"
            value={studentMarks[gradeDialog.student?.id] || ''}
            onChange={(e) => handleMarksChange(gradeDialog.student?.id, e.target.value)}
            inputProps={{ min: 0, max: 100 }}
            sx={{ mb: 2 }}
          />
          {studentMarks[gradeDialog.student?.id] && (
            <Box sx={{ p: 1.5, bgcolor: SOFT, border: `1px solid ${LINE}`, borderRadius: 1 }}>
              <Typography sx={{ fontSize: 13, color: STONE, mb: 0.5 }}>Grade:</Typography>
              <Chip
                label={calculateGrade(studentMarks[gradeDialog.student?.id])}
                sx={{
                  fontWeight: 600,
                  bgcolor: '#fff',
                  color: PRIMARY,
                  border: `1px solid ${LINE}`,
                  borderRadius: 0.5
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${LINE}` }}>
          <Button onClick={handleCloseGradeDialog} sx={{ textTransform: 'none', color: STONE }}>Ghairi</Button>
          <Button
            variant="contained"
            onClick={handleSaveMarks}
            disabled={!studentMarks[gradeDialog.student?.id]}
            sx={{ textTransform: 'none', bgcolor: PRIMARY, '&:hover': { bgcolor: '#0F2F28' } }}
          >
            Hifadhi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherGrades;