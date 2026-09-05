import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';

const Exams = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Exams
        </Typography>
        <Typography variant="body1">
          Exam schedules and results will be displayed here.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Exams;