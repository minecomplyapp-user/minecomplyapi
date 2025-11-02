import {
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  VerticalAlign,
} from 'docx';

export function createFundTable(
  title: string,
  fundList: Array<{
    permitHolderName?: string;
    savingsAccountNumber?: string;
    amountDeposited?: string;
    dateUpdated?: string;
  }>,
): Table {
  const rows: TableRow[] = [];

  // Header row with merged label
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [createParagraph(title, true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: fundList.length + 1,
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph(
              'Name of Permit Holder',
              true,
              AlignmentType.CENTER,
            ),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph(
              'Savings Account Number',
              true,
              AlignmentType.CENTER,
            ),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph('Amount Deposited', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph('Date Updated', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  );

  // Data rows
  fundList.forEach((fund) => {
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(
                fund.permitHolderName || 'N/A',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                fund.savingsAccountNumber || 'N/A',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                fund.amountDeposited || 'N/A',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                fund.dateUpdated || 'N/A',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: createTableBorders(),
    rows,
  });
}

/**
 * Create additional information section (Coordinates, Proponent, MMT)
 */

/**
 * Helper to create consistent table borders
 */
export function createTableBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  };
}

/**
 * Helper to create text with Arial 11pt font
 */
export function createText(text: string, bold = false, size = 22): TextRun {
  return new TextRun({
    text,
    font: 'Arial',
    size, // Default 22 = 11pt
    color: '000000',
    bold,
  });
}

/**
 * Helper to create a paragraph with Arial 11pt text
 */
export function createParagraph(
  text: string,
  bold = false,
  alignment?: (typeof AlignmentType)[keyof typeof AlignmentType],
): Paragraph {
  return new Paragraph({
    children: [createText(text, bold)],
    alignment,
    indent: { left: 100, right: 100 }, // Add padding to all text cells
  });
}

/**
 * Helper to create a paragraph with formatted member name (bold) and role (not bold, on new line)
 * Example: "John Doe - MMT Head" becomes "John Doe\n- MMT Head" with "John Doe" bold
 */
export function createFormattedMemberParagraph(
  memberText: string,
  alignment?: (typeof AlignmentType)[keyof typeof AlignmentType],
): Paragraph {
  const parts = memberText.split(' - ');

  if (parts.length > 1) {
    // Name is bold, role is not bold and on new line
    return new Paragraph({
      children: [
        createText(parts[0], true), // Name in bold
        new TextRun({ break: 1, font: 'Arial', size: 22 }), // Line break
        createText(`- ${parts.slice(1).join(' - ')}`, false), // Role not bold
      ],
      alignment,
      spacing: {
        before: 100, // Add top padding (100 twips ≈ 2mm)
      },
      indent:
        alignment === AlignmentType.LEFT
          ? { left: 100, right: 100 }
          : alignment === AlignmentType.RIGHT
            ? { right: 100 }
            : undefined,
    });
  }

  // No dash found, just return normal paragraph with top padding
  return new Paragraph({
    children: [createText(memberText, false)],
    alignment,
    spacing: {
      before: 100, // Add top padding
      after: 100,
    },
    indent:
      alignment === AlignmentType.LEFT
        ? { left: 100, right: 100 }
        : alignment === AlignmentType.RIGHT
          ? { right: 100 }
          : undefined,
  });
}
export function createKeyValueTable(rows: Array<[string, string]>): Table {
  const tableRows: TableRow[] = rows.map(
    ([key, value]) =>
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [createParagraph(key, true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [createParagraph(':', true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 3, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(value || 'N/A', false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 72, type: WidthType.PERCENTAGE },
            columnSpan: 4,
          }),
        ],
      }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: createTableBorders(),
    rows: tableRows,
  });
}
