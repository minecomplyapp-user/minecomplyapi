import type { CMVRGeneralInfo } from './cmvr-pdf-generator.service';

/**
 * Helper functions for CMVR PDF generation
 * This file contains utility functions for date formatting, data transformation, and text formatting
 */

/**
 * Format a date-like input into 'Mon. DD, YYYY' format (e.g., 'Sep. 06, 2025')
 * @param input - Date string, Date object, or null/undefined
 * @returns Formatted date string or '-' if empty, or original string if unparsable
 */
export function formatDate(input?: string | Date | null): string {
  if (!input) return '-';
  let d: Date;
  if (input instanceof Date) {
    d = input;
  } else {
    // Accept ISO or human-readable strings
    const parsed = new Date(input);
    if (isNaN(parsed.getTime())) {
      // Not a parseable date; return as-is
      return String(input);
    }
    d = parsed;
  }
  const months = [
    'Jan.',
    'Feb.',
    'Mar.',
    'Apr.',
    'May',
    'Jun.',
    'Jul.',
    'Aug.',
    'Sep.',
    'Oct.',
    'Nov.',
    'Dec.',
  ];
  const mon = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${mon} ${day}, ${year}`;
}

/**
 * Format a single date or a date range string
 * @param input - Date string or range like '2025-09-01 to 2025-09-05' or '2025-09-01 - 2025-09-05'
 * @returns Formatted date or range string
 */
export function formatMaybeDateOrRange(input?: string | null): string {
  if (!input) return '-';
  const raw = String(input).trim();
  // Try splitting by common range delimiters: 'to', '-', en dash, em dash
  // Only treat as range when delimiter is surrounded by spaces (avoids hyphens inside ISO dates)
  const rangeDelimiter = /\s+(?:to|[-–—])\s+/;
  const parts = raw.split(rangeDelimiter);
  if (parts.length === 2 && parts[0] && parts[1]) {
    const startDate = parseFlexibleDate(parts[0]);
    const endDate = parseFlexibleDate(parts[1], startDate || undefined);
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    // Fallback to individual formatting if parsing failed
    return `${formatDate(parts[0])} - ${formatDate(parts[1])}`;
  }
  // Not a range; format as a single date
  return formatDate(raw);
}

/**
 * Parse a date string flexibly, inferring missing month/year from fallback when possible
 * @param input - Date string in various formats
 * @param fallback - Optional fallback date to infer missing components
 * @returns Parsed Date object or null if unparsable
 */
export function parseFlexibleDate(input: string, fallback?: Date): Date | null {
  const s = input.trim();
  // 1) Native Date parse
  const direct = new Date(s);
  if (!isNaN(direct.getTime())) return direct;

  // 2) ISO-like: YYYY-MM-DD or YYYY/MM/DD
  let m = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (m) {
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    const d = parseInt(m[3], 10);
    const dt = new Date(y, mo, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // 3) US-like: MM/DD/YYYY or MM-DD-YYYY
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const mo = parseInt(m[1], 10) - 1;
    const d = parseInt(m[2], 10);
    const y = parseInt(m[3], 10);
    const dt = new Date(y, mo, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // 4) MonthName DD, YYYY
  m = s.match(
    /^(January|February|March|April|May|June|July|August|September|October|November|December|Jan\.?|Feb\.?|Mar\.?|Apr\.?|Jun\.?|Jul\.?|Aug\.?|Sep\.?|Oct\.?|Nov\.?|Dec\.?)\s+(\d{1,2}),\s*(\d{4})$/i,
  );
  if (m) {
    const mo = monthNameToIndex(m[1]);
    const d = parseInt(m[2], 10);
    const y = parseInt(m[3], 10);
    const dt = new Date(y, mo, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // 5) MonthName DD (infer year from fallback)
  m = s.match(
    /^(January|February|March|April|May|June|July|August|September|October|November|December|Jan\.?|Feb\.?|Mar\.?|Apr\.?|Jun\.?|Jul\.?|Aug\.?|Sep\.?|Oct\.?|Nov\.?|Dec\.?)\s+(\d{1,2})$/i,
  );
  if (m && fallback) {
    const mo = monthNameToIndex(m[1]);
    const d = parseInt(m[2], 10);
    const y = fallback.getFullYear();
    const dt = new Date(y, mo, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // 6) DD, YYYY (infer month from fallback)
  m = s.match(/^(\d{1,2}),\s*(\d{4})$/);
  if (m && fallback) {
    const d = parseInt(m[1], 10);
    const y = parseInt(m[2], 10);
    const mo = fallback.getMonth();
    const dt = new Date(y, mo, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // 7) DD (infer month and year from fallback)
  m = s.match(/^(\d{1,2})$/);
  if (m && fallback) {
    const d = parseInt(m[1], 10);
    const mo = fallback.getMonth();
    const y = fallback.getFullYear();
    const dt = new Date(y, mo, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  return null;
}

/**
 * Convert month name to zero-based index
 * @param name - Month name (full or abbreviated, with or without period)
 * @returns Zero-based month index (0-11)
 */
export function monthNameToIndex(name: string): number {
  const map: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
    'jan.': 0,
    jan: 0,
    'feb.': 1,
    feb: 1,
    'mar.': 2,
    mar: 2,
    'apr.': 3,
    apr: 3,
    jun: 5,
    'jun.': 5,
    jul: 6,
    'jul.': 6,
    'aug.': 7,
    aug: 7,
    'sep.': 8,
    sep: 8,
    'oct.': 9,
    oct: 9,
    'nov.': 10,
    nov: 10,
    'dec.': 11,
    dec: 11,
  };
  return map[name.toLowerCase()] ?? 0;
}

/**
 * Get ordinal suffix for a number (st, nd, rd, th)
 * @param num - The number to get suffix for
 * @returns Ordinal suffix string
 */
export function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
}

/**
 * Format quarter string with ordinal suffix (e.g., "3rd" from "3")
 * @param quarter - Quarter string (e.g., "3", "3rd", "3RD")
 * @returns Formatted quarter with ordinal suffix
 */
export function formatQuarterWithSuperscript(quarter: string): string {
  const num = quarter.replace(/\D/g, '');
  const ordinal = getOrdinalSuffix(parseInt(num, 10));
  return `${num}${ordinal}`;
}

/**
 * Convert ECC records to table rows
 * @param list - Array of ECC records
 * @returns Array of table rows [permitHolder, eccNumber, dateOfIssuance]
 */
export function toECCRows(
  list: NonNullable<CMVRGeneralInfo['ecc']>,
): [string, string, string][] {
  return list.map((e) => [
    e.permitHolderName || '-',
    e.eccNumber || '-',
    formatDate(e.dateOfIssuance),
  ]);
}

/**
 * Convert ISAG/MPP records to table rows
 * @param list - Array of ISAG/MPP records
 * @returns Array of table rows [permitHolder, isagPermitNumber, dateOfIssuance]
 */
export function toISAGRows(
  list: NonNullable<CMVRGeneralInfo['isagMpp']>,
): [string, string, string][] {
  return list.map((i) => [
    i.permitHolderName || '-',
    i.isagPermitNumber || '-',
    formatDate(i.dateOfIssuance),
  ]);
}

/**
 * Convert EPEP records to table rows
 * @param list - Array of EPEP records
 * @returns Array of table rows [permitHolder, epepNumber, dateOfApproval]
 */
export function toEPEPRows(
  list: NonNullable<CMVRGeneralInfo['epep']>,
): [string, string, string][] {
  return list.map((e) => [
    e.permitHolderName || '-',
    e.epepNumber || '-',
    formatDate(e.dateOfApproval),
  ]);
}

/**
 * Convert fund records to table rows
 * @param list - Array of fund records
 * @returns Array of table rows [permitHolder, accountNumber, amountDeposited, dateUpdated]
 */
export function toFundRows(
  list: Array<{
    permitHolderName?: string;
    savingsAccountNumber?: string;
    amountDeposited?: string;
    dateUpdated?: string;
  }>,
): [string, string, string, string][] {
  return list.map((r) => [
    r.permitHolderName ?? '-',
    r.savingsAccountNumber ?? '-',
    r.amountDeposited ?? '-',
    r.dateUpdated ? formatDate(r.dateUpdated) : '-',
  ]);
}
