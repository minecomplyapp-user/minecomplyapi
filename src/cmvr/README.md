# CMVR Report API Endpoints

## Overview

The CMVR (Compliance Monitoring Verification Report) module provides endpoints to manage CMVR reports and generate PDF documents from the stored data.

## Endpoints

### 1. Get All CMVR Reports

```http
GET /cmvr
```

**Response:**

```json
[
  {
    "id": "uuid",
    "generalInfo": { ... },
    "executiveSummaryOfCompliance": { ... },
    "complianceMonitoringReport": { ... },
    "discussions": { ... },
    "createdById": "uuid",
    "createdAt": "2025-10-18T...",
    "updatedAt": "2025-10-18T..."
  }
]
```

---

### 2. Get Single CMVR Report

```http
GET /cmvr/:id
```

**Parameters:**

- `id` - CMVR Report UUID

**Response:**

```json
{
  "id": "uuid",
  "generalInfo": { ... },
  "executiveSummaryOfCompliance": { ... },
  "complianceMonitoringReport": { ... },
  "discussions": { ... },
  "createdById": "uuid",
  "createdAt": "2025-10-18T...",
  "updatedAt": "2025-10-18T..."
}
```

---

### 3. Generate General Information PDF

```http
GET /cmvr/:id/pdf/general-info
```

**Parameters:**

- `id` - CMVR Report UUID

**Response:**

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="cmvr-general-info-{id}.pdf"`
- Binary PDF file

**Description:**
Generates a PDF document for the General Information section of the CMVR report. The PDF includes:

- Company information header
- Key-value table with general details (quarter, year, location, dates, etc.)
- ECC table (if present)
- ISAG/MPP table (if present)
- EPEP table (if present)

---

### 4. Generate General Information DOCX

```http
GET /cmvr/:id/docx/general-info
```

**Parameters:**

- `id` - CMVR Report UUID

**Response:**

- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Content-Disposition: `attachment; filename="cmvr-general-info-{id}.docx"`
- Binary DOCX file

**Description:**
Generates a DOCX (Microsoft Word) document for the General Information section of the CMVR report. The DOCX includes:

- Company information header
- Key-value table with general details (quarter, year, location, dates, etc.)
- ECC table (if present)
- ISAG/MPP table (if present)
- EPEP table (if present)

**Preview Endpoints (Development only):**

```http
GET /cmvr/preview/general-info                # PDF preview with mock data
GET /cmvr/preview/general-info-docx           # DOCX download with mock data
GET /cmvr/preview/general-info-docx/html      # DOCX as HTML preview (RECOMMENDED)
GET /cmvr/preview/general-info-docx/viewer    # Client-side DOCX viewer
```

---

## Setup & Testing

### 1. Generate Prisma Client

After schema changes, regenerate the Prisma client:

```bash
npx prisma generate
```

### 2. Run Database Migration

Ensure your database has the CMVRReport table:

```bash
npx prisma migrate dev
```

### 3. Seed Sample Data

Create a sample CMVR report in the database:

```bash
npx ts-node scripts/seed-cmvr-sample.ts
```

This will output the created report ID, which you can use to test the endpoints.

### 4. Start the Development Server

```bash
npm run start:dev
```

---

## Live Preview (Development)

### PDF Preview with Auto-Reload

Watch for changes in the PDF generator and auto-reload:

```bash
npm run cmvr:preview
```

This will:

- Open `http://localhost:3000/api/cmvr/preview/general-info` in your browser
- Watch `cmvr-pdf-generator.service.ts` for changes
- Automatically trigger regeneration when you save the file
- Display notifications in the terminal

### DOCX Preview with Auto-Reload

Watch for changes in the DOCX generator and auto-reload:

```bash
npm run cmvr:preview:docx
```

This will:

- Open `http://localhost:3000/api/cmvr/preview/general-info-docx` in your browser
- Watch `cmvr-docx-generator.service.ts` for changes
- Automatically trigger regeneration when you save the file
- Display notifications in the terminal

**Usage:**

1. Run the preview command in a terminal
2. Make changes to the generator service file
3. Save the file
4. Refresh your browser to see the updated PDF/DOCX

---

### 5. Test the Endpoints

**Get all reports:**

```bash
curl http://localhost:3000/cmvr
```

**Get specific report:**

```bash
curl http://localhost:3000/cmvr/{report-id}
```

**Download PDF:**

```bash
curl http://localhost:3000/cmvr/{report-id}/pdf/general-info -o cmvr-report.pdf
```

**Download DOCX:**

```bash
curl http://localhost:3000/cmvr/{report-id}/docx/general-info -o cmvr-report.docx
```

Or open in browser:

```
http://localhost:3000/cmvr/{report-id}/pdf/general-info
http://localhost:3000/cmvr/{report-id}/docx/general-info
```

---

## API Documentation (Swagger)

Once the server is running, visit:

```
http://localhost:3000/api
```

The CMVR endpoints will be grouped under the "CMVR" tag in the Swagger UI.

---

## Files Created

- `src/cmvr/cmvr-pdf-generator.service.ts` - PDF generation logic
- `src/cmvr/cmvr.service.ts` - Business logic for CMVR operations
- `src/cmvr/cmvr.controller.ts` - HTTP endpoints
- `src/cmvr/cmvr.module.ts` - NestJS module configuration
- `scripts/seed-cmvr-sample.ts` - Seed script for test data
- `scripts/generate-cmvr-generalinfo-pdf.ts` - Standalone PDF generator

---

## Next Steps

To expand functionality:

1. Add CREATE/UPDATE/DELETE endpoints for CMVR reports
2. Generate PDFs for other sections (executiveSummary, complianceMonitoringReport, discussions)
3. Generate complete CMVR report PDF combining all sections
4. Add DTOs for request validation
5. Add authentication/authorization guards
