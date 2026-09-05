import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import {
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';

const PRIMARY = '#18453B';
const MINT = '#a2f2d5';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const Events = () => {
  const upcomingEvents = [
    {
      title: 'Tamasha la Tahfeedh',
      date: 'Mar 1, 2024',
      time: '08:00 - 12:00',
      location: 'Ukumbi wa Madrasa',
      description: 'Shindano la ushindani wa kuhifadhi Quran kwa wanafunzi',
      importance: 'high'
    },
    {
      title: 'Semina ya Vijana na Dini',
      date: 'Feb 22, 2024',
      time: '14:00 - 16:00',
      location: 'Chumba cha Mikutano',
      description: 'Majadiliano kuhusu changamoto za kisasa na dini',
      importance: 'medium'
    },
    {
      title: 'Siku ya Wazazi',
      date: 'Mar 10, 2024',
      time: '09:00 - 15:00',
      location: 'Madrasa Grounds',
      description: 'Wazazi wakaribishwe kuona kazi za watoto wao',
      importance: 'medium'
    }
  ];

  const holidays = [
    { name: 'Eid al-Fitr', date: 'Apr 10-12, 2024', duration: '3 siku', type: 'religious' },
    { name: 'Eid al-Adha', date: 'Jun 16-18, 2024', duration: '3 siku', type: 'religious' },
    { name: 'Mwaka mpya wa Kiislamu', date: 'Jul 19, 2024', duration: '1 siku', type: 'religious' },
    { name: 'Mapumziko ya Nusu Mwaka', date: 'Jun 1-15, 2024', duration: '2 wiki', type: 'academic' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
          Matukio na Sikukuu
        </Typography>
        <Typography sx={{ fontSize: 15, color: STONE }}>
          Fuata matukio yanayokuja na siku za kupumzika
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
            <Box sx={{ px: 2.5, py: 1.75, bgcolor: SOFT, borderBottom: `1px solid ${LINE}` }}>
              <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 17, fontWeight: 600, color: PRIMARY }}>
                Matukio Yanayokuja
              </Typography>
            </Box>
            <CardContent sx={{ p: 0 }}>
              {upcomingEvents.map((event, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 2.5,
                    py: 2.25,
                    borderBottom: index < upcomingEvents.length - 1 ? `1px solid ${LINE}` : 'none'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: PRIMARY }}>
                      {event.title}
                    </Typography>
                    <Chip
                      label={event.importance === 'high' ? 'Muhimu Sana' : 'Muhimu'}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: 11,
                        fontWeight: 600,
                        bgcolor: event.importance === 'high' ? PRIMARY : SOFT,
                        color: event.importance === 'high' ? '#fff' : PRIMARY,
                        border: `1px solid ${LINE}`,
                        borderRadius: 0.5
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: 14, color: STONE, mb: 1.25 }}>
                    {event.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Typography sx={{ fontSize: 13, color: STONE, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Calendar size={14} /> {event.date}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: STONE, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Clock size={14} /> {event.time}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: STONE, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <MapPin size={14} /> {event.location}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', mb: 2.5 }}>
            <Box sx={{ px: 2.5, py: 1.75, bgcolor: SOFT, borderBottom: `1px solid ${LINE}` }}>
              <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 17, fontWeight: 600, color: PRIMARY }}>
                Sikukuu na Mapumziko
              </Typography>
            </Box>
            <CardContent sx={{ p: 0 }}>
              {holidays.map((h, i) => (
                <Box key={i}>
                  <Box sx={{ px: 2.5, py: 1.75, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{h.name}</Typography>
                      <Typography sx={{ fontSize: 13, color: STONE }}>
                        {h.date} · {h.duration}
                      </Typography>
                    </Box>
                    <Chip
                      label={h.type === 'religious' ? 'Kidini' : 'Kielimu'}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: 11,
                        fontWeight: 600,
                        bgcolor: SOFT,
                        color: PRIMARY,
                        border: `1px solid ${LINE}`,
                        borderRadius: 0.5
                      }}
                    />
                  </Box>
                  {i < holidays.length - 1 && <Divider />}
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none', bgcolor: SOFT, mb: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: PRIMARY, mb: 1 }}>
                Tangazo Muhimu
              </Typography>
              <Typography sx={{ fontSize: 14, color: STONE, mb: 1 }}>
                Tafadhali wasilisha fomu za usajili wa mitihani kabla ya tarehe 20 Januari.
              </Typography>
              <Typography sx={{ fontSize: 14, color: STONE }}>
                Wanafunzi wote wanahitajika kuhudhuria maandalizi ya Maulid.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
            <Box sx={{ px: 2.5, py: 1.75, bgcolor: SOFT, borderBottom: `1px solid ${LINE}` }}>
              <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 17, fontWeight: 600, color: PRIMARY }}>
                Takwimu za Matukio
              </Typography>
            </Box>
            <CardContent sx={{ p: 0 }}>
              {[
                { label: 'Matukio Yanayokuja', value: '3' },
                { label: 'Sikukuu', value: '4' },
                { label: 'Matukio ya Kidini', value: '3' },
                { label: 'Wikendi zijazo', value: '2' }
              ].map((s, i) => (
                <Box
                  key={i}
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: i < 3 ? `1px solid ${LINE}` : 'none'
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: STONE }}>{s.label}</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: PRIMARY }}>{s.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Events;