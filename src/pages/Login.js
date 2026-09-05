import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, InputAdornment } from '@mui/material';
import { User, Lock, BookOpen, Users, Award, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const PRIMARY = '#18453B';
const DEEP = '#0F2F28';
const MINT = '#a2f2d5';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple redirect for demo - replace with real auth
    if (username && password) {
      navigate('/');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#e8eeeb',
        p: 3,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 920,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          bgcolor: '#fff',
          border: `1px solid ${LINE}`,
          borderRadius: 0.5,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(24,69,59,0.08)'
        }}
      >
        {/* Info column */}
        <Box
          sx={{
            flex: 1,
            bgcolor: PRIMARY,
            color: '#fff',
            p: { xs: 4, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 600, color: MINT, mb: 1.5 }}>
            Madrasa Habib el Mustwafa
          </Typography>
          <Typography sx={{ fontSize: 15, lineHeight: 1.6, opacity: 0.9, mb: 3 }}>
            Karibu katika mfumo wa usajili na usimamizi wa madrasa. Ingia ili kuendelea na huduma zetu.
          </Typography>
          {[
            { icon: <BookOpen size={16} />, text: 'Elimu bora ya Qurani, Tajwid na masomo ya dini' },
            { icon: <GraduationCap size={16} />, text: 'Walimu wenye uzoefu na mbinu za kisasa za ufundishaji' },
            { icon: <Users size={16} />, text: 'Mazingira salama na yanayounga mkono ukuaji wa mwanafunzi' },
            { icon: <Award size={16} />, text: 'Mitaala kamili inayochanganya elimu ya dini na maadili' }
          ].map((item, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
              <Box sx={{ color: MINT, mt: 0.25 }}>{item.icon}</Box>
              <Typography sx={{ fontSize: 14, lineHeight: 1.5 }}>{item.text}</Typography>
            </Box>
          ))}
        </Box>

        {/* Login column */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 4, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            bgcolor: '#fff'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 68,
                height: 68,
                mx: 'auto',
                mb: 1.5,
                bgcolor: SOFT,
                border: `2px solid ${PRIMARY}`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: PRIMARY }}>HM</Typography>
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
              Ingia kwenye Akaunti
            </Typography>
            <Typography sx={{ fontSize: 14, color: STONE }}>
              Tafadhali weka taarifa zako ili kuendelea
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY, mb: 0.75 }}>
              Jina la Mtumiaji
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Weka jina lako la mtumiaji"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={16} color={PRIMARY} />
                  </InputAdornment>
                )
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fafbfa',
                  borderRadius: 0.5,
                  '& fieldset': { borderColor: LINE },
                  '&:hover fieldset': { borderColor: PRIMARY },
                  '&.Mui-focused fieldset': { borderColor: PRIMARY }
                }
              }}
            />

            <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY, mb: 0.75 }}>
              Nenosiri
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Weka nenosiri lako"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={16} color={PRIMARY} />
                  </InputAdornment>
                )
              }}
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fafbfa',
                  borderRadius: 0.5,
                  '& fieldset': { borderColor: LINE },
                  '&:hover fieldset': { borderColor: PRIMARY },
                  '&.Mui-focused fieldset': { borderColor: PRIMARY }
                }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    size="small"
                    sx={{ color: PRIMARY, '&.Mui-checked': { color: PRIMARY } }}
                  />
                }
                label={<Typography sx={{ fontSize: 13, color: STONE }}>Nikumbuke</Typography>}
              />
              <Typography
                component="a"
                href="#"
                sx={{ fontSize: 13, color: PRIMARY, fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Umesahau nenosiri?
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                bgcolor: PRIMARY,
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 15,
                py: 1.3,
                borderRadius: 0.5,
                boxShadow: 'none',
                '&:hover': { bgcolor: DEEP }
              }}
            >
              Ingia
            </Button>

            <Typography sx={{ textAlign: 'center', fontSize: 14, color: STONE, mt: 2.5 }}>
              Huna akaunti?{' '}
              <Typography
                component={Link}
                to="/register"
                sx={{ color: PRIMARY, fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Jisajili hapa
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;