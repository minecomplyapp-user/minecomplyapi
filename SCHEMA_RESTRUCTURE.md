# Database Schema Restructure - CMVR Reports

## Date: October 18, 2025

## Changes Made

### 1. Removed `Submission` Table

- The generic `Submission` table has been removed
- The `SubmissionType` enum has been removed

### 2. Created `ECCReport` Table

- **Purpose**: Store ECC (Environmental Compliance Certificate) monitoring reports
- **Fields**:
  - `id` (String, UUID, Primary Key)
  - `generalInfo` (JSON) - General information about the report
  - `mmtInfo` (JSON) - MMT-related information
  - `monitoringData` (JSON) - Monitoring data and metrics
  - `createdById` (String, Foreign Key to User)
  - `createdBy` (User relation)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)

### 3. Created `CMVRReport` Table

- **Purpose**: Store CMVR (Compliance Monitoring Verification Report) reports
- **Fields**:
  - `id` (String, UUID, Primary Key)
  - `generalInfo` (JSON) - Company Name, Location, Quarter, Year, Date of Compliance, Monitoring Period, Date of Submission
  - `executiveSummaryOfCompliance` (JSON) - Executive summary section
  - `complianceMonitoringReport` (JSON) - ECC, ISAG/MPP, EPEP/FMRDP, RCF/MTF/FMRDF data
  - `discussions` (JSON) - Discussions and findings
  - `createdById` (String, Foreign Key to User)
  - `createdBy` (User relation)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)

### 4. Updated `User` Model

- Replaced `createdSubmissions` relation with:
  - `createdECCReports` - One-to-many relation with ECCReport
  - `createdCMVRReports` - One-to-many relation with CMVRReport

## CMVR Report Structure

The `CMVRReport` table is designed to store the following information:

### `generalInfo` JSON Field Structure:

```json
{
  "companyName": "string",
  "location": "string",
  "quarter": "string",
  "year": "string",
  "dateOfCompliance": "string",
  "monitoringPeriod": "string",
  "dateOfSubmission": "string"
}
```

### `executiveSummaryOfCompliance` JSON Field:

```json
{
  "summary": "string",
  "keyFindings": ["string"],
  "recommendations": ["string"]
}
```

### `complianceMonitoringReport` JSON Field Structure:

```json
{
  "ecc": {
    "permitHolder": "string",
    "eccNumber": "string",
    "dateOfIssuance": "string",
    "additionalForms": [
      {
        "permitHolder": "string",
        "eccNumber": "string",
        "dateOfIssuance": "string"
      }
    ]
  },
  "isag": {
    "permitHolder": "string",
    "isagNumber": "string",
    "dateOfIssuance": "string",
    "currentName": "string",
    "nameInECC": "string",
    "projectStatus": "string",
    "gpsCoordinates": {
      "x": "string",
      "y": "string"
    },
    "proponent": {
      "name": "string",
      "contact": "string",
      "address": "string",
      "phone": "string",
      "email": "string"
    },
    "additionalForms": []
  },
  "epep": {
    "isNA": false,
    "permitHolder": "string",
    "epepNumber": "string",
    "dateOfApproval": "string",
    "additionalForms": []
  },
  "funds": {
    "rcf": {
      "permitHolder": "string",
      "savingsAccount": "string",
      "amountDeposited": "string",
      "dateUpdated": "string",
      "additionalForms": []
    },
    "mtf": {
      "permitHolder": "string",
      "savingsAccount": "string",
      "amountDeposited": "string",
      "dateUpdated": "string",
      "additionalForms": []
    },
    "fmrdf": {
      "permitHolder": "string",
      "savingsAccount": "string",
      "amountDeposited": "string",
      "dateUpdated": "string",
      "additionalForms": []
    }
  },
  "mmt": {
    "contactPerson": "string",
    "mailingAddress": "string",
    "phoneNumber": "string",
    "emailAddress": "string"
  }
}
```

### `discussions` JSON Field:

```json
{
  "findings": "string",
  "analysis": "string",
  "conclusions": "string",
  "recommendations": "string"
}
```

## Migration Details

- **Migration Name**: `20251018144942_restructure_submissions_to_ecc_and_cmvr_reports`
- **Location**: `prisma/migrations/20251018144942_restructure_submissions_to_ecc_and_cmvr_reports/migration.sql`
- **Status**: ✅ Applied Successfully

## Next Steps

1. ✅ Create DTOs for CMVR Report CRUD operations
2. ✅ Create NestJS module for CMVR Reports
3. ✅ Create service layer for business logic
4. ✅ Create controller with REST endpoints
5. ✅ Add validation using class-validator
6. ✅ Add Swagger documentation
7. ✅ Create unit tests

## Notes

- The schema uses flexible JSON fields to accommodate various report structures
- Indexes are created on `createdById` for both tables to optimize queries
- The schema maintains backward compatibility with the User model
- Timestamps (`createdAt`, `updatedAt`) are automatically managed by Prisma
