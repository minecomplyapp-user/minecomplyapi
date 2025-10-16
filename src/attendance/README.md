# Attendance Module - PDF Generation

## Overview

The Attendance module now supports generating PDF documents from attendance records. The PDFs include a formatted table of attendees with all their details.

## Features

- **Professional PDF Layout**: Clean, organized format with headers and proper spacing
- **Attendees Table**: Displays attendees in a structured table with:
  - Row numbers
  - Name
  - Agency
  - Office
  - Position
  - Attendance Status (In Person, Online, Absent)
- **Meeting Information**: Includes meeting date, location, and description
- **Auto-pagination**: Automatically creates new pages for large attendee lists
- **Styled Table**: Alternating row colors, borders, and proper alignment

## API Endpoint

### Generate PDF

**Endpoint**: `GET /attendance/:id/pdf`

**Description**: Generates a PDF document for a specific attendance record

**Parameters**:

- `id` (UUID): The ID of the attendance record

**Response**:

- Content-Type: `application/pdf`
- Returns a downloadable PDF file

**Example Request**:

```bash
curl -X GET "http://localhost:3000/attendance/123e4567-e89b-12d3-a456-426614174000/pdf" \
  -H "accept: application/pdf" \
  --output attendance.pdf
```

**Example Response**:

- Downloads a PDF file named like: `attendance_Meeting_Title_2025-10-16.pdf`

## Data Structure

### Attendee Object

Each attendee in the JSON array should have the following structure:

```json
{
  "name": "John Doe",
  "agency": "Department of Example",
  "office": "Regional Office",
  "position": "Project Manager",
  "signatureUrl": "https://example.com/signatures/john-doe.png",
  "attendanceStatus": "IN_PERSON"
}
```

### Attendance Status Values

- `IN_PERSON`: Attendee was physically present
- `ONLINE`: Attendee joined remotely
- `ABSENT`: Attendee did not attend

## Usage Examples

### 1. Create an Attendance Record

```typescript
POST /attendance
Content-Type: application/json

{
  "fileName": "meeting-attendance.pdf",
  "title": "Q4 Planning Meeting",
  "description": "Quarterly planning session for project roadmap",
  "meetingDate": "2025-10-16T14:00:00Z",
  "location": "Conference Room A",
  "reportId": "report-uuid-here",
  "createdById": "user-uuid-here",
  "attendees": [
    {
      "name": "John Doe",
      "agency": "Engineering Department",
      "office": "Main Campus",
      "position": "Senior Engineer",
      "attendanceStatus": "IN_PERSON"
    },
    {
      "name": "Jane Smith",
      "agency": "Product Management",
      "office": "Remote",
      "position": "Product Manager",
      "attendanceStatus": "ONLINE"
    }
  ]
}
```

### 2. Generate PDF

```typescript
GET /attendance/{attendance-id}/pdf
```

This will:

1. Fetch the attendance record from the database
2. Parse the JSON attendees array
3. Generate a formatted PDF with a table
4. Return the PDF as a downloadable file

### 3. Frontend Integration (React/React Native)

```typescript
const downloadAttendancePdf = async (attendanceId: string) => {
  try {
    const response = await fetch(`${API_URL}/attendance/${attendanceId}/pdf`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${attendanceId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
};
```

## PDF Customization

You can customize the PDF appearance by modifying the `PdfGeneratorService`:

### Change Table Columns

Edit the `columns` array in `addAttendeesTable()`:

```typescript
const columns: TableColumn[] = [
  { header: 'No.', key: 'name', width: 30 },
  { header: 'Name', key: 'name', width: 120 },
  { header: 'Agency', key: 'agency', width: 100 },
  // Add or remove columns here
];
```

### Change Colors

Modify colors in the `drawTableHeader()` and `drawTableRow()` methods:

```typescript
// Header background
.fillAndStroke('#E0E0E0', '#000000');

// Alternating row colors
const bgColor = rowNumber % 2 === 0 ? '#F9F9F9' : '#FFFFFF';
```

### Change Fonts and Sizes

Update font settings throughout the service:

```typescript
doc.fontSize(20).font('Helvetica-Bold'); // Header
doc.fontSize(11).font('Helvetica'); // Body text
doc.fontSize(10).font('Helvetica-Bold'); // Table headers
```

## Testing

### Test the PDF Generation

1. Create a test attendance record:

```bash
POST http://localhost:3000/attendance
```

2. Generate the PDF:

```bash
GET http://localhost:3000/attendance/{id}/pdf
```

3. Verify the PDF:
   - Check that all attendees appear in the table
   - Verify meeting information is displayed correctly
   - Ensure pagination works for large attendee lists
   - Check that the file downloads with a proper filename

## Troubleshooting

### Common Issues

**Issue**: PDF doesn't download

- **Solution**: Check that the response headers are set correctly
- **Solution**: Verify the endpoint path is correct (should be `/:id/pdf`)

**Issue**: Table formatting looks wrong

- **Solution**: Adjust column widths in the `columns` array
- **Solution**: Check that attendee data matches the expected structure

**Issue**: Missing attendees in PDF

- **Solution**: Verify the `attendees` JSON array is properly formatted
- **Solution**: Check that all required fields are present in attendee objects

**Issue**: PDF generation fails

- **Solution**: Ensure pdfkit is installed: `npm install pdfkit @types/pdfkit`
- **Solution**: Check that the attendance record exists in the database

## Dependencies

- `pdfkit`: PDF generation library
- `@types/pdfkit`: TypeScript type definitions for pdfkit

## Future Enhancements

Potential improvements for the PDF generation:

1. **Add signatures**: Display signature images from `signatureUrl`
2. **Custom branding**: Add company logo and colors
3. **Export formats**: Support other formats (Excel, CSV)
4. **Email integration**: Email PDFs directly to stakeholders
5. **Batch generation**: Generate PDFs for multiple records at once
6. **Templates**: Create different PDF templates for different meeting types
7. **Digital signatures**: Add cryptographic signatures to PDFs
8. **QR codes**: Add QR codes for verification
