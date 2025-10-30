import { Injectable } from '@nestjs/common';
import {
  Document,
  Packer,
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
import type { CMVRGeneralInfo } from '../cmvr-pdf-generator.service';

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
            width: { size: 30, type: WidthType.PERCENTAGE },
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
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(
                'Amount Deposited',
                true,
                AlignmentType.CENTER,
              ),
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
          children: [
            new TableCell({
              children: [createParagraph(fund.permitHolderName || 'N/A')],
            }),
            new TableCell({
              children: [
                createParagraph(fund.savingsAccountNumber || 'N/A'),
              ],
            }),
            new TableCell({
              children: [createParagraph(fund.amountDeposited || 'N/A')],
            }),
            new TableCell({
              children: [createParagraph(fund.dateUpdated || 'N/A')],
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
    });
  }


    export function createKeyValueTable(rows: Array<[string, string]>): Table {
    const tableRows: TableRow[] = rows.map(
      ([key, value]) =>
        new TableRow({
          children: [
            new TableCell({
              children: [createParagraph(`${key}:`, true)],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [createParagraph(value || 'N/A')],
              width: { size: 60, type: WidthType.PERCENTAGE },
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