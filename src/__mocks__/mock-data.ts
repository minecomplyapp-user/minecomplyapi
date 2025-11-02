// Mock data for AttendanceRecord and Submission

export const mockAttendanceRecord = {
  id: 'mock-attendance-1',
  reportId: 'mock-report-1',
  createdById: 'mock-user-1',
  fileName: 'oct_2025.pdf',
  title: 'October 2025 Meeting Attendance',
  description: 'Attendance for the October 2025 meeting.',
  meetingDate: new Date('2025-10-13T09:00:00Z'),
  location: 'Conference Room A',
  attendees: [
    {
      name: 'Alice Smith',
      agency: 'DENR',
      office: 'Environmental Monitoring',
      position: 'Inspector',
      signatureUrl: 'https://example.com/signatures/alice.png',
      attendanceStatus: 'IN_PERSON',
    },
    {
      name: 'Bob Lee',
      agency: 'LGU',
      office: 'City Hall',
      position: 'Staff',
      signatureUrl: 'https://example.com/signatures/bob.png',
      attendanceStatus: 'ONLINE',
    },
    {
      name: 'Carol Tan',
      agency: 'Proponent',
      office: 'Mining Operations',
      position: 'Manager',
      signatureUrl: 'https://example.com/signatures/carol.png',
      attendanceStatus: 'ABSENT',
    },
  ],
  createdAt: new Date('2025-10-13T09:05:00Z'),
  updatedAt: new Date('2025-10-13T09:05:00Z'),
};

export const mockSubmission = {
  id: 'mock-submission-1',
  type: 'ECC_MONITORING',
  generalInfo: {
    projectName: 'Mine Expansion 2025',
    location: 'Region IV',
    proponent: 'Acme Mining Corp.',
  },
  mmtInfo: {
    mmtLeader: 'Alice Smith',
    members: ['Bob Lee', 'Carol Tan'],
  },
  monitoringData: {
    airQuality: 'Good',
    waterQuality: 'Acceptable',
    noiseLevel: 'Low',
  },
  createdById: 'mock-user-2',
  createdBy: {
    id: 'mock-user-2',
    displayName: 'Juan Dela Cruz',
    email: 'juan@example.com',
    role: 'PROPONENT',
  },
};
