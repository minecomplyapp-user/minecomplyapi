# MineComply API - API Reference

> Last Updated: December 2025  
> Base URL: `https://minecomplyapi.onrender.com/api` (Production)  
> Local Dev: `http://localhost:3000/api`

## Table of Contents

- [Authentication](#authentication)
- [Common Patterns](#common-patterns)
- [CMVR Endpoints](#cmvr-endpoints)
- [ECC Endpoints](#ecc-endpoints)
- [Attendance Endpoints](#attendance-endpoints)
- [Storage Endpoints](#storage-endpoints)
- [Health Endpoints](#health-endpoints)
- [Error Responses](#error-responses)

---

## Authentication

### Bearer Token Authentication

All endpoints (except health checks) require a valid Supabase JWT token.

**Header Format:**
```
Authorization: Bearer <supabase_access_token>
```

**Getting a Token:**
```typescript
// In mobile app
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

**Example Request:**
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
     https://minecomplyapi.onrender.com/api/cmvr
```

---

## Common Patterns

### Query Parameters

- `?fileName=<string>` - Used in POST/PATCH endpoints for file naming
- `?reportId=<uuid>` - Filter by report ID

### Response Formats

**Success:**
```json
{
  "id": "uuid",
  "data": { ... },
  "createdAt": "2025-12-03T10:00:00Z"
}
```

**Error:**
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### Pagination

Currently, pagination is not implemented. All endpoints return full result sets.

---

## CMVR Endpoints

### Create CMVR Report

**POST** `/cmvr?fileName={fileName}`

Create a new Compliance Monitoring & Validation Report.

**Query Parameters:**
- `fileName` (optional): Name for the report file

**Request Body:**
```typescript
{
  "cmvrData": {
    "generalInfo": {
      "companyName": "string",
      "location": "string",
      "quarter": "string",
      "year": "string",
      "dateOfCompliance": "string",
      // ... more fields
    },
    "executiveSummaryOfCompliance": { ... },
    "processDocumentationOfActivitiesUndertaken": { ... },
    "complianceToProjectLocationAndCoverageLimits": { ... },
    "complianceToImpactManagementCommitments": { ... },
    "airQualityImpactAssessment": { ... },
    "waterQualityImpactAssessment": { ... },
    "noiseQualityImpactAssessment": { ... },
    "complianceWithGoodPracticeInSolidAndHazardousWasteManagement": { ... },
    "complianceWithGoodPracticeInChemicalSafetyManagement": { ... },
    "complaintsVerificationAndManagement": [ ... ],
    "recommendationFromPrevQuarter": { ... },
    "recommendationForNextQuarter": { ... },
    "attendanceId": "uuid"
  },
  "attachments": [
    {
      "path": "uploads/image.jpg",
      "caption": "Site photo"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "fileName": "Q3_2025_CMVR",
  "cmvrData": { ... },
  "attachments": [ ... ],
  "createdById": "user-uuid",
  "createdAt": "2025-12-03T10:00:00Z",
  "updatedAt": "2025-12-03T10:00:00Z"
}
```

---

### Get All CMVR Reports

**GET** `/cmvr`

Retrieve all CMVR reports.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "fileName": "Q3_2025_CMVR",
    "createdById": "user-uuid",
    "createdAt": "2025-12-03T10:00:00Z"
  }
]
```

---

### Get CMVR Reports by User

**GET** `/cmvr/user/:userId`

Retrieve all CMVR reports created by a specific user.

**Parameters:**
- `userId` (path): User UUID

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "fileName": "Q3_2025_CMVR",
    "cmvrData": { ... },
    "createdById": "user-uuid",
    "createdAt": "2025-12-03T10:00:00Z"
  }
]
```

---

### Get CMVR Report by ID

**GET** `/cmvr/:id`

Retrieve a specific CMVR report.

**Parameters:**
- `id` (path): Report UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "fileName": "Q3_2025_CMVR",
  "cmvrData": { ... },
  "attachments": [ ... ],
  "createdById": "user-uuid",
  "createdBy": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe"
  },
  "createdAt": "2025-12-03T10:00:00Z",
  "updatedAt": "2025-12-03T10:00:00Z"
}
```

---

### Update CMVR Report

**PATCH** `/cmvr/:id?fileName={fileName}`

Update an existing CMVR report (replaces cmvrData).

**Parameters:**
- `id` (path): Report UUID
- `fileName` (query, optional): Updated file name

**Request Body:**
Same as Create CMVR Report

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "fileName": "Q3_2025_CMVR_Updated",
  "cmvrData": { ... },
  "updatedAt": "2025-12-03T11:00:00Z"
}
```

---

### Delete CMVR Report

**DELETE** `/cmvr/:id`

Delete a CMVR report.

**Parameters:**
- `id` (path): Report UUID

**Response:** `204 No Content`

---

### Duplicate CMVR Report

**POST** `/cmvr/:id/duplicate`

Create a copy of an existing CMVR report.

**Parameters:**
- `id` (path): Report UUID to duplicate

**Response:** `201 Created`
```json
{
  "id": "new-uuid",
  "fileName": "Q3_2025_CMVR (Copy)",
  "cmvrData": { ... },
  "createdAt": "2025-12-03T12:00:00Z"
}
```

---

### Generate CMVR DOCX

**GET** `/cmvr/:id/docx`

Generate and download a DOCX document for a CMVR report.

**Parameters:**
- `id` (path): Report UUID

**Response:** `200 OK`
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Content-Disposition: `attachment; filename="<fileName>.docx"`

**Note:** This endpoint is marked as `@Public()` to allow direct browser downloads without token expiration issues.

---

### Preview CMVR PDF (Development)

**GET** `/cmvr/preview/general-info`

Generate a preview PDF with mock data (for development/testing).

**Response:** `200 OK`
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="cmvr-preview.pdf"`

---

### Preview CMVR DOCX (Development)

**GET** `/cmvr/preview/general-info-docx`

Generate a preview DOCX with mock data (for development/testing).

**Response:** `200 OK`
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

---

## ECC Endpoints

### Create ECC Report

**POST** `/ecc/createEccReport`

Create a new Environmental Compliance Certificate report.

**Request Body:**
```typescript
{
  "generalInfo": {
    "companyName": "string",
    "status": "Complied" | "Partially Complied" | "Not Complied",
    "date": "2025-12-03T10:00:00Z"
  },
  "mmtInfo": {
    "contactPerson": "string",
    "position": "string",
    "mailingAddress": "string",
    "telNo": "string",
    "faxNo": "string",
    "emailAddress": "string"
  },
  "permit_holders": ["Permit Holder 1", "Permit Holder 2"],
  "permit_holder_with_conditions": {
    "permit_holders": [ ... ]
  },
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "createdById": "user-uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "generalInfo": { ... },
  "mmtInfo": { ... },
  "permit_holders": [ ... ],
  "recommendations": [ ... ],
  "filename": "ECC_Report_2025",
  "createdAt": "2025-12-03T10:00:00Z"
}
```

---

### Get All ECC Reports by User

**GET** `/ecc/getAllEccReports/:createdById`

Retrieve all ECC reports created by a specific user.

**Parameters:**
- `createdById` (path): User UUID or email

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "generalInfo": { ... },
    "filename": "ECC_Report_2025",
    "createdAt": "2025-12-03T10:00:00Z"
  }
]
```

---

### Get ECC Report by ID

**GET** `/ecc/getEccReportById/:id`

Retrieve a specific ECC report.

**Parameters:**
- `id` (path): Report UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "generalInfo": { ... },
  "mmtInfo": { ... },
  "permit_holders": [ ... ],
  "recommendations": [ ... ],
  "createdAt": "2025-12-03T10:00:00Z"
}
```

---

### Update ECC Condition

**PATCH** `/ecc/condition/:conditionId`

Update a specific ECC condition.

**Parameters:**
- `conditionId` (path): Condition ID (BigInt)

**Request Body:**
```typescript
{
  "condition": "string",
  "status": "Complied" | "Partially Complied" | "Not Complied",
  "remarks": "string",
  "remark_list": ["Remark 1", "Remark 2"]
}
```

**Response:** `200 OK`
```json
{
  "id": 123,
  "condition": "Updated condition text",
  "status": "Complied",
  "remarks": "Notes about compliance"
}
```

---

### Add ECC Condition

**POST** `/ecc/addCondition/:reportId`

Add a new condition to an ECC report.

**Parameters:**
- `reportId` (path): Report UUID

**Request Body:**
```typescript
{
  "condition": "string",
  "status": "Complied",
  "remarks": "string",
  "section": 1,
  "nested_to": 2 // Optional: parent condition ID
}
```

**Response:** `201 Created`
```json
{
  "id": 124,
  "condition": "New condition",
  "status": "Complied",
  "ECCReportID": "report-uuid"
}
```

---

### Remove ECC Condition

**DELETE** `/ecc/condition/:conditionId`

Delete an ECC condition.

**Parameters:**
- `conditionId` (path): Condition ID (BigInt)

**Response:** `204 No Content`

---

### Generate ECC PDF

**GET** `/ecc/generateEccPdf/:id`

Generate a PDF document for an ECC report.

**Parameters:**
- `id` (path): Report UUID

**Response:** `200 OK`
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="ecc<id>.pdf"`

---

### Generate ECC Word Document

**GET** `/ecc/generateEccWord/:id`

Generate a Word document for an ECC report.

**Parameters:**
- `id` (path): Report UUID

**Response:** `200 OK`
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Content-Disposition: `attachment; filename="<fileName>.docx"`

---

### Create ECC and Generate Documents

**POST** `/ecc/createEccAndGenerateDocs`

Create an ECC report and immediately generate PDF/DOCX documents.

**Request Body:**
Same as Create ECC Report

**Response:** `201 Created`
```json
{
  "report": { ... },
  "pdfUrl": "https://...",
  "docxUrl": "https://..."
}
```

---

### Duplicate ECC Report

**POST** `/ecc/:id/duplicate`

Create a copy of an existing ECC report.

**Parameters:**
- `id` (path): Report UUID to duplicate

**Response:** `201 Created`

---

## Attendance Endpoints

### Create Attendance Record

**POST** `/attendance`

Create a new attendance record for a meeting.

**Request Body:**
```typescript
{
  "fileName": "string",
  "title": "string",
  "description": "string",
  "meetingDate": "2025-12-03T10:00:00Z",
  "location": "string",
  "attendees": [
    {
      "name": "John Doe",
      "organization": "MMT",
      "position": "Inspector",
      "signature": "data:image/png;base64,..."
    }
  ],
  "reportId": "uuid", // Optional
  "createdById": "user-uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "fileName": "MMT_Meeting_Q3_2025",
  "title": "Quarterly Monitoring Meeting",
  "attendees": [ ... ],
  "createdAt": "2025-12-03T10:00:00Z"
}
```

---

### Get All Attendance Records

**GET** `/attendance?reportId={reportId}`

Retrieve all attendance records, optionally filtered by report ID.

**Query Parameters:**
- `reportId` (optional): Filter by report UUID

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "fileName": "MMT_Meeting_Q3_2025",
    "title": "Quarterly Monitoring Meeting",
    "meetingDate": "2025-12-03T10:00:00Z",
    "createdAt": "2025-12-03T10:00:00Z"
  }
]
```

---

### Get Attendance Records by Report

**GET** `/attendance/report/:reportId`

Get all attendance records linked to a specific report.

**Parameters:**
- `reportId` (path): Report UUID

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "fileName": "MMT_Meeting_Q3_2025",
    "reportId": "report-uuid",
    "attendees": [ ... ]
  }
]
```

---

### Get Attendance Records by Creator

**GET** `/attendance/creator/:createdById`

Get all attendance records created by a specific user.

**Parameters:**
- `createdById` (path): User UUID

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "fileName": "MMT_Meeting_Q3_2025",
    "createdById": "user-uuid",
    "createdAt": "2025-12-03T10:00:00Z"
  }
]
```

---

### Get Attendance Record by ID

**GET** `/attendance/:id`

Retrieve a specific attendance record.

**Parameters:**
- `id` (path): Attendance record UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "fileName": "MMT_Meeting_Q3_2025",
  "title": "Quarterly Monitoring Meeting",
  "description": "Meeting notes",
  "meetingDate": "2025-12-03T10:00:00Z",
  "location": "Site Office",
  "attendees": [ ... ],
  "reportId": "uuid",
  "createdBy": {
    "id": "user-uuid",
    "email": "user@example.com"
  },
  "createdAt": "2025-12-03T10:00:00Z"
}
```

---

### Update Attendance Record

**PATCH** `/attendance/:id`

Update an existing attendance record.

**Parameters:**
- `id` (path): Attendance record UUID

**Request Body:**
Partial update of attendance fields

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "fileName": "MMT_Meeting_Q3_2025_Updated",
  "updatedAt": "2025-12-03T11:00:00Z"
}
```

---

### Delete Attendance Record

**DELETE** `/attendance/:id`

Delete an attendance record.

**Parameters:**
- `id` (path): Attendance record UUID

**Response:** `200 OK`
```json
{
  "message": "Attendance record deleted successfully"
}
```

---

### Generate Attendance PDF

**GET** `/attendance/:id/pdf`

Generate a PDF for an attendance record.

**Parameters:**
- `id` (path): Attendance record UUID

**Response:** `200 OK`
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="<fileName>.pdf"`

---

### Generate Attendance DOCX

**GET** `/attendance/:id/docx`

Generate a DOCX for an attendance record.

**Parameters:**
- `id` (path): Attendance record UUID

**Response:** `200 OK`
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Content-Disposition: `attachment; filename="<fileName>.docx"`

---

### Duplicate Attendance Record

**POST** `/attendance/:id/duplicate`

Create a copy of an existing attendance record.

**Parameters:**
- `id` (path): Attendance record UUID

**Response:** `201 Created`
```json
{
  "id": "new-uuid",
  "fileName": "MMT_Meeting_Q3_2025 (Copy)",
  "createdAt": "2025-12-03T12:00:00Z"
}
```

---

## Storage Endpoints

### Create Signed Upload URL

**POST** `/storage/upload-url`

Generate a signed URL for uploading files to Supabase Storage.

**Request Body:**
```typescript
{
  "filename": "report-image.jpg",
  "upsert": false // Optional: overwrite existing file
}
```

**Response:** `200 OK`
```json
{
  "url": "https://storage.supabase.co/...",
  "path": "uploads/report-image-12345.jpg",
  "token": "signed-token"
}
```

**Usage Flow:**
1. Call this endpoint to get signed URL
2. Upload file to the returned URL using PUT request
3. Store the returned `path` in your database

---

### Create Signed Download URL

**POST** `/storage/download-url`

Generate a signed URL for downloading files from Supabase Storage.

**Request Body:**
```typescript
{
  "path": "uploads/report-image.jpg",
  "expiresIn": 60 // Optional: expiry in seconds (default: 60)
}
```

**Response:** `200 OK`
```json
{
  "url": "https://storage.supabase.co/...?token=..."
}
```

---

### Delete Files

**POST** `/storage/delete-files`

Delete multiple files from Supabase Storage.

**Request Body:**
```typescript
{
  "paths": [
    "uploads/file1.jpg",
    "uploads/file2.pdf"
  ]
}
```

**Response:** `200 OK`
```json
{
  "deleted": 2,
  "failed": 0
}
```

---

### Test Storage Authentication

**POST** `/storage/test-auth`

Test endpoint to verify storage authentication is working.

**Response:** `200 OK`
```json
{
  "message": "Storage authentication successful",
  "user": { ... },
  "timestamp": "2025-12-03T10:00:00Z"
}
```

---

## Health Endpoints

All health endpoints are **public** (no authentication required).

### General Health Check

**GET** `/health`

Get general health status of the API.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "environment": "production",
  "service": "MineComply API",
  "time": "2025-12-03T10:00:00Z"
}
```

---

### Liveness Probe

**GET** `/health/live`

Check if the application is running (used by deployment platforms).

**Response:** `200 OK`
```json
{
  "status": "live",
  "uptime": 123456.78
}
```

---

### Readiness Probe

**GET** `/health/ready`

Check if the application and its dependencies are ready to serve requests.

**Response:** `200 OK`
```json
{
  "status": "ready",
  "dependencies": {
    "supabaseAuth": true,
    "supabaseStorage": true
  }
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PATCH, or POST |
| 201 | Created | Resource created successfully |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 500 | Internal Server Error | Unexpected server error |

### Validation Errors

When DTO validation fails:

```json
{
  "statusCode": 400,
  "message": [
    "cmvrData should not be empty",
    "cmvrData must be an object"
  ],
  "error": "Bad Request"
}
```

### Authentication Errors

**Missing Token:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Invalid Token:**
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

---

## Swagger/OpenAPI Documentation

Interactive API documentation is available at:

**Development:**
```
http://localhost:3000/api/docs
```

**Production:**
```
https://minecomplyapi.onrender.com/api/docs
```

The Swagger UI allows you to:
- View all endpoints and schemas
- Test endpoints directly from the browser
- See request/response examples
- Download OpenAPI specification

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider implementing rate limiting in production for:
- Upload endpoints
- Document generation endpoints
- Authentication-related endpoints

---

## Versioning

The API currently does not use versioning. Future versions may use:
- URL versioning: `/api/v2/cmvr`
- Header versioning: `Accept: application/vnd.minecomply.v2+json`

---

## Support

For API issues or questions:
- Check the [Development Guide](DEVELOPMENT_GUIDE.md)
- Review the [Architecture Documentation](ARCHITECTURE.md)
- Contact the development team

