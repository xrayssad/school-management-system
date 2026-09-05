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
  IconButton,
  Avatar
} from '@mui/material';
import { Megaphone, Plus, Calendar, Users, Eye, Send, X, Clock } from 'lucide-react';

const PRIMARY = '#18453B';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const TeacherAnnouncements = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState({ open: false, announcement: null });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '', type: 'mihadhara', content: '', date: '', time: '', audience: 'wanafunzi_wote'
  });

  const announcementTypes = [
    { value: 'mihadhara', label: 'Mihadhara' },
    { value: 'mikutano_wazazi', label: 'Mikutano ya Wazazi' },
    { value: 'sheria_mpya', label: 'Sheria Mpya' },
    { value: 'matukio', label: 'Matukio' },
    { value: 'mengineyo', label: 'Mengineyo' }
  ];

  const announcements = [
    {
      id: 'ANN001',
      title: 'Mhadhara wa Quran - Sura Al-Baqarah',
      type: 'mihadhara',
      content: 'Mhadhara maalum utafanyika kuhusu tafsiri ya Sura Al-Baqarah. Wote mkaribishwa.',
      date: '2024-03-20',
      time: '14:00 - 16:00',
      audience: 'Wanafunzi wote',
      status: 'active'
    },
    {
      id: 'ANN002',
      title: 'Mkutano wa Wazazi - Muhula wa Pili',
      type: 'mikutano_wazazi',
      content: 'Mkutano wa wazazi utafanyika kujadili maendeleo ya wanafunzi katika muhula wa pili.',
      date: '2024-03-25',
      time: '10:00 - 12:00',
      audience: 'Wazazi wa Darasa la 5 & 6',
      status: 'active'
    },
    {
      id: 'ANN003',
      title: 'Sheria Mpya za Usafi wa Madarasa',
      type: 'sheria_mpya',
      content: 'Tumeanzisha sheria mpya za usafi. Tafadhali zingatia maelekezo yote.',
      date: '2024-03-01',
      time: '',
      audience: 'Wanafunzi wote na Waalimu',
      status: 'active'
    }
  ];

  const audienceOptions = [
    { value: 'wanafunzi_wote', label: 'Wanafunzi Wote' },
    { value: 'wazazi_wote', label: 'Wazazi Wote' },
    { value: 'walimu_wote', label: 'Walimu Wote' },
    { value: 'darasa_5_6', label: 'Darasa la 5 & 6' },
    { value: 'jamii_yote', label: 'Jamii Yote ya Madrasa' }
  ];

  const getFiltered = () => (selectedType === 'all' ? announcements : announcements.filter((a) => a.type === selectedType));
  const getTypeLabel = (type) => announcementTypes.find((t) => t.value === type)?.label || type;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
          Matangazo
        </Typography>
        <Typography sx={{ fontSize: 15, color: STONE }}>
          Tuma na usimamize matangazo ya Madrasa
        </Typography>
      </Box>

      <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', mb: 2.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField select fullWidth size="small" label="Aina ya Tangazo" value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}>
                <MenuItem value="all">Aina Zote</MenuItem>
                {announcementTypes.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button fullWidth variant="contained" startIcon={<Plus size={18} />} onClick={() => setAnnouncementDialog(true)}
                sx={{ textTransform: 'none', bgcolor: PRIMARY, '&:hover': { bgcolor: '#0F2F28' } }}>
                Tuma Tangazo Jipya
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={6} md={2.4}>
          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
            <CardContent sx={{ p: 1.75, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 20, fontWeight: 600, color: PRIMARY }}>{announcements.length}</Typography>
              <Typography sx={{ fontSize: 11, color: STONE }}>Jumla</Typography>
            </CardContent>
          </Card>
        </Grid>
        {announcementTypes.map((t) => (
          <Grid item xs={6} md={2.4} key={t.value}>
            <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
              <CardContent sx={{ p: 1.75, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 20, fontWeight: 600, color: PRIMARY }}>
                  {announcements.filter((a) => a.type === t.value).length}
                </Typography>
                <Typography sx={{ fontSize: 11, color: STONE }}>{t.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${LINE}` }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Megaphone size={16} /> Matangazo ({getFiltered().length})
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: SOFT }}>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Tangazo</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Aina</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Tarehe</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Wahusika</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Hali</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, color: PRIMARY }}>Vitendo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFiltered().map((a) => (
                <TableRow key={a.id} sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{a.title}</Typography>
                    <Typography sx={{ fontSize: 11, color: STONE }}>{a.content.substring(0, 45)}...</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={getTypeLabel(a.type)} size="small"
                      sx={{ height: 22, fontSize: 11, bgcolor: SOFT, color: PRIMARY, border: `1px solid ${LINE}`, borderRadius: 0.5 }} />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13 }}>{a.date}</Typography>
                    {a.time && <Typography sx={{ fontSize: 11, color: STONE }}>{a.time}</Typography>}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{a.audience}</TableCell>
                  <TableCell>
                    <Chip label={a.status === 'active' ? 'Inaendelea' : 'Imekwisha'} size="small"
                      sx={{ height: 22, fontSize: 11, bgcolor: SOFT, color: PRIMARY, border: `1px solid ${LINE}`, borderRadius: 0.5 }} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => setViewDialog({ open: true, announcement: a })} sx={{ color: PRIMARY }}>
                      <Eye size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={announcementDialog} onClose={() => setAnnouncementDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${LINE}`, pb: 1.5 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: PRIMARY }}>Tuma Tangazo Jipya</Typography>
          <IconButton size="small" onClick={() => setAnnouncementDialog(false)}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Kichwa cha Tangazo" value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Aina" value={newAnnouncement.type}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}>
                {announcementTypes.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Wahusika" value={newAnnouncement.audience}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, audience: e.target.value })}>
                {audienceOptions.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Tarehe" type="date" value={newAnnouncement.date}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, date: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Muda" value={newAnnouncement.time} placeholder="14:00 - 16:00"
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, time: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={4} label="Maelezo" value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${LINE}` }}>
          <Button onClick={() => setAnnouncementDialog(false)} sx={{ textTransform: 'none', color: STONE }}>Ghairi</Button>
          <Button variant="contained" startIcon={<Send size={16} />}
            onClick={() => { console.log(newAnnouncement); setAnnouncementDialog(false); }}
            disabled={!newAnnouncement.title || !newAnnouncement.content}
            sx={{ textTransform: 'none', bgcolor: PRIMARY, '&:hover': { bgcolor: '#0F2F28' } }}>
            Tuma Tangazo
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, announcement: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${LINE}`, pb: 1.5 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: PRIMARY }}>Maelezo ya Tangazo</Typography>
          <IconButton size="small" onClick={() => setViewDialog({ open: false, announcement: null })}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          {viewDialog.announcement && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Avatar sx={{ bgcolor: SOFT, color: PRIMARY, border: `1px solid ${LINE}` }}>
                  <Megaphone size={18} />
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{viewDialog.announcement.title}</Typography>
                  <Chip label={getTypeLabel(viewDialog.announcement.type)} size="small"
                    sx={{ height: 22, fontSize: 11, bgcolor: SOFT, color: PRIMARY, border: `1px solid ${LINE}`, borderRadius: 0.5, mt: 0.5 }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: 14, color: STONE, mb: 2, lineHeight: 1.6 }}>
                {viewDialog.announcement.content}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    <Calendar size={14} color={PRIMARY} />
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Tarehe</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, color: STONE }}>{viewDialog.announcement.date}</Typography>
                </Grid>
                {viewDialog.announcement.time && (
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                      <Clock size={14} color={PRIMARY} />
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Muda</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13, color: STONE }}>{viewDialog.announcement.time}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    <Users size={14} color={PRIMARY} />
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Wahusika</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, color: STONE }}>{viewDialog.announcement.audience}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${LINE}` }}>
          <Button onClick={() => setViewDialog({ open: false, announcement: null })} sx={{ textTransform: 'none', color: STONE }}>
            Funga
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherAnnouncements;