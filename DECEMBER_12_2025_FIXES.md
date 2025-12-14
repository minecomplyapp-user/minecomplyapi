# December 12, 2025 - Backend Updates and API Changes

**Date:** December 12, 2025, 11:00 AM  
**Status:** ✅ Completed  
**Repository:** minecomplyapi (Backend)

---

## Overview

This document tracks all backend API updates and changes completed on December 12, 2025, to support frontend features and bug fixes.

---

## 🔧 API Updates

### 1. Permit Holder Type Selection Support (Item 12)

**Requirement:** Add support for "single" vs "multiple" permit holder report types in CMVR data structure.

**Files Modified:**

#### 1.1. `minecomplyapi/src/cmvr/cmvr-pdf-generator.service.ts`

**Changes Made:**
- Added `permitHolderType?: 'single' | 'multiple'` to `CMVRGeneralInfo` interface
- Added comment in `generateGeneralInfoPdf` indicating where format differences should be handled
- Variable `permitHolderType` extracted from `generalInfo` for future use

**Code Location:**
```typescript
export interface CMVRGeneralInfo {
  // ✅ NEW: Permit holder type selection (single vs multiple)
  permitHolderType?: 'single' | 'multiple';
  // ... rest of interface
}
```

**Status:** ✅ Interface updated. Format logic pending specification.

---

#### 1.2. `minecomplyapi/src/cmvr/cmvr-docx-generator.service.ts`

**Changes Made:**
- Added `permitHolderType` variable extraction in `generateFullReportDocx`
- Added comment indicating where format differences should be handled for single vs multiple permit holders

**Code Location:**
```typescript
// ✅ NEW: Permit holder type handling
// For single permit holder: Standard format
// For multiple permit holders: May need per-permit-holder sections or grouped format
const permitHolderType = info.permitHolderType || 'single';
```

**Status:** ✅ Variable extraction added. Format logic pending specification.

---

#### 1.3. `minecomplyapi/src/cmvr/dto/create-cmvr.dto.ts`

**Changes Made:**
- Added `permitHolderType` field to `CreateCMVRDto` class
- Added API property decorator with enum validation
- Added validation decorators (`@IsOptional()`, `@IsEnum(['single', 'multiple'])`)
- Default value: `'single'` for backward compatibility

**Code Location:**
```typescript
// ✅ NEW: Permit holder type selection (single vs multiple)
@ApiProperty({
  enum: ['single', 'multiple'],
  required: false,
  description: 'Type of permit holder report: single or multiple',
  default: 'single',
})
@IsOptional()
@IsEnum(['single', 'multiple'])
permitHolderType?: 'single' | 'multiple';
```

**Status:** ✅ DTO updated with validation.

---

## 📋 API Endpoints

### Guest Remarks Endpoint

**Endpoint:** `POST /api/guest-remarks`

**Expected Payload Structure (matching Google Form):**
```typescript
{
  fullName: string;                    // Required
  agency: string;                      // Required (MGB, EMB, LGU, CENRO, PENRO, NGO, COMPANY, or custom)
  position: string;                     // Required
  dateOfMonitoring: string;            // Required (YYYY-MM-DD format)
  siteCompanyMonitored: string;        // Required
  observations?: string | null;        // Optional
  issuesConcerns?: string | null;      // Optional
  recommendations: string;             // Required
  reportId?: string | null;            // Optional (for linking to reports)
  reportType?: string | null;         // Optional (CMVR, ECC)
  createdById?: string | null;         // Optional (user ID)
  createdByEmail?: string | null;      // Optional (user email)
}
```

**Status:** ⚠️ **Note:** This endpoint may need to be created in the backend if it doesn't exist yet. Frontend is ready to call it.

---

## 🔄 Data Model Changes

### CMVR Report Data Structure

**New Field Added:**
- `permitHolderType`: `'single' | 'multiple' | undefined`
  - Location: Top level of `CMVRGeneralInfo`
  - Default: `'single'` (for backward compatibility)
  - Purpose: Determines document format structure

**Backward Compatibility:**
- ✅ Existing reports without `permitHolderType` default to `'single'`
- ✅ All existing functionality remains unchanged
- ✅ New field is optional in DTO validation

---

## 📝 Implementation Notes

### Document Generation Format Differences

**Current Status:** Infrastructure added, format logic pending specification.

**What's Needed:**
1. **Format Specification:**
   - Define structure differences between single and multiple permit holder formats
   - Specify section ordering and repetition rules
   - Define table structures for each format

2. **Implementation Points:**
   - PDF generation: `minecomplyapi/src/cmvr/cmvr-pdf-generator.service.ts`
   - DOCX generation: `minecomplyapi/src/cmvr/cmvr-docx-generator.service.ts`
   - Section helpers: `minecomplyapi/src/cmvr/cmvr-sections/*.helper.ts`

**Example Implementation Pattern (to be completed):**
```typescript
if (permitHolderType === 'multiple') {
  // Generate per-permit-holder sections
  // Repeat certain sections for each permit holder
} else {
  // Generate standard single-permit-holder format
  // Current format structure
}
```

---

## 🧪 Testing Recommendations

1. **Permit Holder Type:**
   - Test API accepts both 'single' and 'multiple' values
   - Test default behavior when field is missing
   - Test enum validation rejects invalid values
   - Test document generation with both types (once format is specified)

2. **Guest Remarks Endpoint:**
   - Verify endpoint exists and accepts new payload structure
   - Test all required field validations
   - Test optional fields can be null
   - Test date format (YYYY-MM-DD)

3. **Backward Compatibility:**
   - Test existing reports without `permitHolderType` still work
   - Test document generation for existing reports
   - Verify no breaking changes to existing API contracts

---

## 📊 Summary

| Category | Count |
|----------|-------|
| Interface Updates | 1 |
| DTO Updates | 1 |
| Service Updates | 2 |
| New Fields Added | 1 |
| Total Changes | 4 |

---

## 🚀 Next Steps

1. **Create Guest Remarks Endpoint (if needed):**
   - Create `POST /api/guest-remarks` endpoint
   - Create DTO for guest remarks payload
   - Create service method to save remarks
   - Create database table/model if needed

2. **Complete Permit Holder Type Format Logic:**
   - Receive format specification from client
   - Implement format differences in PDF generator
   - Implement format differences in DOCX generator
   - Test both formats with sample data

3. **Database Migration (if needed):**
   - Add `permitHolderType` column to CMVR reports table (if storing in DB)
   - Or ensure it's stored in JSON `cmvrData` field

---

## 📅 Change Log

- **December 12, 2025, 02:30 AM:** CMVR DOCX export now appends the uploaded ECC Conditions DOCX as a true appendix (preserves original DOCX content via merge), with safe fallback if merge/download fails.
  - Updated `src/cmvr/cmvr-docx-generator.service.ts` to:
    - prefetch `eccConditionsAttachment` DOCX
    - merge `[CMVR docx] + [appendix header docx] + [ECC docx]` when possible
    - fall back to the previous mammoth-based appendix rendering when merge cannot be done
  - Added npm override so `docx-merger` uses JSZip 2.6.1 (required for docx-merger compatibility).
  - Added a small Jest test: `src/cmvr/docx-merger.spec.ts`.
- **December 12, 2025, 11:00 AM:** Initial documentation created
- Added `permitHolderType` support to CMVR interface and DTO
- Added comments in document generators for future format logic
- **December 12, 2025, Afternoon:** No backend changes required for date picker conversions (frontend-only changes)
- All changes are backward compatible

---

## 📝 Notes on Frontend Date Picker Changes

**Date:** December 12, 2025, Afternoon

**Status:** ✅ No backend changes required

The frontend team converted all date TextInput fields to proper date pickers across CMVR report creation screens. These changes are purely frontend UI improvements and do not require any backend API changes.

**What Changed (Frontend Only):**
- All date fields now use `react-native-modal-datetime-picker`
- Dates are formatted as "MM/DD/YYYY" strings before being sent to backend
- Date parsing/formatting handled client-side
- No changes to API payload structure or date format expectations

**Backend Impact:**
- ✅ No API changes required
- ✅ Existing date field handling remains unchanged
- ✅ Date format expectations remain the same (string format)
- ✅ All existing endpoints continue to work as before

---

## 🔗 Related Frontend Changes

See `minecomplyapp/DECEMBER_12_2025_FIXES.md` for corresponding frontend changes.

---

## 👥 Contributors

- AI Assistant (Auto) - Implementation and documentation
- User - Requirements and specifications

---

## ⚠️ Important Notes

1. **Guest Remarks Endpoint:** The frontend is ready to submit to `/api/guest-remarks`, but this endpoint may need to be created in the backend.

2. **Permit Holder Format:** The infrastructure is in place, but the actual format differences need to be specified before implementation.

3. **Backward Compatibility:** All changes maintain backward compatibility with existing data and API contracts.

---

**Note:** This is a living document. Please update as additional changes are made or when format specifications are provided.

