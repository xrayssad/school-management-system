import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  alpha
} from '@mui/material';
import {
  Clock,
  BookOpen,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Target,
  Users
} from 'lucide-react';

const PRIMARY = '#18453B';
const MINT = '#a2f2d5';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const StatCard = ({ title, value, subtitle, icon: Icon, progress }) => (
  <Card
    sx={{
      height: '100%',
      background: '#fff',
      border: `1px solid ${LINE}`,
      borderRadius: 1,
      boxShadow: 'none'
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: STONE, mb: 0.75 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 600, color: PRIMARY, lineHeight: 1.2 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: 13, color: STONE, mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: SOFT,
            border: `1px solid ${LINE}`,
            borderRadius: 1,
            color: PRIMARY
          }}
        >
          <Icon size={20} />
        </Box>
      </Box>

      {progress !== undefined && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography sx={{ fontSize: 12, color: STONE }}>Maendeleo</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: PRIMARY }}>
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 5,
              borderRadius: 1,
              bgcolor: SOFT,
              '& .MuiLinearProgress-bar': {
                bgcolor: PRIMARY,
                borderRadius: 1
              }
            }}
          />
        </Box>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const upcomingClasses = [
    {
      subject: 'Quran',
      time: '08:00 - 09:00',
      teacher: 'Sheikh Ahmed Ali',
      room: 'Masjid Kubwa',
      status: 'upcoming'
    },
    {
      subject: 'Tajweed',
      time: '09:15 - 10:15',
      teacher: 'Sheikh Ahmed Ali',
      room: 'Chumba 1',
      status: 'upcoming'
    },
    {
      subject: 'Hadith',
      time: '10:30 - 11:30',
      teacher: 'Ustadh Mohammed',
      room: 'Chumba 2',
      status: 'completed'
    }
  ];

  const recentGrades = [
    { subject: 'Quran', grade: 'A', marks: '45/50', progress: 90 },
    { subject: 'Tajweed', grade: 'B+', marks: '42/50', progress: 84 },
    { subject: 'Hadith', grade: 'A-', marks: '43/50', progress: 86 }
  ];

  const quickStats = [
    { label: 'Juz Zilizokaririwa', value: '12/30', icon: BookOpen },
    { label: 'Hadith Zilizosoma', value: '25/40', icon: Target },
    { label: 'Hudhurio', value: '94%', icon: Users },
    { label: 'Kazi Zilizomaliza', value: '18/20', icon: CheckCircle2 }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
          Karibu tena, Ahmed
        </Typography>
        <Typography sx={{ fontSize: 15, color: STONE }}>
          Muonekano wa maendeleo yako ya leo
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Masomo ya Leo"
            value="5"
            subtitle="2 yamekamilika"
            icon={Clock}
            progress={40}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Mitihani Inayokuja"
            value="2"
            subtitle="Ijayo: Quran"
            icon={BookOpen}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Matukio"
            value="3"
            subtitle="Jumamosi"
            icon={Calendar}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Wastani wa Mitihani"
            value="85%"
            subtitle="B+ Grade"
            icon={TrendingUp}
            progress={85}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
            <Box sx={{ px: 2.5, py: 1.75, bgcolor: SOFT, borderBottom: `1px solid ${LINE}` }}>
              <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 17, fontWeight: 600, color: PRIMARY }}>
                Ratiba ya Leo
              </Typography>
              <Typography sx={{ fontSize: 13, color: STONE }}>
                Jumatatu, Januari 15, 2024
              </Typography>
            </Box>
            <CardContent sx={{ p: 0 }}>
              {upcomingClasses.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    px: 2.5,
                    py: 2,
                    borderBottom: index < upcomingClasses.length - 1 ? `1px solid ${LINE}` : 'none'
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      borderRadius: 1,
                      bgcolor: item.status === 'completed' ? MINT : PRIMARY,
                      flexShrink: 0
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                        {item.subject}
                      </Typography>
                      <Chip
                        label={item.status === 'completed' ? 'Imekwisha' : 'Inakuja'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: 11,
                          fontWeight: 600,
                          bgcolor: item.status === 'completed' ? MINT : SOFT,
                          color: PRIMARY,
                          border: `1px solid ${LINE}`,
                          borderRadius: 0.5
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: 13, color: STONE }}>
                      {item.time} · {item.room} · {item.teacher}
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
                Matokeo ya Hivi Karibuni
              </Typography>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              {recentGrades.map((g, i) => (
                <Box key={i} sx={{ mb: i < recentGrades.length - 1 ? 2 : 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{g.subject}</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: PRIMARY }}>
                      {g.grade} · {g.marks}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={g.progress}
                    sx={{
                      height: 5,
                      borderRadius: 1,
                      bgcolor: SOFT,
                      '& .MuiLinearProgress-bar': { bgcolor: PRIMARY, borderRadius: 1 }
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card sx={{ border: `1px solid ${LINE}`, borderRadius: 1, boxShadow: 'none' }}>
            <Box sx={{ px: 2.5, py: 1.75, bgcolor: SOFT, borderBottom: `1px solid ${LINE}` }}>
              <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 17, fontWeight: 600, color: PRIMARY }}>
                Takwimu Zako
              </Typography>
            </Box>
            <CardContent sx={{ p: 2 }}>
              <Grid container spacing={1.5}>
                {quickStats.map((s, i) => (
                  <Grid item xs={6} key={i}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        p: 1.5,
                        bgcolor: SOFT,
                        border: `1px solid ${LINE}`,
                        borderRadius: 1
                      }}
                    >
                      <Box sx={{ color: PRIMARY, mb: 0.5, display: 'flex', justifyContent: 'center' }}>
                        <s.icon size={18} />
                      </Box>
                      <Typography sx={{ fontSize: 18, fontWeight: 600, color: PRIMARY }}>
                        {s.value}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: STONE, mt: 0.25 }}>
                        {s.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;