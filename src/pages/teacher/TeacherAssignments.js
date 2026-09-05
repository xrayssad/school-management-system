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
  Tabs,
  Tab,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar
} from '@mui/material';
import { FileText, Users, Plus, Eye, Download, Send, X, Clock, CheckCircle } from 'lucide-react';

const PRIMARY = '#18453B';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const TeacherAssignments = () => {
  const [selectedSubject, setSelectedSubject] = useState('Quran');
  const [selectedClass, setSelectedClass] = useState('Darasa la 5');
  const [activeTab, setActiveTab] = useState(0);
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [gradeDialog, setGradeDialog] = useState({ open: false, submission: null });
  const [newAssignment, setNewAssignment] = useState({ title: '', subject: '', class: '', type: 'mazoezi', dueDate: '', instructions: '' });
  const [grades, setGrades] = useState({});

  const subjects = [
    { name: 'Quran', classes: ['Darasa la 5', 'Darasa la 6'] },
    { name: 'Tajweed', classes: ['Darasa la 4', 'Darasa la 5'] },
    { name: 'Hadith', classes: ['Darasa la 6'] }
  ];

  const assignmentTypes = [
    { value: 'mazoezi', label: 'Mazoezi' },
    { value: 'kazi_nyumbani', label: 'Kazi ya Nyumbani' },
    { value: 'mtihani_mdogo', label: 'Mtihani Mdogo' }
  ];

  const assignments = [
    { id: 'A001', title: 'Sura Al-Fatiha - Kusahihisha', subject: 'Quran', class: 'Darasa la 5', type: 'mazoezi', dueDate: '2024-02-15', totalStudents: 25, submitted: 18, status: 'active' },
    { id: 'A002', title: 'Sifa za Huruf - Tajweed', subject: 'Tajweed', class: 'Darasa la 4', type: 'kazi_nyumbani', dueDate: '2024-02-20', totalStudents: 20, submitted: 15, status: 'active' },
    { id: 'A003', title: 'Hadith za Neema - Ufafanuzi', subject: 'Hadith', class: 'Darasa la 6', type: 'mtihani_mdogo', dueDate: '2024-02-10', totalStudents: 18, submitted: 18, status: 'graded' }
  ];

  const submissions = [
    { id: 'S001', studentName: 'Ahmed Mohammed', studentId: 'ST001', class: 'Darasa la 5', submitDate: '2024-02-14', file: 'ahmed_fatiha.pdf', status: 'submitted', grade: null },
    { id: 'S002', studentName: 'Fatima Juma', studentId: 'ST002', class: 'Darasa la 5', submitDate: '2024-02-13', file: 'fatima_fatiha.docx', status: 'graded', grade: 'A' },
    { id: 'S003', studentName: 'Aisha Salim', studentId: 'ST004', class: 'Darasa la 5', submitDate: '2024-02-14', file: 'aisha_fatiha.pdf', status: 'submitted', grade: null }
  ];

  const getFilteredClasses = () => subjects.find((s) => s.name === selectedSubject)?.classes || [];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
          Kazi na Majibu
        </Typography>
        <Typography sx={{ fontSize: 15, color: STONE }}>
          Tuma kazi mpya na usimamize majibu ya wanafunzi
        </Typography>
      </Box>

      <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', mb: 2.5 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            borderBottom: `1px solid ${LINE}`,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, color: STONE, '&.Mui-selected': { color: PRIMARY } },
            '& .MuiTabs-indicator': { bgcolor: PRIMARY }
          }}
        >
          <Tab label="Kazi Zote" />
          <Tab label="Majibu ya Wanafunzi" />
        </Tabs>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField select fullWidth size="small" label="Somo" value={selectedSubject}
                onChange={(e) => { setSelectedSubject(e.target.value); setSelectedClass(subjects.find((s) => s.name === e.target.value)?.classes[0] || ''); }}>
                {subjects.map((s) => <MenuItem key={s.name} value={s.name}>{s.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth size="small" label="Darasa" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                {getFilteredClasses().map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button fullWidth variant="contained" startIcon={<Plus size={18} />} onClick={() => setAssignmentDialog(true)}
                sx={{ textTransform: 'none', bgcolor: PRIMARY, '&:hover': { bgcolor: '#0F2F28' } }}>
                Tuma Kazi Mpya
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {activeTab === 0 && (
        <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
          <Box sx={{ p: 2.5, borderBottom: `1px solid ${LINE}` }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileText size={16} /> Kazi Zilizotumwa ({assignments.length})
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: SOFT }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Kazi</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Somo</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Aina</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Mwisho</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Wasilisho</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Hali</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{a.title}</Typography>
                      <Typography sx={{ fontSize: 11, color: STONE }}>ID: {a.id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13 }}>{a.subject}</Typography>
                      <Typography sx={{ fontSize: 11, color: STONE }}>{a.class}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={assignmentTypes.find((t) => t.value === a.type)?.label} size="small"
                        sx={{ height: 22, fontSize: 11, bgcolor: SOFT, color: PRIMARY, border: `1px solid ${LINE}`, borderRadius: 0.5 }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{a.dueDate}</TableCell>
                    <TableCell>
                      <LinearProgress variant="determinate" value={(a.submitted / a.totalStudents) * 100}
                        sx={{ height: 5, borderRadius: 1, bgcolor: SOFT, mb: 0.5, '& .MuiLinearProgress-bar': { bgcolor: PRIMARY } }} />
                      <Typography sx={{ fontSize: 11, color: STONE }}>{a.submitted}/{a.totalStudents}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={a.status === 'active' ? 'Inaendelea' : 'Imeisha'} size="small"
                        sx={{ height: 22, fontSize: 11, bgcolor: SOFT, color: PRIMARY, border: `1px solid ${LINE}`, borderRadius: 0.5 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {activeTab === 1 && (
        <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
          <Box sx={{ p: 2.5, borderBottom: `1px solid ${LINE}` }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Users size={16} /> Majibu ({submissions.length})
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: SOFT }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Mwanafunzi</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Tarehe</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Faili</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Hali</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Alama</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Vitendo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((s) => (
                  <TableRow key={s.id} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: SOFT, color: PRIMARY, fontSize: 11, fontWeight: 600, border: `1px solid ${LINE}` }}>
                          {s.studentName.split(' ').map((n) => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{s.studentName}</Typography>
                          <Typography sx={{ fontSize: 11, color: STONE }}>{s.class}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{s.submitDate}</TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<Download size={14} />} sx={{ textTransform: 'none', color: PRIMARY, fontSize: 12 }}>
                        Pakua
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={s.status === 'graded' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        label={s.status === 'graded' ? 'Imeangaliwa' : 'Inasubiri'}
                        size="small"
                        sx={{ height: 22, fontSize: 11, bgcolor: SOFT, color: PRIMARY, border: `1px solid ${LINE}`, borderRadius: 0.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      {s.grade ? (
                        <Chip label={s.grade} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: SOFT, color: PRIMARY, border: `1px solid ${LINE}`, borderRadius: 0.5 }} />
                      ) : (
                        <Typography sx={{ fontSize: 13, color: STONE }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => setGradeDialog({ open: true, submission: s })} sx={{ color: PRIMARY }}>
                        <Eye size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog open={assignmentDialog} onClose={() => setAssignmentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${LINE}`, pb: 1.5 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: PRIMARY }}>Tuma Kazi Mpya</Typography>
          <IconButton size="small" onClick={() => setAssignmentDialog(false)}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Kichwa cha Kazi" value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Somo" value={newAssignment.subject}
                onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}>
                {subjects.map((s) => <MenuItem key={s.name} value={s.name}>{s.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Darasa" value={newAssignment.class}
                onChange={(e) => setNewAssignment({ ...newAssignment, class: e.target.value })}>
                {getFilteredClasses().map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Aina" value={newAssignment.type}
                onChange={(e) => setNewAssignment({ ...newAssignment, type: e.target.value })}>
                {assignmentTypes.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Tarehe ya Mwisho" type="date" value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Maelekezo" value={newAssignment.instructions}
                onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${LINE}` }}>
          <Button onClick={() => setAssignmentDialog(false)} sx={{ textTransform: 'none', color: STONE }}>Ghairi</Button>
          <Button variant="contained" startIcon={<Send size={16} />}
            onClick={() => { console.log(newAssignment); setAssignmentDialog(false); }}
            disabled={!newAssignment.title || !newAssignment.subject}
            sx={{ textTransform: 'none', bgcolor: PRIMARY, '&:hover': { bgcolor: '#0F2F28' } }}>
            Tuma Kazi
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={gradeDialog.open} onClose={() => setGradeDialog({ open: false, submission: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${LINE}`, pb: 1.5 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: PRIMARY }}>
            Weka Alama · {gradeDialog.submission?.studentName}
          </Typography>
          <IconButton size="small" onClick={() => setGradeDialog({ open: false, submission: null })}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <TextField fullWidth label="Alama (0-100)" type="number" value={grades[gradeDialog.submission?.id] || ''}
            onChange={(e) => setGrades({ ...grades, [gradeDialog.submission?.id]: e.target.value })}
            inputProps={{ min: 0, max: 100 }} sx={{ mb: 2 }} />
          <TextField fullWidth multiline rows={3} label="Maoni" placeholder="Andika maoni..." />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${LINE}` }}>
          <Button onClick={() => setGradeDialog({ open: false, submission: null })} sx={{ textTransform: 'none', color: STONE }}>Ghairi</Button>
          <Button variant="contained" onClick={() => setGradeDialog({ open: false, submission: null })}
            sx={{ textTransform: 'none', bgcolor: PRIMARY, '&:hover': { bgcolor: '#0F2F28' } }}>
            Hifadhi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherAssignments;