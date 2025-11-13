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
): ConditionRow[][] {
  // 1. Sort the list first (primary: section, secondary: condition_number)
  const sortedList = [...list].sort((a, b) => {
    // Primary Sort: Section Number (Ensure it's treated as a number)
    const sectionA = Number(a.section) || Infinity;
    const sectionB = Number(b.section) || Infinity;

    if (sectionA !== sectionB) {
      return sectionA - sectionB;
    }

    // Secondary Sort: Condition Number (Ensure it's treated as a number)
    const conditionNumA = Number(a.condition_number) || Infinity;
    const conditionNumB = Number(b.condition_number) || Infinity;

    return conditionNumA - conditionNumB;
  });

  // 2. Reduce the sorted list to group conditions by section number.
  const sectionsMap = sortedList.reduce(
    (acc, e) => {
      // Use the section number as the key (default to '0' or 'General' if needed)
      const sectionKey = e.section?.toString() || '0';

      if (!acc[sectionKey]) {
        acc[sectionKey] = [];
      }

      // 3. Map the individual condition object (e) to a 6-column row array
      const status = e.status ? e.status.toLowerCase() : '';

      const CHECK_MARK = '✓';
      const BLANK = '';

      const statusComplied = status === 'complied' ? CHECK_MARK : BLANK;
      const statusPartial = status.includes('partial') ? CHECK_MARK : BLANK;
      const statusNotComplied = status.includes('not') ? CHECK_MARK : BLANK;

      let remark: string;
      if (
        status.includes('complied') &&
        e.remark_list &&
        e.remark_list.length > 0
      ) {
        remark = e.remark_list[0];
      } else if (
        status.includes('partial') &&
        e.remark_list &&
        e.remark_list.length > 1
      ) {
        remark = e.remark_list[1];
      } else if (
        status.includes('not') &&
        e.remark_list &&
        e.remark_list.length > 2
      ) {
        remark = e.remark_list[2];
      } else {
        remark = '';
      }
      const conditionText = e.condition?.toString() || '';
      const match = conditionText.match(/Condition\s+([0-9]+)\s*:/i);
      const conditionNo = match ? match[1] : BLANK;
      let condition;
      if (match) {
        condition = e.condition?.toString().split(':')[1];
      } else {
        condition = e.condition;
      }

      // Create the 6-column row
      const row: ConditionRow = [
        conditionNo || BLANK, // Column 1: Condition No.
        condition || BLANK, // Column 2: Condition Text
        statusComplied, // Column 3: C
        statusPartial, // Column 4: PC
        statusNotComplied, // Column 5: NC
        remark || BLANK, // Column 6: Remarks
      ];

      acc[sectionKey].push(row);

      return acc;
    },
    {} as Record<string, ConditionRow[]>,
  ); // The accumulator is a map of string -> array of rows

  // 4. Extract the array of arrays from the map, ensuring numeric order of sections
  const sectionKeys = Object.keys(sectionsMap).sort(
    (a, b) => Number(a) - Number(b),
  );

  // Return the final array of row arrays
  return sectionKeys.map((key) => sectionsMap[key]);
}
