import {
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
} from 'docx';
import { createTableBorders } from './general-use.helper';

import type { CMVRGeneralInfo } from '../cmvr-pdf-generator.service';

export function createProcessDocumentation(
  pd: NonNullable<
    CMVRGeneralInfo['processDocumentationOfActivitiesUndertaken']
  >,
): (Paragraph | Table)[] {
  const arr: (Paragraph | Table)[] = [];

  // Helper functions for consistent text formatting (Arial 11pt = 22 half-points)
  const createTextRun = (text: string, bold = false) => {
    return new TextRun({
      text,
      bold,
      font: 'Arial',
      size: 22, // 11pt
    });
  };

  // Cell padding in twips (5pt = 100 twips)
  const cellMargins = {
    top: 100,
    bottom: 100,
    left: 100,
    right: 100,
  };

  // Collect all activities with their MMT members
  interface ActivityData {
    label: string;
    mmtMembers: Array<{ name: string; title: string }>;
    dateConducted?: string;
    remarks?: string;
  }

  const activities: ActivityData[] = [];

  // Parse activities
  if (pd.activities?.complianceWithEccConditionsCommitments) {
    const data = pd.activities.complianceWithEccConditionsCommitments;
    activities.push({
      label: 'Compliance with ECC Conditions/ Commitments',
      mmtMembers: parseMmtMembers(data.mmtMembersInvolved),
      dateConducted: pd.dateConducted,
      remarks: pd.mergedMethodologyOrOtherRemarks,
    });
  }

  if (pd.activities?.complianceWithEpepAepepConditions) {
    const data = pd.activities.complianceWithEpepAepepConditions;
    activities.push({
      label: 'Compliance with EPEP/ AEPEP Conditions',
      mmtMembers: parseMmtMembers(data.mmtMembersInvolved),
      dateConducted: pd.dateConducted,
      remarks: pd.mergedMethodologyOrOtherRemarks,
    });
  }

  if (pd.activities?.siteOcularValidation) {
    const data = pd.activities.siteOcularValidation;
    activities.push({
      label: 'Site Ocular Validation',
      mmtMembers: parseMmtMembers(data.mmtMembersInvolved),
      dateConducted: pd.dateConducted,
      remarks: pd.mergedMethodologyOrOtherRemarks,
    });
  }

  if (pd.activities?.siteValidationConfirmatorySampling) {
    const data = pd.activities.siteValidationConfirmatorySampling;
    activities.push({
      label: 'Site Validation – Confirmatory Sampling (if needed)',
      mmtMembers: parseMmtMembers(data.mmtMembersInvolved),
      dateConducted: pd.dateConducted,
      remarks: pd.mergedMethodologyOrOtherRemarks,
    });
  }

  // If no activities, return empty
  if (activities.length === 0) {
    return arr;
  }

  // Build table rows
  const rows: TableRow[] = [];

  // Header row
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Activities', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 25, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Date Conducted', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 15, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('MMT Members Involved', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 25, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Methodology/ Other Remarks', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 35, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
      ],
    }),
  );

  // Calculate total member count for date and remarks merging
  const totalMembers = activities.reduce(
    (sum, act) => sum + act.mmtMembers.length,
    0,
  );

  // Track if we've added merged date and remarks cells
  let firstMemberRow = true;

  // Data rows for each activity
  for (const activity of activities) {
    const memberCount = activity.mmtMembers.length;

    for (let i = 0; i < memberCount; i++) {
      const member = activity.mmtMembers[i];
      const isFirstMemberOfActivity = i === 0;

      const rowCells: TableCell[] = [];

      // Column 1: Activity label (merged for all members of this activity)
      if (isFirstMemberOfActivity) {
        rowCells.push(
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun(activity.label)],
                alignment: AlignmentType.LEFT,
              }),
            ],
            rowSpan: memberCount,
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
        );
      }

      // Column 2: Date Conducted (merged for ALL members across ALL activities)
      if (firstMemberRow) {
        rowCells.push(
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun(activity.dateConducted || '')],
                alignment: AlignmentType.CENTER,
              }),
            ],
            rowSpan: totalMembers,
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
        );
      }

      // Column 3: MMT Member (name and title, both centered)
      rowCells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun(member.name, true)],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [createTextRun(member.title)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
      );

      // Column 4: Methodology/Remarks (merged for ALL members across ALL activities)
      if (firstMemberRow) {
        rowCells.push(
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun(activity.remarks || '')],
                alignment: AlignmentType.LEFT,
              }),
            ],
            rowSpan: totalMembers,
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
        );
        firstMemberRow = false;
      }

      rows.push(new TableRow({ children: rowCells }));
    }
  }

  arr.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createTableBorders(),
      rows,
    }),
  );

  return arr;
}

// Helper function to parse MMT members from string array
function parseMmtMembers(
  mmtStrings?: string[],
): Array<{ name: string; title: string }> {
  if (!mmtStrings || mmtStrings.length === 0) {
    return [{ name: 'None', title: '' }];
  }

  return mmtStrings.map((str) => {
    // Try to split by common patterns like " - ", " – ", newline, or comma
    const parts = str.split(/\s*[-–]\s*|\n|,\s*/);
    if (parts.length >= 2) {
      return {
        name: parts[0].trim(),
        title: parts.slice(1).join(' ').trim(),
      };
    }
    return {
      name: str.trim(),
      title: '',
    };
  });
}
