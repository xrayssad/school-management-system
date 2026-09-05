export const madrasaSubjects = {
  'Quran': { color: '#2E7D32', icon: '📖', type: 'quran' },
  'Tajweed': { color: '#1976D2', icon: '🎵', type: 'tajweed' },
  'Hadith': { color: '#D32F2F', icon: '📚', type: 'hadith' },
  'Tahfeedh': { color: '#ED6C02', icon: '💫', type: 'tahfeedh' },
  'Sira': { color: '#9C27B0', icon: '🕌', type: 'sira' },
  'Fiqh': { color: '#0097A7', icon: '⚖️', type: 'fiqh' },
  'Aqeedah': { color: '#757575', icon: '🌟', type: 'aqeedah' },
  'Arabic': { color: '#388E3C', icon: '🔤', type: 'arabic' },
  'Tafsir': { color: '#7B1FA2', icon: '📖', type: 'tafsir' }
};

export const teachersData = [
  { name: 'Sheikh Ahmed Ali', subjects: ['Quran', 'Tajweed'], experience: '15 years', specialization: 'Quran & Tajweed' },
  { name: 'Ustadh Mohammed Hassan', subjects: ['Hadith', 'Fiqh'], experience: '12 years', specialization: 'Islamic Law' },
  { name: 'Ustadha Fatima Noor', subjects: ['Tahfeedh', 'Quran'], experience: '10 years', specialization: 'Quran Memorization' },
  { name: 'Sheikh Ibrahim Omar', subjects: ['Sira', 'Aqeedah'], experience: '18 years', specialization: 'Islamic History' },
  { name: 'Ustadh Yusuf Abdullah', subjects: ['Arabic', 'Tafsir'], experience: '8 years', specialization: 'Arabic Language' }
];

export const weeklyTimetable = {
  'Monday': [
    { subject: 'Quran', teacher: 'Sheikh Ahmed Ali', time: '08:00 - 09:00', room: 'Masjid Kubwa', type: 'quran' },
    { subject: 'Tajweed', teacher: 'Sheikh Ahmed Ali', time: '09:15 - 10:15', room: 'Chumba 1', type: 'tajweed' },
    { subject: 'Hadith', teacher: 'Ustadh Mohammed Hassan', time: '10:30 - 11:30', room: 'Chumba 2', type: 'hadith' },
    { subject: 'Break', teacher: '', time: '11:45 - 12:00', room: '', type: 'break' },
    { subject: 'Tahfeedh', teacher: 'Ustadha Fatima Noor', time: '12:00 - 13:00', room: 'Hifdh Room', type: 'tahfeedh' }
  ],
  'Tuesday': [
    { subject: 'Sira', teacher: 'Sheikh Ibrahim Omar', time: '08:00 - 09:00', room: 'Chumba 3', type: 'sira' },
    { subject: 'Fiqh', teacher: 'Ustadh Mohammed Hassan', time: '09:15 - 10:15', room: 'Chumba 2', type: 'fiqh' },
    { subject: 'Arabic', teacher: 'Ustadh Yusuf Abdullah', time: '10:30 - 11:30', room: 'Chumba 1', type: 'arabic' },
    { subject: 'Break', teacher: '', time: '11:45 - 12:00', room: '', type: 'break' },
    { subject: 'Quran', teacher: 'Sheikh Ahmed Ali', time: '12:00 - 13:00', room: 'Masjid Kubwa', type: 'quran' }
  ],
  'Wednesday': [
    { subject: 'Tafsir', teacher: 'Ustadh Yusuf Abdullah', time: '08:00 - 09:00', room: 'Chumba 3', type: 'tafsir' },
    { subject: 'Aqeedah', teacher: 'Sheikh Ibrahim Omar', time: '09:15 - 10:15', room: 'Chumba 2', type: 'aqeedah' },
    { subject: 'Tahfeedh', teacher: 'Ustadha Fatima Noor', time: '10:30 - 11:30', room: 'Hifdh Room', type: 'tahfeedh' },
    { subject: 'Break', teacher: '', time: '11:45 - 12:00', room: '', type: 'break' },
    { subject: 'Tajweed', teacher: 'Sheikh Ahmed Ali', time: '12:00 - 13:00', room: 'Chumba 1', type: 'tajweed' }
  ],
  'Thursday': [
    { subject: 'Hadith', teacher: 'Ustadh Mohammed Hassan', time: '08:00 - 09:00', room: 'Chumba 2', type: 'hadith' },
    { subject: 'Fiqh', teacher: 'Ustadh Mohammed Hassan', time: '09:15 - 10:15', room: 'Chumba 2', type: 'fiqh' },
    { subject: 'Sira', teacher: 'Sheikh Ibrahim Omar', time: '10:30 - 11:30', room: 'Chumba 3', type: 'sira' },
    { subject: 'Break', teacher: '', time: '11:45 - 12:00', room: '', type: 'break' },
    { subject: 'Quran', teacher: 'Sheikh Ahmed Ali', time: '12:00 - 13:00', room: 'Masjid Kubwa', type: 'quran' }
  ],
  'Friday': [
    { subject: 'Jumuah Prayer', teacher: 'All Teachers', time: '12:00 - 13:30', room: 'Masjid Kubwa', type: 'prayer' },
    { subject: 'Islamic Workshop', teacher: 'Guest Speaker', time: '14:00 - 15:30', room: 'Hall Kuu', type: 'workshop' }
  ]
};

export const studentProgress = {
  'Quran': { grade: 'A', marks: '88/100', progress: 88, lastTest: 'Surah Al-Baqarah' },
  'Tajweed': { grade: 'B+', marks: '82/100', progress: 82, lastTest: 'Makharij Al-Huruf' },
  'Hadith': { grade: 'A-', marks: '85/100', progress: 85, lastTest: '40 Hadith Nawawi' },
  'Tahfeedh': { grade: 'A', marks: '92/100', progress: 92, lastTest: 'Juz 28' },
  'Sira': { grade: 'B+', marks: '80/100', progress: 80, lastTest: 'Life of Prophet' }
};