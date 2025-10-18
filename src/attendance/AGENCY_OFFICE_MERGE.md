# Agency/Office Merge Update

## Changes Made

The PDF table has been updated to merge the **Agency** and **Office** columns into a single **Agency/Office** column.

## What Changed

### Before

```
┌────┬──────────┬──────────┬────────────┬──────────┬────────┐
│ No │   Name   │  Agency  │   Office   │ Position │ Status │
├────┼──────────┼──────────┼────────────┼──────────┼────────┤
│ 1  │ Alice S. │   DENR   │ Env Monitor│ Inspector│ In Pers│
└────┴──────────┴──────────┴────────────┴──────────┴────────┘
```

### After

```
┌────┬──────────┬──────────────────────────┬──────────┬────────┐
│ No │   Name   │     Agency/Office        │ Position │ Status │
├────┼──────────┼──────────────────────────┼──────────┼────────┤
│ 1  │ Alice S. │ DENR/Env Monitor         │ Inspector│ In Pers│
└────┴──────────┴──────────────────────────┴──────────┴────────┘
```

## Display Logic

The merged column displays:

- **"Agency/Office"** when both values exist (e.g., "DENR/Environmental Monitoring")
- **"Agency"** only when office is empty (e.g., "DENR")
- **"Office"** only when agency is empty (e.g., "Environmental Monitoring")
- **"-"** when both are empty

## Column Width

The merged column has been widened to **150px** (previously 100px + 80px = 180px total, now 150px to save space while maintaining readability).

## Example Data

```json
{
  "name": "Alice Smith",
  "agency": "DENR",
  "office": "Environmental Monitoring",
  "position": "Inspector",
  "signatureUrl": "https://example.com/signatures/alice.png",
  "attendanceStatus": "IN_PERSON"
}
```

**Will display as:**

- Name: Alice Smith
- Agency/Office: DENR/Environmental Monitoring
- Position: Inspector
- Status: In Person

## New Table Structure

| Column            | Width     | Purpose                        |
| ----------------- | --------- | ------------------------------ |
| No.               | 30px      | Row number                     |
| Name              | 120px     | Attendee name                  |
| **Agency/Office** | **150px** | **Combined agency and office** |
| Position          | 90px      | Job position                   |
| Status            | 75px      | Attendance status              |

**Total Width**: 465px (fits comfortably on A4)

## Backend Changes

Only the `AttendancePdfGeneratorService` was modified:

1. Updated column definitions to merge Agency and Office
2. Added logic to format the merged field with "/" separator
3. Handles cases where only one field is present

## No API Changes

The attendance record JSON structure remains the same:

- Still stores `agency` and `office` as separate fields
- Only the PDF display format has changed
- Frontend can continue sending data in the same format

## Testing

Test with various scenarios:

- ✅ Both agency and office present: "Agency/Office"
- ✅ Only agency present: "Agency"
- ✅ Only office present: "Office"
- ✅ Neither present: "-"

## Updated: October 16, 2025
