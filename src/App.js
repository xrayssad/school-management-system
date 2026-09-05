import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { modernTheme } from './styles/globalStyles';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Registration from './pages/Registration';

// Student Layout & Pages
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import TimeTable from './components/timetable/TimeTable';
import Exams from './pages/Exams';
import Events from './pages/Events';
import Profile from './pages/Profile';
import Teachers from './pages/Teachers';

// Teacher Layout & Pages
import TeacherLayout from './components/layout/TeacherLayout';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherSubjects from './pages/teacher/TeacherSubjects';
import TeacherGrades from './pages/teacher/TeacherGrades';
import TeacherSchedule from './pages/teacher/TeacherSchedule';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherExams from './pages/teacher/TeacherExams';
import TeacherAnnouncements from './pages/teacher/TeacherAnnouncements';

const TeacherMessages = () => (
  <div style={{ padding: '20px' }}>
    <h2>Ujumbe</h2>
    <p>Inafanyiwa kazi</p>
  </div>
);
const TeacherReports = () => (
  <div style={{ padding: '20px' }}>
    <h2>Ripoti</h2>
    <p>Inafanyiwa kazi</p>
  </div>
);
const TeacherAnalytics = () => (
  <div style={{ padding: '20px' }}>
    <h2>Takwimu</h2>
    <p>Inafanyiwa kazi</p>
  </div>
);
const TeacherProfile = () => (
  <div style={{ padding: '20px' }}>
    <h2>Wasifu</h2>
    <p>Inafanyiwa kazi</p>
  </div>
);

function App() {
  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />

          {/* Teacher routes */}
          <Route
            path="/teacher/*"
            element={
              <TeacherLayout>
                <Routes>
                  <Route path="/dashboard" element={<TeacherDashboard />} />
                  <Route path="/students" element={<TeacherStudents />} />
                  <Route path="/subjects" element={<TeacherSubjects />} />
                  <Route path="/schedule" element={<TeacherSchedule />} />
                  <Route path="/grades" element={<TeacherGrades />} />
                  <Route path="/assignments" element={<TeacherAssignments />} />
                  <Route path="/exams" element={<TeacherExams />} />
                  <Route path="/announcements" element={<TeacherAnnouncements />} />
                  <Route path="/messages" element={<TeacherMessages />} />
                  <Route path="/reports" element={<TeacherReports />} />
                  <Route path="/analytics" element={<TeacherAnalytics />} />
                  <Route path="/profile" element={<TeacherProfile />} />
                  <Route path="/" element={<TeacherDashboard />} />
                </Routes>
              </TeacherLayout>
            }
          />

          {/* Student routes */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/timetable" element={<TimeTable />} />
                  <Route path="/exams" element={<Exams />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/teachers" element={<Teachers />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;