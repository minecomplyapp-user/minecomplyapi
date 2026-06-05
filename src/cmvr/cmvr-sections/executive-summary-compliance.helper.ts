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
import type { CMVRGeneralInfo } from '../cmvr-pdf-generator.service';
import { createTableBorders } from './general-use.helper';

export function createExecutiveSummaryTable(
  summary: NonNullable<CMVRGeneralInfo['executiveSummaryOfCompliance']>,
): Table {
  const rows: TableRow[] = [];

  const checkmark = (v: boolean | undefined) => (v ? '✓' : '');

  // Helper functions for consistent text formatting (Arial 11pt = 22 half-points)
  const createTextRun = (text: string, bold = false) => {
    return new TextRun({
      text,
      bold,
      font: 'Arial',
      size: 22, // 11pt
    });
  };

  // Cell padding in twips (1pt = 20 twips, so 5pt = 100 twips)
  const cellMargins = {
    top: 100,
    bottom: 100,
    left: 100,
    right: 100,
  };

  const createLeftAlignedCell = (
    content: TextRun[],
    opts: Record<string, unknown> = {},
  ) => {
    return new TableCell({
      children: [
        new Paragraph({
          children: content,
          alignment: AlignmentType.LEFT,
        }),
      ],
      verticalAlign: VerticalAlign.CENTER,
      margins: cellMargins,
      ...opts,
    });
  };

  const createCenteredCell = (
    text: string | TextRun,
    opts: Record<string, unknown> = {},
  ) => {
    const content = typeof text === 'string' ? createTextRun(text) : text;

    return new TableCell({
      children: [
        new Paragraph({
          children: [content],
          alignment: AlignmentType.CENTER,
        }),
      ],
      verticalAlign: VerticalAlign.CENTER,
      margins: cellMargins,
      ...opts,
    });
  };

  // Header Row - "Requirements" and "Remarks" span 2 rows vertically
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Requirements', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 2,
          rowSpan: 2,
          width: { size: 40, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Complied?', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 2,
          width: { size: 20, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                createTextRun('Remarks/ ECC or EPEP Condition #', true),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          rowSpan: 2,
          width: { size: 40, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
      ],
    }),
  );

  // Sub-header row - Y and N columns only
  rows.push(
    new TableRow({
      children: [
        createCenteredCell('Y', {
          width: { size: 10, type: WidthType.PERCENTAGE },
        }),
        createCenteredCell('N', {
          width: { size: 10, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  );

  // EPEP Commitments - Category spans 3 rows vertically
  if (summary.complianceWithEpepCommitments) {
    const epep = summary.complianceWithEpepCommitments;

    // Row 1: Safety
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  createTextRun('Compliance with EPEP Commitments', true),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
            rowSpan: 3,
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 20, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
          createLeftAlignedCell([createTextRun('Safety')], {
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          createCenteredCell(checkmark(epep.safety === true)),
          createCenteredCell(checkmark(epep.safety === false)),
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun(epep.remarks || '')],
                alignment: AlignmentType.LEFT,
              }),
            ],
            rowSpan: 3,
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
        ],
      }),
    );

    // Row 2: Social
    rows.push(
      new TableRow({
        children: [
          createLeftAlignedCell([createTextRun('Social')]),
          createCenteredCell(checkmark(epep.social === true)),
          createCenteredCell(checkmark(epep.social === false)),
        ],
      }),
    );

    // Row 3: Rehabilitation
    rows.push(
      new TableRow({
        children: [
          createLeftAlignedCell([createTextRun('Rehabilitation')]),
          createCenteredCell(checkmark(epep.rehabilitation === true)),
          createCenteredCell(checkmark(epep.rehabilitation === false)),
        ],
      }),
    );
  }

  // SDMP Commitments - Single row, category and detail merged horizontally
  if (summary.complianceWithSdmpCommitments) {
    const sdmp = summary.complianceWithSdmpCommitments;
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  createTextRun('Compliance with SDMP Commitments', true),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
            columnSpan: 2,
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
          createCenteredCell(checkmark(sdmp.complied === true)),
          createCenteredCell(checkmark(sdmp.complied === false)),
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun(sdmp.remarks || '')],
                alignment: AlignmentType.LEFT,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
        ],
      }),
    );
  }

  // ✅ FIX: Complaints Management - Category spans 5 rows vertically
  if (summary.complaintsManagement) {
    const c = summary.complaintsManagement;
    
    // ✅ FIX: Check if N/A for all is selected
    const isNA = c.naForAll === true;

    // Row 1: Complaint Receiving Setup
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Complaints Management', true)],
                alignment: AlignmentType.LEFT,
              }),
            ],
            rowSpan: 5,
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 20, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
          createLeftAlignedCell([createTextRun('Complaint receiving set-up')], {
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          // ✅ FIX: Show "N/A" in Y column if naForAll, otherwise show checkmark
          createCenteredCell(isNA ? createTextRun('N/A') : checkmark(c.complaintReceivingSetup === true)),
          // ✅ FIX: Leave N column empty if naForAll
          createCenteredCell(isNA ? createTextRun('') : checkmark(c.complaintReceivingSetup === false)),
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun(c.remarks || '')],
                alignment: AlignmentType.LEFT,
              }),
            ],
            rowSpan: 5,
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
        ],
      }),
    );

    // Row 2: Case Investigation
    rows.push(
      new TableRow({
        children: [
          createLeftAlignedCell([createTextRun('Case investigation')]),
          createCenteredCell(isNA ? createTextRun('') : checkmark(c.caseInvestigation === true)),
          createCenteredCell(isNA ? createTextRun('') : checkmark(c.caseInvestigation === false)),
        ],
      }),
    );

    // Row 3: Implementation of Control
    rows.push(
      new TableRow({
        children: [
          createLeftAlignedCell([createTextRun('Implementation of control')]),
          createCenteredCell(isNA ? createTextRun('') : checkmark(c.implementationOfControl === true)),
          createCenteredCell(isNA ? createTextRun('') : checkmark(c.implementationOfControl === false)),
        ],
      }),
    );

    // Row 4: Communication with Complainant/Public
    rows.push(
      new TableRow({
        children: [
          createLeftAlignedCell([
            createTextRun('Communication with complainant/public'),
          ]),
          createCenteredCell(
            isNA ? createTextRun('') : checkmark(c.communicationWithComplainantOrPublic === true),
          ),
          createCenteredCell(
            isNA ? createTextRun('') : checkmark(c.communicationWithComplainantOrPublic === false),
          ),
        ],
      }),
    );

    // Row 5: Complaint Documentation
    rows.push(
      new TableRow({
        children: [
          createLeftAlignedCell([createTextRun('Complaint documentation')]),
          createCenteredCell(isNA ? createTextRun('') : checkmark(c.complaintDocumentation === true)),
          createCenteredCell(isNA ? createTextRun('') : checkmark(c.complaintDocumentation === false)),
        ],
      }),
    );
  }

  // Accountability - Single row, category and detail merged horizontally
  if (summary.accountability) {
    const acc = summary.accountability;
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  createTextRun(
                    'Accountability – qualified personnel shall be assigned to responsible for the implementation of the approved ECC or EPEP conditions and other commitments',
                    true,
                  ),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
            columnSpan: 2,
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
          createCenteredCell(checkmark(acc.complied === true)),
          createCenteredCell(checkmark(acc.complied === false)),
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun(acc.remarks || '')],
                alignment: AlignmentType.LEFT,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
        ],
      }),
    );
  }

  // Others - Single row, category and detail merged horizontally
  if (summary.others) {
    // ✅ FIX: When N/A is selected, merge Y+N columns and show "N/A" text
    const isNA = summary.others.na === true;
    const compliedCells = isNA
      ? [
          // Merge Y and N columns and show "N/A" when N/A is selected
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('N/A')],
                alignment: AlignmentType.CENTER,
              }),
            ],
            columnSpan: 2, // Merge Y and N columns
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 20, type: WidthType.PERCENTAGE }, // Combined width of Y+N
            margins: cellMargins,
          }),
        ]
      : [
          // When N/A is not selected, merge Y+N columns but leave empty (no checkmarks)
          // This matches PDF behavior where merged cell is empty when showNA is false
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('')],
                alignment: AlignmentType.CENTER,
              }),
            ],
            columnSpan: 2, // Merge Y and N columns
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 20, type: WidthType.PERCENTAGE }, // Combined width of Y+N
            margins: cellMargins,
          }),
        ];

    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Others, please specify', true)],
                alignment: AlignmentType.LEFT,
              }),
            ],
            columnSpan: 2,
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
          ...compliedCells,
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun(summary.others.specify || '')],
                alignment: AlignmentType.LEFT,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
        ],
      }),
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: createTableBorders(),
    rows,
  });
}
