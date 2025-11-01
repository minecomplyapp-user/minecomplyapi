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

  const yn = (v: boolean | undefined) => (v ? 'Yes' : v === false ? 'No' : '-');

  // EPEP Commitments
  if (summary.complianceWithEpepCommitments) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              createParagraph('Compliance with EPEP Commitments', true),
            ],
            columnSpan: 4,
          }),
        ],
      }),
    );
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [createParagraph('Safety')] }),
          new TableCell({
            children: [
              createParagraph(yn(summary.complianceWithEpepCommitments.safety)),
            ],
          }),
          new TableCell({ children: [createParagraph('Social')] }),
          new TableCell({
            children: [
              createParagraph(yn(summary.complianceWithEpepCommitments.social)),
            ],
          }),
        ],
      }),
    );
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [createParagraph('Rehabilitation')],
          }),
          new TableCell({
            children: [
              createParagraph(
                yn(summary.complianceWithEpepCommitments.rehabilitation),
              ),
            ],
          }),
          new TableCell({ children: [createParagraph('Remarks')] }),
          new TableCell({
            children: [
              createParagraph(
                summary.complianceWithEpepCommitments.remarks || '-',
              ),
            ],
          }),
        ],
      }),
    );
  }

  // SDMP Commitments
  if (summary.complianceWithSdmpCommitments) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              createParagraph('Compliance with SDMP Commitments', true),
            ],
            columnSpan: 4,
          }),
        ],
      }),
    );
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [createParagraph('Complied')] }),
          new TableCell({
            children: [
              createParagraph(
                yn(summary.complianceWithSdmpCommitments.complied),
              ),
            ],
          }),
          new TableCell({ children: [createParagraph('Not Complied')] }),
          new TableCell({
            children: [
              createParagraph(
                yn(summary.complianceWithSdmpCommitments.notComplied),
              ),
            ],
          }),
        ],
      }),
    );
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [createParagraph('Remarks')] }),
          new TableCell({
            children: [
              createParagraph(
                summary.complianceWithSdmpCommitments.remarks || '-',
              ),
            ],
            columnSpan: 3,
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
        children: [
          new TableCell({
            children: [createParagraph('Complaints Management', true)],
            columnSpan: 4,
          }),
        ],
      }),
    );
    const addPair = (k: string, v?: boolean) =>
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [createParagraph(k)] }),
            new TableCell({
              children: [createParagraph(yn(v))],
              columnSpan: 3,
            }),
          ],
        }),
      );
    addPair('N/A for all', c.naForAll);
    addPair('Complaint Receiving Setup', c.complaintReceivingSetup);
    addPair('Case Investigation', c.caseInvestigation);
    addPair('Implementation of Control', c.implementationOfControl);
    addPair(
      'Communication w/ Complainant/Public',
      c.communicationWithComplainantOrPublic,
    );
    addPair('Complaint Documentation', c.complaintDocumentation);
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [createParagraph('Remarks')] }),
          new TableCell({
            children: [createParagraph(c.remarks || '-')],
            columnSpan: 3,
          }),
        ],
      }),
    );
  }

  // Accountability
  if (summary.accountability) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [createParagraph('Accountability', true)],
            columnSpan: 4,
          }),
        ],
      }),
    );
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [createParagraph('Complied')] }),
          new TableCell({
            children: [createParagraph(yn(summary.accountability.complied))],
          }),
          new TableCell({ children: [createParagraph('Not Complied')] }),
          new TableCell({
            children: [createParagraph(yn(summary.accountability.notComplied))],
          }),
        ],
      }),
    );
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [createParagraph('Remarks')] }),
          new TableCell({
            children: [createParagraph(summary.accountability.remarks || '-')],
            columnSpan: 3,
          }),
        ],
      }),
    );
  }

  // Others
  if (summary.others) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [createParagraph('Others', true)],
            columnSpan: 4,
          }),
        ],
      }),
    );
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [createParagraph('Specify')] }),
          new TableCell({
            children: [createParagraph(summary.others.specify || '-')],
            columnSpan: 3,
          }),
        ],
      }),
    );
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [createParagraph('N/A')] }),
          new TableCell({
            children: [createParagraph(yn(summary.others.na))],
            columnSpan: 3,
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
