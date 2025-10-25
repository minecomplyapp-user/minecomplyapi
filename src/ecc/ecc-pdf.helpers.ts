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
export function toConditionRows(
    list: NonNullable<ECCConditionInfo['conditions']>,
): [string, string, string, string, string, string][] { // <-- FIX: Updated return type to 6 strings
    return list.map((e) => {
        // 1. Get the status and convert to lowercase for reliable comparison
        // NOTE: The ECCConditionInfo type must contain a 'status' field.
        const status = e.status ? e.status.toLowerCase() : '';

        // 2. Calculate the compliance status for each of the three status columns
        const statusComplied = status === 'compliant' ? 'V' : '';
        const statusPartial = status.includes('partial') ? 'V' : '';
        const statusNotComplied = status.includes('non') ? 'X' : '';
        
        // 3. Return the 6-column row array
        // NOTE: This assumes ECCConditionInfo has 'condition_number', 'condition', and 'remarks'.
        return [
            (e.condition_number?.toString() || '-'), // Column 1: Condition No.
            e.condition || '-',                       // Column 2: Condition Text
            statusComplied,                           // Column 3: Status 1 (e.g., Complied)
            statusPartial,                            // Column 4: Status 2 (e.g., Partially Complied)
            statusNotComplied,                        // Column 5: Status 3 (e.g., Not Complied)
            e.remarks || '-',                         // Column 6: Remarks
        ];
    });
}