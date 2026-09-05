import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import { Users, Phone, Mail, BookOpen, Award, Clock } from 'lucide-react';
import { teachersData, madrasaSubjects } from '../data/madrasaData';

const PRIMARY = '#18453B';
const MINT = '#a2f2d5';
const SOFT = '#E4EFE9';
const LINE = '#C5D4CC';
const STONE = '#4A554F';

const Teachers = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F0F5F2', minHeight: '100vh' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, color: PRIMARY, mb: 0.5 }}>
          Waalimu Wetu
        </Typography>
        <Typography sx={{ fontSize: 15, color: STONE }}>
          Timu ya waalimu waliohitimu na wenye uzoefu
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {(teachersData || []).map((teacher, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card
              sx={{
                height: '100%',
                border: `1px solid ${LINE}`,
                borderRadius: 1,
                boxShadow: 'none'
              }}
            >
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    mx: 'auto',
                    mb: 1.75,
                    bgcolor: PRIMARY,
                    fontSize: '1.25rem',
                    fontWeight: 600
                  }}
                >
                  {teacher.name.split(' ').map((n) => n[0]).join('')}
                </Avatar>

                <Typography sx={{ fontSize: 18, fontWeight: 600, color: PRIMARY, mb: 0.75 }}>
                  {teacher.name}
                </Typography>

                <Chip
                  label={teacher.specialization}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: 12,
                    fontWeight: 500,
                    bgcolor: SOFT,
                    color: PRIMARY,
                    border: `1px solid ${LINE}`,
                    borderRadius: 0.5,
                    mb: 1.5
                  }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mb: 1.75 }}>
                  <Clock size={14} color={PRIMARY} />
                  <Typography sx={{ fontSize: 13, color: STONE }}>
                    Uzoefu: {teacher.experience}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.75, borderColor: LINE }} />

                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: PRIMARY,
                    mb: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75
                  }}
                >
                  <BookOpen size={16} />
                  Masomo
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, justifyContent: 'center', mb: 2 }}>
                  {(teacher.subjects || []).map((subject, idx) => (
                    <Chip
                      key={idx}
                      label={subject}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: 11,
                        fontWeight: 500,
                        bgcolor: '#fff',
                        color: PRIMARY,
                        border: `1px solid ${LINE}`,
                        borderRadius: 0.5
                      }}
                    />
                  ))}
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: SOFT,
                    border: `1px solid ${LINE}`,
                    borderRadius: 1
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: STONE,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.75,
                      mb: 0.75
                    }}
                  >
                    <Phone size={13} color={PRIMARY} />
                    +255 789 012 345
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: STONE,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.75
                    }}
                  >
                    <Mail size={13} color={PRIMARY} />
                    {teacher.name.split(' ')[0].toLowerCase()}@alhuda.ac.tz
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card
        sx={{
          mt: 3,
          border: `1px solid ${LINE}`,
          borderRadius: 1,
          boxShadow: 'none',
          bgcolor: SOFT
        }}
      >
        <CardContent sx={{ py: 2.5, px: 2.5, textAlign: 'center' }}>
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 600,
              color: PRIMARY,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <Award size={18} />
            Sifa za Waalimu Wetu
          </Typography>
          <Typography sx={{ fontSize: 14, color: STONE, maxWidth: 560, mx: 'auto' }}>
            Waalimu wote wana Stashahada ya Ualimu wa Dini, wamepitia mafunzo maalum, na wana Ijaza katika masomo yao.
            Wana uzoefu wa kutosha na hamu kubwa ya kuwafundisha wanafunzi kwa upendo na uelewa.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Teachers;