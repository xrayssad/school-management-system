import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Link as MuiLink } from '@mui/material';
import { Phone, Mail, MapPin, Menu as MenuIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const PRIMARY = '#18453B';
const DEEP = '#0F2F28';
const SAGE = '#8FD9BA';
const SOFT = '#E4EFE9';
const PAPER = '#F0F5F2';
const LINE = '#C5D4CC';
const STONE = '#4A554F';
const INK = '#1A231F';

const slides = [
  {
    title: "Elimu Bora ya Kiislamu",
    desc: "Mafunzo ya Quran, Tajwid na maadili kwa watoto wa kila umri.",
    img: "images/pici1.jpg"
  },
  {
    title: "Walimu Wenye Ujuzi",
    desc: "Wanazuoni wenye uzoefu wa miaka mingi wa ufundishaji.",
    img: "images/pici2.jpg"
  },
  {
    title: "Mazingira Salama",
    desc: "Mahali salama na tulivu pa kujifunzia kwa watoto wetu.",
    img: "images/pici3.jpg"
  }
];

const Home = () => {
  const [current, setCurrent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ bgcolor: PAPER, color: INK, fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh' }}>
      {/* Identity bar */}
      <Box sx={{ bgcolor: DEEP, color: SAGE, py: 0.75, fontSize: 14 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Phone size={14} />
            <span>+255 776 475 792 &nbsp; +255 652 929 146</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Mail size={14} />
            <span>habibielmustwafa@gmail.com</span>
          </Box>
        </Container>
      </Box>

      {/* Header */}
      <Box sx={{ bgcolor: PRIMARY, borderBottom: `1px solid ${DEEP}` }}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="images/logo2.jpg"
              alt="Nembo"
              sx={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${SAGE}` }}
            />
            <Box>
              <Typography sx={{ fontFamily: 'Amiri, serif', color: SAGE, fontSize: 16 }}>مدرسة الحبيب المصطفى</Typography>
              <Typography sx={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Madrasa Habib el Mustwafa</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Nav */}
      <Box sx={{ bgcolor: DEEP, position: 'relative' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: { xs: 'flex-end', md: 'center' }, alignItems: 'center' }}>
          <Box
            component="button"
            onClick={() => setMenuOpen(!menuOpen)}
            sx={{
              display: { xs: 'flex', md: 'none' },
              bgcolor: 'transparent',
              border: 'none',
              color: '#fff',
              p: 1.5,
              cursor: 'pointer'
            }}
          >
            {menuOpen ? <X size={22} /> : <MenuIcon size={22} />}
          </Box>
          <Box
            component="ul"
            sx={{
              display: { xs: menuOpen ? 'flex' : 'none', md: 'flex' },
              flexDirection: { xs: 'column', md: 'row' },
              listStyle: 'none',
              m: 0,
              p: 0,
              position: { xs: 'absolute', md: 'static' },
              top: '100%',
              left: 0,
              right: 0,
              bgcolor: DEEP,
              zIndex: 20
            }}
          >
            {[
              { label: 'Nyumbani', href: '/' },
              { label: 'Kuhusu Sisi', href: '#about' },
              { label: 'Huduma Zetu', href: '#services' },
              { label: 'Jisajili', to: '/register' },
              { label: 'Ingia', to: '/login' },
              { label: 'Mawasiliano', href: '#contact' }
            ].map((item) => (
              <Box component="li" key={item.label}>
                {item.to ? (
                  <MuiLink
                    component={Link}
                    to={item.to}
                    sx={{
                      display: 'block',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: 15,
                      fontWeight: 500,
                      px: 2.5,
                      py: 1.5,
                      borderBottom: '2px solid transparent',
                      '&:hover': { borderBottomColor: SAGE, color: SAGE }
                    }}
                  >
                    {item.label}
                  </MuiLink>
                ) : (
                  <MuiLink
                    href={item.href}
                    sx={{
                      display: 'block',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: 15,
                      fontWeight: 500,
                      px: 2.5,
                      py: 1.5,
                      borderBottom: '2px solid transparent',
                      '&:hover': { borderBottomColor: SAGE, color: SAGE }
                    }}
                  >
                    {item.label}
                  </MuiLink>
                )}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Hero */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, bgcolor: SOFT, borderBottom: `1px solid ${LINE}` }}>
        <Box sx={{ p: { xs: 4, md: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography sx={{ fontFamily: 'Amiri, serif', color: PRIMARY, fontSize: 20, mb: 1.5 }}>
            بسم الله الرحمن الرحيم
          </Typography>
          <Typography sx={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: { xs: 28, md: 36 }, color: DEEP, maxWidth: '15ch', mb: 2, fontWeight: 600 }}>
            Msingi wa dini huanzia kwenye herufi ya kwanza.
          </Typography>
          <Typography sx={{ color: STONE, maxWidth: 420, mb: 3, fontSize: 15 }}>
            Tunafundisha Quran, Tajwid na maadili ya Kiislamu kwa watoto na vijana, kwa mbinu zenye mpangilio na uangalizi wa karibu wa mwalimu.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              sx={{
                bgcolor: PRIMARY,
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                borderRadius: 0.5,
                boxShadow: 'none',
                '&:hover': { bgcolor: DEEP }
              }}
            >
              Jisajili sasa
            </Button>
            <Button
              href="#about"
              variant="outlined"
              sx={{
                borderColor: PRIMARY,
                color: PRIMARY,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                borderRadius: 0.5,
                '&:hover': { bgcolor: PRIMARY, color: '#fff', borderColor: PRIMARY }
              }}
            >
              Soma zaidi kutuhusu
            </Button>
          </Box>
        </Box>
        <Box sx={{ position: 'relative', minHeight: 380, overflow: 'hidden' }}>
          {slides.map((slide, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: current === i ? 1 : 0,
                transition: 'opacity 1s ease'
              }}
            >
              <Box
                component="img"
                src={slide.img}
                alt={slide.title}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, bgcolor: 'rgba(15,47,40,0.88)', color: '#fff', p: 2.5 }}>
                <Typography sx={{ fontSize: 17, fontWeight: 600, mb: 0.5 }}>{slide.title}</Typography>
                <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{slide.desc}</Typography>
              </Box>
            </Box>
          ))}
          <Box sx={{ position: 'absolute', bottom: 20, right: 24, display: 'flex', gap: 1, zIndex: 5 }}>
            {slides.map((_, i) => (
              <Box
                key={i}
                onClick={() => setCurrent(i)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: current === i ? SAGE : 'rgba(255,255,255,0.45)',
                  cursor: 'pointer'
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* About */}
      <Box id="about" sx={{ py: 8, bgcolor: PAPER }}>
        <Container maxWidth="lg">
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY, mb: 1, letterSpacing: '0.03em' }}>
            Kuhusu Sisi
          </Typography>
          <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 28, fontWeight: 600, color: DEEP, maxWidth: 560, mb: 4 }}>
            Kituo cha elimu ya Kiislamu kinachozingatia kina na uangalifu
          </Typography>
          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 18, color: DEEP, borderLeft: `3px solid ${SAGE}`, pl: 2.5 }}>
                Tunaamini kuwa elimu ya dini ni msingi wa maisha mema, hivyo tunajishughulisha na kuwafundisha watoto na vijana kusoma Quran, Tajwid, na maadili kwa mujibu wa mafundisho ya Mtume Muhammad (SAW).
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              {[
                { t: 'Misioni yetu', d: 'Kuwapa wanafunzi msingi imara wa dini na maadili yatakayowaongoza katika maisha ya kila siku.' },
                { t: 'Dira yetu', d: 'Kuwa kituo bora cha elimu ya Kiislamu katika mkoa wetu, kinachowafikia watoto wote bila ubaguzi.' },
                { t: 'Thamani zetu', d: 'Uadilifu, ujitolea, upendo na heshima kwa kila mwanafunzi anayepitia madrasa hii.' }
              ].map((item) => (
                <Box key={item.t} sx={{ py: 2, borderTop: `1px solid ${LINE}` }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>{item.t}</Typography>
                  <Typography sx={{ fontSize: 14, color: STONE }}>{item.d}</Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services */}
      <Box id="services" sx={{ py: 8, bgcolor: SOFT, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        <Container maxWidth="lg">
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY, mb: 1 }}>Huduma Zetu</Typography>
          <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 28, fontWeight: 600, color: DEEP, maxWidth: 560, mb: 4 }}>
            Mafunzo yanayofuata mpangilio, kwa umri wa miaka mitano hadi kumi na minane
          </Typography>
          <Grid container spacing={0}>
            {[
              {
                t: "Quran na Tajwid",
                items: ["Kusoma Quran kwa usahihi", "Masomo ya Tajwid na mahadhi", "Ufahamu wa maana za aya", "Mazoezi ya usikivu wa Quran"]
              },
              {
                t: "Hifdh ya Quran",
                items: ["Kuhifadhi surate mbalimbali", "Mbinu za kukariri kwa urahisi", "Mazoezi ya kudurusu kila siku", "Mifumo ya kukumbuka kwa muda mrefu"]
              },
              {
                t: "Masomo ya Dini",
                items: ["Fiqh na ibada za kila siku", "Hadith za Mtume (SAW)", "Akhlaq na maadili", "Historia ya Kiislamu na lugha ya Kiarabu"]
              }
            ].map((svc, i) => (
              <Grid item xs={12} md={4} key={svc.t}>
                <Box sx={{ px: { xs: 0, md: 3 }, py: { xs: 3, md: 0 }, borderLeft: { md: i === 0 ? 'none' : `1px solid ${LINE}` }, borderTop: { xs: i === 0 ? 'none' : `1px solid ${LINE}`, md: 'none' } }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 600, color: PRIMARY, mb: 2 }}>{svc.t}</Typography>
                  {svc.items.map((li) => (
                    <Typography key={li} sx={{ fontSize: 14, color: STONE, py: 0.75, borderTop: `1px solid ${LINE}`, '&:first-of-type': { borderTop: 'none', pt: 0 } }}>
                      {li}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact */}
      <Box id="contact" sx={{ py: 8, bgcolor: PRIMARY, color: '#fff' }}>
        <Container maxWidth="lg">
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: SAGE, mb: 1 }}>Mawasiliano</Typography>
          <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 28, fontWeight: 600, color: '#fff', mb: 4 }}>
            Wasiliana nasi kwa maswali au usajili
          </Typography>
          <Grid container spacing={4}>
            {[
              { icon: <Phone size={18} />, t: 'Simu', d: ['+255 776 475 792', '+255 652 929 146'] },
              { icon: <Mail size={18} />, t: 'Barua pepe', d: ['habibielmustwafa@gmail.com'] },
              { icon: <MapPin size={18} />, t: 'Eneo', d: ['Kigorofani, Mbuyu Mnene', 'Mombasa, Zanzibar'] }
            ].map((c) => (
              <Grid item xs={12} md={4} key={c.t}>
                <Box sx={{ pt: 2, borderTop: '1px solid rgba(255,255,255,0.18)' }}>
                  <Box sx={{ color: SAGE, mb: 1 }}>{c.icon}</Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#fff', mb: 0.5 }}>{c.t}</Typography>
                  {c.d.map((line) => (
                    <Typography key={line} sx={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{line}</Typography>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: DEEP, color: 'rgba(255,255,255,0.85)', pt: 5, pb: 2 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ pb: 3, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <Grid item xs={12} md={7}>
              <Box
                component="img"
                src="images/logo2.jpg"
                alt="Nembo"
                sx={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', mb: 1.5, border: `2px solid ${SAGE}` }}
              />
              <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 380 }}>
                Kituo cha elimu ya Kiislamu kilichojikita katika mafunzo ya Quran, Tajwid na maadili kwa watoto wa kila umri.
              </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography sx={{ fontFamily: 'Lora, serif', color: '#fff', fontSize: 16, mb: 1.5 }}>Mawasiliano</Typography>
              <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', mb: 0.75 }}>Kigorofani, Mbuyu Mnene, Mombasa Zanzibar</Typography>
              <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', mb: 0.75 }}>+255 776 475 792</Typography>
              <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>habibielmustwafa@gmail.com</Typography>
            </Grid>
          </Grid>
          <Typography sx={{ pt: 2, fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>
            © 2026 Madrasa Habib el Mustwafa. Haki zote zimehifadhiwa.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;