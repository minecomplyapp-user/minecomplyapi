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
import {
  createFundTable,
  createTableBorders,
  createText,
  createParagraph,
  createKeyValueTable,
} from './general-use.helper';

import type { CMVRGeneralInfo } from '../cmvr-pdf-generator.service';
export function createProcessDocumentation(
  pd: NonNullable<
    CMVRGeneralInfo['processDocumentationOfActivitiesUndertaken']
  >,
): (Paragraph | Table)[] {
  const arr: (Paragraph | Table)[] = [];
  if (pd.dateConducted)
    arr.push(createParagraph(`Date Conducted: ${pd.dateConducted}`));
  if (pd.mergedMethodologyOrOtherRemarks)
    arr.push(createParagraph(`Remarks: ${pd.mergedMethodologyOrOtherRemarks}`));

  const activityRows: TableRow[] = [];
  activityRows.push(
    new TableRow({
      children: [
        new TableCell({ children: [createParagraph('Activity', true)] }),
        new TableCell({
          children: [createParagraph('MMT Members Involved', true)],
        }),
        new TableCell({
          children: [createParagraph('Date Conducted', true)],
        }),
        new TableCell({ children: [createParagraph('Remarks', true)] }),
      ],
    }),
  );

  const add = (
    label: string,
    data?: {
      mmtMembersInvolved?: string[];
      dateConducted?: string;
      remarks?: string;
    },
  ) => {
    if (!data) return;
    const { mmtMembersInvolved: mmts, dateConducted: date, remarks } = data;
    activityRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [createParagraph(label)] }),
          new TableCell({
            children: [createParagraph(mmts?.join(', ') || '-')],
          }),
          new TableCell({ children: [createParagraph(date || '-')] }),
          new TableCell({ children: [createParagraph(remarks || '-')] }),
        ],
      }),
    );
  };

  add(
    'Compliance with ECC Conditions & Commitments',
    pd.activities?.complianceWithEccConditionsCommitments,
  );
  add(
    'Compliance with EPEP/AEPEP Conditions',
    pd.activities?.complianceWithEpepAepepConditions,
  );
  add('Site Ocular Validation', pd.activities?.siteOcularValidation);
  add(
    'Site Validation Confirmatory Sampling',
    pd.activities?.siteValidationConfirmatorySampling,
  );

  arr.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createTableBorders(),
      rows: activityRows,
    }),
  );
  return arr;
}
