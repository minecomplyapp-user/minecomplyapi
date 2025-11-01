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
import {
  createFundTable,
  createTableBorders,
  createText,
  createParagraph,
  createKeyValueTable,
} from './general-use.helper';

export function createExecutiveSummaryTable(
  summary: NonNullable<CMVRGeneralInfo['executiveSummaryOfCompliance']>,
): Table {
  const rows: TableRow[] = [];

  // Helper functions for Y and N columns
  const yCol = (v: boolean | undefined) => (v === true ? '✓' : '');
  const nCol = (v: boolean | undefined) => (v === false ? '✓' : '');

  // Header row
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [
            createParagraph('Requirements', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 58, type: WidthType.PERCENTAGE },
          columnSpan: 2,
        }),
        new TableCell({
          children: [createParagraph('Complied?', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          columnSpan: 2,
          width: { size: 14, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph(
              'Remarks/ ECC or EPEP Condition #',
              true,
              AlignmentType.CENTER,
            ),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 28, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  );

  // Sub-header for Y/N
  rows.push(
    new TableRow({
      height: { value: 400, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [createParagraph('', false, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [createParagraph('', false, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 33, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [createParagraph('Y', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 7, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [createParagraph('N', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 7, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [createParagraph('', false, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 28, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  );

  // EPEP Commitments
  if (summary.complianceWithEpepCommitments) {
    const epep = summary.complianceWithEpepCommitments;
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(
                'Compliance with EPEP Commitments',
                true,
                AlignmentType.LEFT,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: 3,
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [createParagraph('Safety', false, AlignmentType.LEFT)],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 33, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(yCol(epep.safety), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 7, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(nCol(epep.safety), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 7, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(
                epep.remarks || 'Conducted by MGB RO1',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: 3,
            width: { size: 28, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    );
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [createParagraph('Social', false, AlignmentType.LEFT)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(yCol(epep.social), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(nCol(epep.social), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph('Rehabilitation', false, AlignmentType.LEFT),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                yCol(epep.rehabilitation),
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                nCol(epep.rehabilitation),
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );
  }

  // SDMP Commitments
  if (summary.complianceWithSdmpCommitments) {
    const sdmp = summary.complianceWithSdmpCommitments;
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(
                'Compliance with SDMP Commitments',
                false,
                AlignmentType.LEFT,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            columnSpan: 2,
            width: { size: 58, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(yCol(sdmp.complied), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 7, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(nCol(sdmp.complied), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 7, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(
                sdmp.remarks || 'Conducted by MGB RO1 (SDS)',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 28, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    );
  }

  // Complaints Management
  if (summary.complaintsManagement) {
    const c = summary.complaintsManagement;
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(
                'Complaints Management',
                true,
                AlignmentType.LEFT,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: 5,
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(
                'Complaint receiving set-up',
                false,
                AlignmentType.LEFT,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 33, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(
                yCol(c.complaintReceivingSetup),
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 7, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(
                nCol(c.complaintReceivingSetup),
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 7, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(
                c.remarks || 'No complaints against the proponent',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: 5,
            width: { size: 28, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    );
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph('Case investigation', false, AlignmentType.LEFT),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                yCol(c.caseInvestigation),
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                nCol(c.caseInvestigation),
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(
                'Implementation of control',
                false,
                AlignmentType.LEFT,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                yCol(c.implementationOfControl),
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                nCol(c.implementationOfControl),
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(
                'Communication with the complainant/ public',
                false,
                AlignmentType.LEFT,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                yCol(c.communicationWithComplainantOrPublic),
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                nCol(c.communicationWithComplainantOrPublic),
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(
                'Complaint documentation',
                false,
                AlignmentType.LEFT,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                yCol(c.complaintDocumentation),
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                nCol(c.complaintDocumentation),
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );
  }

  // Accountability
  if (summary.accountability) {
    const acc = summary.accountability;
    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(
                'Accountability – qualified personnel are charged with the routine monitoring of the project activities in terms of education, training, knowledge and experience of the environmental team',
                false,
                AlignmentType.LEFT,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            columnSpan: 2,
            width: { size: 58, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(yCol(acc.complied), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 7, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(nCol(acc.complied), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 7, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(
                acc.remarks ||
                  'Engr. Roque B. Palmes is registered as part-time MEPEO Head on Sep. 18, 2023',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 28, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    );
  }

  // Others
  if (summary.others) {
    const other = summary.others;
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(
                'Others, please specify',
                false,
                AlignmentType.LEFT,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            columnSpan: 2,
            width: { size: 58, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(yCol(other.na), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 7, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(nCol(other.na), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 7, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(other.specify || '', false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 28, type: WidthType.PERCENTAGE },
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
