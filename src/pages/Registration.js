import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Button,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container
} from '@mui/material';
import { Link } from 'react-router-dom';

const PRIMARY = '#18453B';
const DEEP = '#0F2F28';
const SOFT = '#E4EFE9';
const PAPER = '#F0F5F2';
const LINE = '#C5D4CC';
const STONE = '#4A554F';
const INK = '#1A231F';

const fees = [
  { type: 'Kujisajili', amount: 'TSh 5,000', method: 'Mwanzo' },
  { type: 'Ada ya mwezi', amount: 'TSh 3,000', method: 'Kila mwezi' },
  { type: 'Mchango wa wiki', amount: 'TSh 9,000', method: 'Kila wiki' },
  { type: 'Mchango wa sikukuu', amount: 'TSh 1,000', method: 'Eid Fitri na Eid el Hajj' },
  { type: 'Kitambulisho', amount: 'TSh 3,000', method: 'Kila kinapotakika' },
  { type: 'Cheti na kuhitimu', amount: 'TSh 10,000', method: 'Kila akimaliza darasa' },
  { type: 'Uhamisho', amount: 'TSh 20,000', method: 'Anapohama' }
];

const Registration = () => {
  const [form, setForm] = useState({
    fullName: '',
    gender: '',
    birthDate: '',
    houseNumber: '',
    healthIssue: '',
    agreeTerms: false,
    parentName: '',
    parentAddress: '',
    parentPhone: '',
    sigDate: ''
  });

  useEffect(() => {
    const d = new Date();
    const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    setForm((prev) => ({ ...prev, sigDate: formatted }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.birthDate) return;
    const birth = new Date(form.birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const md = now.getMonth() - birth.getMonth();
    if (md < 0 || (md === 0 && now.getDate() < birth.getDate())) age--;
    if (age < 5 || age > 15) {
      alert('Umri wa mwanafunzi lazima uwe kati ya miaka 5 na 15.');
      return;
    }
    if (!form.agreeTerms) {
      alert('Tafadhali kubali masharti kabla ya kuwasilisha.');
      return;
    }
    alert('Fomu imewasilishwa. Ofisi yetu itakagua taarifa zako.');
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: SOFT,
      borderRadius: 0.5,
      fontSize: 15,
      '& fieldset': { borderColor: LINE },
      '&:hover fieldset': { borderColor: PRIMARY },
      '&.Mui-focused fieldset': { borderColor: PRIMARY },
      '&.Mui-focused': { bgcolor: '#fff' }
    }
  };

  const Section = ({ title, children, noPad }) => (
    <Box sx={{ bgcolor: '#fff', border: `1px solid ${LINE}`, mb: 3 }}>
      <Box sx={{ bgcolor: PRIMARY, color: '#fff', px: 2.5, py: 1.5, fontSize: 14, fontWeight: 600, letterSpacing: '0.4px' }}>
        {title}
      </Box>
      <Box sx={{ p: noPad ? 0 : 2.5 }}>{children}</Box>
    </Box>
  );

  const Field = ({ label, children, full }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, gridColumn: full ? '1 / -1' : 'auto' }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>{label}</Typography>
      {children}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: PAPER, color: INK, minHeight: '100vh', py: 4, px: 2, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ bgcolor: PRIMARY, color: '#fff', py: 4, px: 4, textAlign: 'center', border: `1px solid ${DEEP}` }}>
          <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 24, fontWeight: 600, mb: 1.5 }}>
            مدرسة الحبيب المصطفى
          </Typography>
          <Typography sx={{ fontSize: 14, opacity: 0.92, mb: 1 }}>
            +255 776 475 792 | +255 652 929 146 &nbsp; · &nbsp; habibielmustwafa@gmail.com
          </Typography>
          <Typography sx={{ fontSize: 14, opacity: 0.85 }}>Tarehe: {form.sigDate}</Typography>
        </Box>

        <Typography sx={{ textAlign: 'center', fontFamily: 'Lora, serif', fontSize: 20, fontWeight: 600, color: PRIMARY, my: 3.5 }}>
          Fomu ya Usajili wa Mwanafunzi
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Section title="Taarifa Binafsi">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <Field label="Jina kamili la mwanafunzi" full>
                <TextField name="fullName" value={form.fullName} onChange={handleChange} required size="small" fullWidth sx={inputSx} />
              </Field>
              <Field label="Jinsia">
                <FormControl size="small" fullWidth required>
                  <Select name="gender" value={form.gender} onChange={handleChange} displayEmpty sx={{ ...inputSx['& .MuiOutlinedInput-root'], bgcolor: SOFT }}>
                    <MenuItem value="" disabled>Chagua</MenuItem>
                    <MenuItem value="mwanaume">Mwanaume</MenuItem>
                    <MenuItem value="mwanamke">Mwanamke</MenuItem>
                  </Select>
                </FormControl>
              </Field>
              <Field label="Tarehe ya kuzaliwa">
                <TextField name="birthDate" type="date" value={form.birthDate} onChange={handleChange} required size="small" fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} />
              </Field>
              <Field label="Namba ya nyumba">
                <TextField name="houseNumber" value={form.houseNumber} onChange={handleChange} size="small" fullWidth sx={inputSx} />
              </Field>
              <Field label="Tatizo la kiafya (kama lipo)" full>
                <TextField name="healthIssue" value={form.healthIssue} onChange={handleChange} size="small" fullWidth sx={inputSx} />
              </Field>
            </Box>
          </Section>

          <Section title="Masharti">
            <Box component="ol" sx={{ pl: 2.5, mb: 2, m: 0 }}>
              {[
                'Umri usipungue miaka 5 na usizidi 15',
                'Mwanafunzi lazima anajilisha na mzazi au mlinzi aliye mzima ambaye atakuwa ndiye dhamana',
                'Mzazi na mwanafunzi wawe tayari kushiriki kikamilifu katika nyanja zote za madrasa',
                'Mzazi na mwanafunzi wawe tayari kutii na kufuata sheria, kanuni pamoja na masharti yote ya madrasa',
                'Malenzi ya mwanafunzi ni jambo la msingi ndani na nje ya madrasa'
              ].map((t, i) => (
                <Typography component="li" key={i} sx={{ fontSize: 14, color: STONE, mb: 1.25 }}>{t}</Typography>
              ))}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, p: 1.75, bgcolor: SOFT, border: `1px solid ${LINE}` }}>
              <Checkbox
                name="agreeTerms"
                checked={form.agreeTerms}
                onChange={handleChange}
                required
                size="small"
                sx={{ color: PRIMARY, '&.Mui-checked': { color: PRIMARY }, p: 0, mt: 0.25 }}
              />
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: PRIMARY }}>
                Nimekubali na kutii masharti yote hapo juu
              </Typography>
            </Box>
          </Section>

          <Section title="Michango na Malipo" noPad>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: PRIMARY, color: '#fff', fontWeight: 600, fontSize: 13 }}>Aina ya malipo</TableCell>
                    <TableCell sx={{ bgcolor: PRIMARY, color: '#fff', fontWeight: 600, fontSize: 13 }}>Kiasi</TableCell>
                    <TableCell sx={{ bgcolor: PRIMARY, color: '#fff', fontWeight: 600, fontSize: 13 }}>Namna ya utoaji</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fees.map((row, i) => (
                    <TableRow key={row.type} sx={{ bgcolor: i % 2 === 1 ? SOFT : '#fff' }}>
                      <TableCell sx={{ fontSize: 14, color: STONE, borderColor: LINE }}>{row.type}</TableCell>
                      <TableCell sx={{ fontSize: 14, color: STONE, borderColor: LINE }}>{row.amount}</TableCell>
                      <TableCell sx={{ fontSize: 14, color: STONE, borderColor: LINE }}>{row.method}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Section>

          <Section title="Taarifa ya Mzazi / Mlezi">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <Field label="Jina kamili" full>
                <TextField name="parentName" value={form.parentName} onChange={handleChange} required size="small" fullWidth sx={inputSx} />
              </Field>
              <Field label="Anwani">
                <TextField name="parentAddress" value={form.parentAddress} onChange={handleChange} required size="small" fullWidth sx={inputSx} />
              </Field>
              <Field label="Namba ya simu">
                <TextField name="parentPhone" value={form.parentPhone} onChange={handleChange} required size="small" fullWidth sx={inputSx} />
              </Field>
            </Box>
            <Box sx={{ mt: 2, p: 1.5, bgcolor: SOFT, borderLeft: `3px solid ${PRIMARY}` }}>
              <Typography sx={{ fontSize: 13, color: STONE }}>
                Nahidhari kushirikiana na meneja wa madrasa katika kumwezesha mwanafunzi kufuata sheria, kanuni pamoja na masharti ya madrasa.
              </Typography>
            </Box>
          </Section>

          <Section title="Viambatanisho vinavyohitajika">
            <Box component="ol" sx={{ pl: 2.5, m: 0 }}>
              {['Nakala ya cheti cha kuzaliwa', 'Picha 2 za passport size', 'Barua ya uhamisho (kwa wanafunzi waliohami tu)'].map((item) => (
                <Typography component="li" key={item} sx={{ fontSize: 14, color: STONE, mb: 1 }}>{item}</Typography>
              ))}
            </Box>
          </Section>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 5, mt: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY, mb: 0.75 }}>Saini ya mzazi / mlezi</Typography>
              <Box sx={{ borderBottom: `1px solid ${PRIMARY}`, width: 200, height: 28 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY, mb: 0.75 }}>Tarehe</Typography>
              <TextField
                name="sigDate"
                value={form.sigDate}
                onChange={handleChange}
                size="small"
                variant="standard"
                sx={{ width: 140, '& .MuiInput-underline:before': { borderColor: PRIMARY }, '& .MuiInput-underline:after': { borderColor: PRIMARY } }}
              />
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: PRIMARY,
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 15,
                px: 4.5,
                py: 1.4,
                borderRadius: 0.5,
                boxShadow: 'none',
                '&:hover': { bgcolor: DEEP }
              }}
            >
              Wasilisha Fomu
            </Button>
            <Typography sx={{ mt: 2, fontSize: 14, color: STONE }}>
              Tayari una akaunti?{' '}
              <Typography component={Link} to="/login" sx={{ color: PRIMARY, fontWeight: 500, textDecoration: 'none' }}>
                Ingia hapa
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Registration;