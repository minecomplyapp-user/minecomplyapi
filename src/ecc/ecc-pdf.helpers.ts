import { number } from 'joi';
import type { ECCConditionInfo } from './ecc-pdf-generator.service';

/**
 * Helper functions for ECC PDF generation
 * This file contains utility functions for date formatting, data transformation, and text formatting
 */

/**
 * Convert ECC **Condition** records to table rows for a 6-column compliance table.
 * @param list - Array of ECC **Condition** records
 * @returns Array of table rows [condition_number, condition, compliant_status, partial_status, non_status, remarks]
 */

// export function toConditionRows(
//     list: NonNullable<ECCConditionInfo['conditions']>,
// ): [string, string, string, string, string, string][] { // <-- FIX: Updated return type to 6 strings
//     return list.map((e) => {
//         // 1. Get the status and convert to lowercase for reliable comparison
//         // NOTE: The ECCConditionInfo type must contain a 'status' field.
//         const status = e.status ? e.status.toLowerCase() : '';

//         // 2. Calculate the compliance status for each of the three status columns
//         const statusComplied = status === 'compliant' ? 'V' : '';
//         const statusPartial = status.includes('partial') ? 'V' : '';
//         const statusNotComplied = status.includes('non') ? 'X' : '';
//         let remark;
//         if(status.includes('compliant') && e.remark_list && e.remark_list.length > 0){
//             remark = e.remark_list[0]
//         }else if(status.includes('partial') && e.remark_list && e.remark_list.length > 1){
//             remark = e.remark_list[1]
//         }else if(status.includes('non') && e.remark_list && e.remark_list.length > 1){
//             remark = e.remark_list[2]
//         }else{
//             remark = '';
//         }
//         // 3. Return the 6-column row array
//         // NOTE: This assumes ECCConditionInfo has 'condition_number', 'condition', and 'remarks'.
//         return [
//             (e.condition_number?.toString() || '-'), // Column 1: Condition No.
//             e.condition || '-',                       // Column 2: Condition Text
//             statusComplied,                           // Column 3: Status 1 (e.g., Complied)
//             statusPartial,                            // Column 4: Status 2 (e.g., Partially Complied)
//             statusNotComplied,                        // Column 5: Status 3 (e.g., Not Complied)
//             remark
//         ];
//     });

// }

// ecc-pdf.helpers.ts

// Define the type for a single row (6 strings)
type ConditionRow = [string, string, string, string, string, string];

// The function now returns an array of section arrays, where each section array
// contains ConditionRow arrays.
export function toConditionRows(
  list: NonNullable<ECCConditionInfo['conditions']>,
): {
  rows: ConditionRow[][];        // existing output
  counts: Record<string, { na: number; complied: number; partial: number; not: number }>; // counts per section
} {
  const sortedList = [...list].sort((a, b) => {
    const sectionA = Number(a.section) || Infinity;
    const sectionB = Number(b.section) || Infinity;

    if (sectionA !== sectionB) return sectionA - sectionB;

    const conditionNumA = Number(a.condition_number) || Infinity;
    const conditionNumB = Number(b.condition_number) || Infinity;

    return conditionNumA - conditionNumB;
  });

  let currentConditionNumber = 0;

  const sectionsMap = sortedList.reduce((acc, e) => {
    const sectionKey = e.section?.toString() || '0';

    // initialize map
    if (!acc[sectionKey]) {
      acc[sectionKey] = { rows: [], counts: { na: 0, complied: 0, partial: 0, not: 0 } };
    }

    const status = e.status ? e.status.toLowerCase() : '';
    const CHECK_MARK = '✓';
    const BLANK = '';

    const isComplied = status === 'complied';
    const isPartial = status.includes('partial');
    const isNotComplied = status.includes('not');

    const statusComplied = isComplied ? CHECK_MARK : BLANK;
    const statusPartial = isPartial ? CHECK_MARK : BLANK;
    const statusNotComplied = isNotComplied ? CHECK_MARK : BLANK;

    // Count per section
    if (!isComplied && !isPartial && !isNotComplied) {
      acc[sectionKey].counts.na++;
    } else if (isComplied) {
      acc[sectionKey].counts.complied++;
    } else if (isPartial) {
      acc[sectionKey].counts.partial++;
    } else if (isNotComplied) {
      acc[sectionKey].counts.not++;
    }

    let remark = e.remarks || BLANK;

    const conditionText = e.condition?.toString() || '';
    const match = conditionText.match(/Condition\s+([0-9]+)\s*:/i);
    let conditionNo = match ? match[1] : BLANK;

    const matchCustom = conditionText.match(/Condition\s+custom-([0-9]+)\s*:/i);

    let condition;
    if (match) {
      condition = e.condition?.toString().split(':')[1];
      currentConditionNumber = parseInt(conditionNo);
    } else if (matchCustom) {
      condition = e.condition?.toString().split(':')[1];
      currentConditionNumber++;
      conditionNo = currentConditionNumber.toString();
    } else {
      condition = e.condition;
    }

    const row: ConditionRow = [
      conditionNo || BLANK,
      condition || BLANK,
      statusComplied,
      statusPartial,
      statusNotComplied,
      remark || BLANK,
    ];

    acc[sectionKey].rows.push(row);

    return acc;
  }, {} as Record<string, { rows: ConditionRow[]; counts: { na: number; complied: number; partial: number; not: number } }>);

  const sectionKeys = Object.keys(sectionsMap).sort((a, b) => Number(a) - Number(b));

  return {
    rows: sectionKeys.map((key) => sectionsMap[key].rows),
    counts: sectionKeys.reduce((cAcc, key) => {
      cAcc[key] = sectionsMap[key].counts;
      return cAcc;
    }, {} as Record<string, { na: number; complied: number; partial: number; not: number }>),
  };
}

