export const teachersClasses = {
  'Sheikh Ahmed Ali': {
    subjects: ['Quran', 'Tajweed'],
    students: [
      { id: 'S001', name: 'Ahmed Mohammed', class: 'Darasa la 5', phone: '+255 789 012 345', attendance: 94 },
      { id: 'S002', name: 'Fatima Juma', class: 'Darasa la 5', phone: '+255 789 012 346', attendance: 88 },
      { id: 'S003', name: 'Omar Hassan', class: 'Darasa la 4', phone: '+255 789 012 347', attendance: 92 },
      { id: 'S004', name: 'Aisha Salim', class: 'Darasa la 5', phone: '+255 789 012 348', attendance: 96 },
      { id: 'S005', name: 'Yusuf Abdullah', class: 'Darasa la 4', phone: '+255 789 012 349', attendance: 85 }
    ],
    assignments: [
      { id: 'A001', title: 'Surah Al-Fatihah Revision', subject: 'Quran', dueDate: '2024-01-25', submissions: 12 },
      { id: 'A002', title: 'Makharij Al-Huruf Practice', subject: 'Tajweed', dueDate: '2024-01-28', submissions: 10 }
    ]
  },
  'Ustadh Mohammed Hassan': {
    subjects: ['Hadith', 'Fiqh'],
    students: [
      { id: 'S006', name: 'Hamisi Rajab', class: 'Darasa la 6', phone: '+255 789 012 350', attendance: 90 },
      { id: 'S007', name: 'Zainab Omar', class: 'Darasa la 6', phone: '+255 789 012 351', attendance: 87 },
      { id: 'S008', name: 'Khalid Ibrahim', class: 'Darasa la 5', phone: '+255 789 012 352', attendance: 93 }
    ],
    assignments: [
      { id: 'A003', title: 'Hadith 1-10 Memorization', subject: 'Hadith', dueDate: '2024-01-26', submissions: 8 },
      { id: 'A004', title: 'Fiqh of Tahara', subject: 'Fiqh', dueDate: '2024-01-29', submissions: 7 }
    ]
  },
  'Ustadha Fatima Noor': {
    subjects: ['Tahfeedh', 'Quran'],
    students: [
      { id: 'S009', name: 'Maryam Ahmed', class: 'Darasa la 3', phone: '+255 789 012 353', attendance: 95 },
      { id: 'S010', name: 'Hassan Ali', class: 'Darasa la 3', phone: '+255 789 012 354', attendance: 89 },
      { id: 'S011', name: 'Said Mohammed', class: 'Darasa la 4', phone: '+255 789 012 355', attendance: 91 }
    ],
    assignments: [
      { id: 'A005', title: 'Juz 28 Revision', subject: 'Tahfeedh', dueDate: '2024-01-27', submissions: 9 },
      { id: 'A006', title: 'Surah Al-Mulk Practice', subject: 'Quran', dueDate: '2024-01-30', submissions: 8 }
    ]
  }
};

export const studentGrades = {
  'S001': {
    'Quran': [
      { assignment: 'Surah Al-Fatihah', marks: 45, total: 50, grade: 'A', date: '2024-01-15' },
      { assignment: 'Surah Al-Baqarah (1-50)', marks: 42, total: 50, grade: 'A-', date: '2024-01-20' }
    ],
    'Tajweed': [
      { assignment: 'Makharij Basics', marks: 38, total: 50, grade: 'B+', date: '2024-01-18' }
    ]
  },
  'S002': {
    'Quran': [
      { assignment: 'Surah Al-Fatihah', marks: 40, total: 50, grade: 'B+', date: '2024-01-15' }
    ],
    'Tajweed': [
      { assignment: 'Makharij Basics', marks: 45, total: 50, grade: 'A', date: '2024-01-18' }
    ]
  }
};

export const teacherAnnouncements = [
  {
    id: 'ANN001',
    teacher: 'Sheikh Ahmed Ali',
    title: 'Maandalizi ya Mtihani wa Quran',
    message: 'Tafadhali jaribuni kusoma Surah Al-Baqarah aya 1-100 kwa maandalizi ya mtihani ujao.',
    date: '2024-01-22',
    subject: 'Quran'
  },
  {
    id: 'ANN002',
    teacher: 'Ustadh Mohammed Hassan',
    title: 'Mabadiliko ya Ratiba',
    message: 'Somo la Fiqh litahamishwa kutoka Jumanne hadi Alhamisi kuanzia wiki ijayo.',
    date: '2024-01-21',
    subject: 'Fiqh'
  }
];