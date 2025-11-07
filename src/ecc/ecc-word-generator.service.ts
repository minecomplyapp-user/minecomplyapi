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
  Numbering,
} from 'docx';

import { toConditionRows } from './ecc-pdf.helpers';
// This definition is now used correctly!
const bulletList = new Numbering({
  config: [
    {
      // Give it a unique and consistent reference ID
      reference: "my-custom-bullet", 
      levels: [
        {
          level: 0, // This is the level used in your paragraph loop
          format: "bullet",
          text: "•", // The character used for the bullet
          style: {
            // Optional: for standard Word bullet indentation
            paragraph: {
              indent: { left: 720, hanging: 360 },
            },
          },
        },
      ],
    },
  ],
});
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
      for (const [
        sectionIndex,
        conditionRows,
      ] of conditionsBySection.entries()) {
        let permitHolderRow;
    
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
    
        
          table = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [permitHolderRow, ...dataRows],
          });
        

        children.push(table, new Paragraph({ text: '' }));
          const values = eccReport.remarks_list[sectionIndex];
        
// Check if values is an array and not empty
        if (Array.isArray(values) && values.length > 0) {
          children.push(new Paragraph({ text: 'Remarks' })); // Title for the remarks section
          values.forEach((value) => {
            // Check if the remark is not an empty string
            if (value && value.trim() !== '') {
              children.push(
                new Paragraph({
                  // 1. Set the text content
                  children: [new TextRun(value)],
                  // 2. Define the numbering/list properties to make it a bullet point
                  numbering: {
                    reference: 'my-custom-bullet', // 👈 USE THE DEFINED CUSTOM REFERENCE
                    level: 0, // Top-level bullet point
                  },
                })
              );
            }
          });
        }

         children.push(new Paragraph({ text: '' }));
      }
    }


 const values = eccReport.recommendations;

if (Array.isArray(values) && values.length > 0) {
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "Remarks", bold: true })],
      spacing: { after: 200 },
    })
  );

  values.forEach((value) => {
    if (value && value.trim() !== "") {
      children.push(
        new Paragraph({
          children: [new TextRun(value.trim())],
          numbering: {
            reference: "my-custom-bullet", // Must match document config
            level: 0,
          },
        })
      );
    }
  });
}




    const doc = new Document({
      // ✅ FIX: Include the numbering definition here
      numbering: {config: [
    {
      // Give it a unique and consistent reference ID
      reference: "my-custom-bullet", 
      levels: [
        {
          level: 0, // This is the level used in your paragraph loop
          format: "bullet",
          text: "•", // The character used for the bullet
          style: {
            // Optional: for standard Word bullet indentation
            paragraph: {
              indent: { left: 720, hanging: 360 },
            },
          },
        },
      ],
    },
  ],}, 
      sections: [{ properties: {}, children }],
    });

    const buffer = await Packer.toBuffer(doc);

    // ✅ Return both the filename and buffer
    const fileName = `${eccReport.filename || 'unnamed'}.docx`;

    return { fileName, buffer };
  }
}