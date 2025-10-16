/**
 * Example script showing how to structure attendees data for PDF generation
 * This demonstrates the correct JSON format for the attendees field
 */

// Example 1: Basic attendees array
const basicAttendees = [
  {
    name: 'John Doe',
    agency: 'Engineering Department',
    office: 'Main Campus',
    position: 'Senior Engineer',
    attendanceStatus: 'IN_PERSON',
  },
  {
    name: 'Jane Smith',
    agency: 'Product Management',
    office: 'Remote Office',
    position: 'Product Manager',
    attendanceStatus: 'ONLINE',
  },
  {
    name: 'Bob Wilson',
    agency: 'Quality Assurance',
    office: 'Testing Lab',
    position: 'QA Lead',
    attendanceStatus: 'ABSENT',
  },
];

// Example 2: Complete attendees with signatures
const completeAttendees = [
  {
    name: 'Alice Johnson',
    agency: 'Mining Compliance Division',
    office: 'Regional Office - North',
    position: 'Compliance Officer',
    signatureUrl: 'https://storage.example.com/signatures/alice-johnson.png',
    attendanceStatus: 'IN_PERSON',
  },
  {
    name: 'Carlos Rodriguez',
    agency: 'Environmental Protection Agency',
    office: 'District 5',
    position: 'Environmental Specialist',
    signatureUrl: 'https://storage.example.com/signatures/carlos-rodriguez.png',
    attendanceStatus: 'IN_PERSON',
  },
  {
    name: 'Diana Chen',
    agency: 'Department of Natural Resources',
    office: 'Central Office',
    position: 'Resource Manager',
    signatureUrl: 'https://storage.example.com/signatures/diana-chen.png',
    attendanceStatus: 'ONLINE',
  },
];

// Example 3: Large meeting with many attendees
const largeAttendees = Array.from({ length: 50 }, (_, i) => ({
  name: `Attendee ${i + 1}`,
  agency: `Department ${(i % 5) + 1}`,
  office: `Office ${(i % 10) + 1}`,
  position: ['Manager', 'Specialist', 'Director', 'Coordinator'][i % 4],
  attendanceStatus: ['IN_PERSON', 'ONLINE', 'ABSENT'][i % 3],
}));

// Example 4: Complete attendance record for POST request
const attendanceRecordExample = {
  fileName: 'quarterly-meeting-2025.pdf',
  title: 'Q4 2025 Compliance Review Meeting',
  description:
    'Quarterly meeting to review compliance status, discuss upcoming regulations, and coordinate inter-agency efforts.',
  meetingDate: '2025-10-16T14:00:00Z',
  location: 'Conference Center, Room 301',
  reportId: '123e4567-e89b-12d3-a456-426614174000', // Replace with actual report ID
  createdById: '987fcdeb-51a2-43f7-9b3c-426614174111', // Replace with actual user ID
  attendees: completeAttendees,
};

// Example 5: Using with fetch/axios to create attendance record
async function createAttendanceWithPdf() {
  const API_URL = 'http://localhost:3000';
  const token = 'your-auth-token-here';

  try {
    // Step 1: Create the attendance record
    const createResponse = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(attendanceRecordExample),
    });

    if (!createResponse.ok) {
      throw new Error('Failed to create attendance record');
    }

    const createdRecord = await createResponse.json();
    console.log('Created attendance record:', createdRecord.id);

    // Step 2: Generate and download PDF
    const pdfResponse = await fetch(
      `${API_URL}/attendance/${createdRecord.id}/pdf`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!pdfResponse.ok) {
      throw new Error('Failed to generate PDF');
    }

    const blob = await pdfResponse.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${createdRecord.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log('PDF downloaded successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 6: React Native usage
async function downloadPdfReactNative(attendanceId: string) {
  const API_URL = 'http://localhost:3000';
  const token = 'your-auth-token-here';

  try {
    // For React Native, you'd use react-native-fs or expo-file-system
    const response = await fetch(`${API_URL}/attendance/${attendanceId}/pdf`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    // With Expo
    // const fileUri = FileSystem.documentDirectory + `attendance-${attendanceId}.pdf`;
    // await FileSystem.writeAsStringAsync(fileUri, await response.text(), {
    //   encoding: FileSystem.EncodingType.Base64,
    // });
    // await Sharing.shareAsync(fileUri);

    console.log('PDF ready for download');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Export examples
export {
  basicAttendees,
  completeAttendees,
  largeAttendees,
  attendanceRecordExample,
  createAttendanceWithPdf,
  downloadPdfReactNative,
};
