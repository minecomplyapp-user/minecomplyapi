import { Injectable } from '@nestjs/common';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
} from 'docx';

import { toConditionRows } from './ecc-pdf.helpers';

export interface ECCConditionInfo {
  conditions?: Array<{
    condition_number?: string;
    condition?: string;
    status?: string;
    remarks?: string;
    remark_list?: string[];
    section?: number;
  }>;
  permit_holders?: string[];
}

@Injectable()
export class ECCWordGeneratorService {
  async generateECCreportWord(
    eccReport,
    eCCConditions,
  ): Promise<{ fileName: string; buffer: Buffer }> {
    eccReport.conditions = eCCConditions;
    const hasConditions = eccReport.conditions?.length > 0;
    const conditionsBySection = toConditionRows(eccReport.conditions);
    const children: (Paragraph | Table)[] = [];

    const columnWidths = [1474, 3088, 601, 601, 601, 2706]; // 6 columns (DXA)
    if (hasConditions) {
      for (const [
        sectionIndex,
        conditionRows,
      ] of conditionsBySection.entries()) {
        let permitHolderRow;
        if (sectionIndex > 1) {
          permitHolderRow = new TableRow({
            children: [
              new TableCell({
                columnSpan: 6, // merges across 6 columns
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: eccReport.permit_holders?.[sectionIndex] || '',
                        font: 'Times New Roman',
                        size: 24, // 24 half-points = 12pt
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        } else {
          children.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: eccReport.generalInfo.company_name || 'Company Name',
                  font: 'Times New Roman',
                  size: 24, // 12pt
                }),
              ],
            }),
            new Paragraph({ text: '' }), // spacing below company name
          );
        }
        const dataRows = conditionRows.map(
          (row) =>
            new TableRow({
              children: row.map(
                (cellText, i) =>
                  new TableCell({
                    width: { size: columnWidths[i], type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: cellText || '',
                            font: 'Times New Roman',
                            size: 24, // 24 half-points = 12pt
                          }),
                        ],
                      }),
                    ],
                  }),
              ),
            }),
        );
        let table;
        if (sectionIndex > 1) {
          table = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [permitHolderRow, ...dataRows],
          });
        } else {
          table = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [...dataRows],
          });
        }

        children.push(table, new Paragraph({ text: '' }));
      }
    }

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });

    const buffer = await Packer.toBuffer(doc);

    // ✅ Return both the filename and buffer
    const fileName = `${eccReport.filename || 'unnamed'}.docx`;

    return { fileName, buffer };
  }
}
