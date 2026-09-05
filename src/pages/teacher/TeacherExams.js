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
import { Calendar, Clock, MapPin, BookOpen, Plus, Download, Upload, X } from 'lucide-react';

const PRIMARY = '#18453B';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const TeacherExams = () => {
  const [selectedSubject, setSelectedSubject] = useState('Quran');
  const [selectedClass, setSelectedClass] = useState('Darasa la 5');
  const [examDialog, setExamDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [newExam, setNewExam] = useState({ subject: '', class: '', type: 'mtihani_mdogo', date: '', time: '', duration: '', room: '' });

  const subjects = [
    { name: 'Quran', classes: ['Darasa la 5', 'Darasa la 6'] },
    { name: 'Tajweed', classes: ['Darasa la 4', 'Darasa la 5'] },
    { name: 'Hadith', classes: ['Darasa la 6'] },
    { name: 'Tahfeedh', classes: ['Darasa la 3', 'Darasa la 4'] }
  ];

  const examTypes = [
    { value: 'muhula_wa_kwanza', label: 'Mtihani wa Muhula wa Kwanza' },
    { value: 'muhula_wa_pili', label: 'Mtihani wa Muhula wa Pili' },
    { value: 'mtihani_mkuu', label: 'Mtihani Mkuu' },
    { value: 'mtihani_mdogo', label: 'Mtihani Mdogo' }
  ];

  const classrooms = ['Chumba 101', 'Chumba 102', 'Chumba 103', 'Chumba 104', 'Ukumbi Mkuu'];

  const exams = [
    { id: 'EX001', subject: 'Quran', class: 'Darasa la 5', type: 'muhula_wa_kwanza', date: '2024-03-15', time: '08:00 - 10:00', room: 'Chumba 101', status: 'coming', students: 25 },
    { id: 'EX002', subject: 'Tajweed', class: 'Darasa la 4', type: 'mtihani_mdogo', date: '2024-03-18', time: '10:30 - 11:30', room: 'Chumba 103', status: 'coming', students: 20 },
    { id: 'EX003', subject: 'Hadith', class: 'Darasa la 6', type: 'muhula_wa_pili', date: '2024-02-10', time: '14:00 - 16:00', room: 'Ukumbi Mkuu', status: 'completed', students: 18 }
  ];

  const pastPapers = [
    { id: 'PP001', subject: 'Quran', class: 'Darasa la 5', year: '2023', type: 'muhula_wa_kwanza', file: 'quran_darasa_5_2023.pdf' },
    { id: 'PP002', subject: 'Tajweed', class: 'Darasa la 4', year: '2023', type: 'mtihani_mdogo', file: 'tajweed_darasa_4_2023.pdf' },
    { id: 'PP003', subject: 'Hadith', class: 'Darasa la 6', year: '2023', type: 'muhula_wa_pili', file: 'hadith_darasa_6_2023.docx' }
  ];

  const getFilteredClasses = () => subjects.find((s) => s.name === selectedSubject)?.classes || [];
  const getStatusText = (s) => ({ coming: 'Inakuja', completed: 'Imekwisha', cancelled: 'Imefutwa' }[s] || s);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
          Mitihani
        </Typography>
        <Typography sx={{ fontSize: 15, color: STONE }}>
          Ratiba ya mitihani na nyenzo za kudurusia
        </Typography>
      </Box>

      <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', mb: 2.5 }}>
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
            <Grid item xs={6} md={2}>
              <Button fullWidth variant="contained" startIcon={<Plus size={16} />} onClick={() => setExamDialog(true)}
                sx={{ textTransform: 'none', bgcolor: PRIMARY, '&:hover': { bgcolor: '#0F2F28' } }}>
                Ratiba Mpya
              </Button>
            </Grid>
            <Grid item xs={6} md={2}>
              <Button fullWidth variant="outlined" startIcon={<Upload size={16} />} onClick={() => setUploadDialog(true)}
                sx={{ textTransform: 'none', borderColor: LINE, color: PRIMARY, '&:hover': { borderColor: PRIMARY, bgcolor: SOFT } }}>
                Past Paper
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
            <Box sx={{ p: 2.5, borderBottom: `1px solid ${LINE}` }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={16} /> Ratiba ya Mitihani
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: SOFT }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Somo</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Tarehe</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Chumba</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Hali</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exams.map((e) => (
                    <TableRow key={e.id} sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{e.subject}</Typography>
                        <Typography sx={{ fontSize: 11, color: STONE }}>{e.class}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13 }}>{e.date}</Typography>
                        <Typography sx={{ fontSize: 11, color: STONE }}>{e.time}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MapPin size={12} color={PRIMARY} />
                          <Typography sx={{ fontSize: 13 }}>{e.room}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={getStatusText(e.status)} size="small"
                          sx={{ height: 22, fontSize: 11, bgcolor: SOFT, color: PRIMARY, border: `1px solid ${LINE}`, borderRadius: 0.5 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
            <Box sx={{ p: 2.5, borderBottom: `1px solid ${LINE}` }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BookOpen size={16} /> Past Papers
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: SOFT }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Somo</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Mwaka</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Aina</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Vitendo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pastPapers.map((p) => (
                    <TableRow key={p.id} sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{p.subject}</Typography>
                        <Typography sx={{ fontSize: 11, color: STONE }}>{p.class}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: 13 }}>{p.year}</TableCell>
                      <TableCell>
                        <Chip label={examTypes.find((t) => t.value === p.type)?.label} size="small"
                          sx={{ height: 22, fontSize: 11, bgcolor: SOFT, color: PRIMARY, border: `1px solid ${LINE}`, borderRadius: 0.5 }} />
                      </TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<Download size={14} />} sx={{ textTransform: 'none', color: PRIMARY, fontSize: 12 }}>
                          Pakua
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {[
          { label: 'Mitihani Imeratibiwa', value: exams.length },
          { label: 'Inakuja', value: exams.filter((e) => e.status === 'coming').length },
          { label: 'Past Papers', value: pastPapers.length },
          { label: 'Wanafunzi', value: exams.reduce((s, e) => s + e.students, 0) }
        ].map((stat, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 22, fontWeight: 600, color: PRIMARY }}>{stat.value}</Typography>
                <Typography sx={{ fontSize: 12, color: STONE }}>{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={examDialog} onClose={() => setExamDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${LINE}`, pb: 1.5 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: PRIMARY }}>Ratiba Mtihani Mpya</Typography>
          <IconButton size="small" onClick={() => setExamDialog(false)}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Somo" value={newExam.subject}
                onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}>
                {subjects.map((s) => <MenuItem key={s.name} value={s.name}>{s.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Darasa" value={newExam.class}
                onChange={(e) => setNewExam({ ...newExam, class: e.target.value })}>
                {getFilteredClasses().map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Aina" value={newExam.type}
                onChange={(e) => setNewExam({ ...newExam, type: e.target.value })}>
                {examTypes.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Tarehe" type="date" value={newExam.date}
                onChange={(e) => setNewExam({ ...newExam, date: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Muda" value={newExam.time} placeholder="08:00 - 10:00"
                onChange={(e) => setNewExam({ ...newExam, time: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Chumba" value={newExam.room}
                onChange={(e) => setNewExam({ ...newExam, room: e.target.value })}>
                {classrooms.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${LINE}` }}>
          <Button onClick={() => setExamDialog(false)} sx={{ textTransform: 'none', color: STONE }}>Ghairi</Button>
          <Button variant="contained" onClick={() => { console.log(newExam); setExamDialog(false); }}
            disabled={!newExam.subject || !newExam.date}
            sx={{ textTransform: 'none', bgcolor: PRIMARY, '&:hover': { bgcolor: '#0F2F28' } }}>
            Hifadhi
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${LINE}`, pb: 1.5 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: PRIMARY }}>Tuma Past Paper</Typography>
          <IconButton size="small" onClick={() => setUploadDialog(false)}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Button fullWidth variant="outlined" startIcon={<Upload size={18} />}
            sx={{ height: 80, borderStyle: 'dashed', borderColor: LINE, color: PRIMARY, textTransform: 'none',
              '&:hover': { borderColor: PRIMARY, bgcolor: SOFT } }}>
            Bonyeza au vuta faili hapa
          </Button>
          <Typography sx={{ fontSize: 12, color: STONE, mt: 1 }}>PDF, DOC, DOCX (Max 10MB)</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${LINE}` }}>
          <Button onClick={() => setUploadDialog(false)} sx={{ textTransform: 'none', color: STONE }}>Ghairi</Button>
          <Button variant="contained" onClick={() => setUploadDialog(false)}
            sx={{ textTransform: 'none', bgcolor: PRIMARY, '&:hover': { bgcolor: '#0F2F28' } }}>
            Tuma
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherExams;