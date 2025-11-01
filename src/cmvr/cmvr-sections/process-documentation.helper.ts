import {
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  AlignmentType,
} from 'docx';
import {
  createTableBorders,
  createParagraph,
  createFormattedMemberParagraph,
} from './general-use.helper';

import type { CMVRGeneralInfo } from '../cmvr-pdf-generator.service';
export function createProcessDocumentation(
  pd: NonNullable<
    CMVRGeneralInfo['processDocumentationOfActivitiesUndertaken']
  >,
): (Paragraph | Table)[] {
  const arr: (Paragraph | Table)[] = [];

  const activityRows: TableRow[] = [];

  // Header row
  activityRows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [createParagraph('Activities', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph('Date Conducted', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph('MMT Members Involved', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph(
              'Methodology/ Other Remarks',
              true,
              AlignmentType.CENTER,
            ),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  );

  // "Document Review of:" row
  activityRows.push(
    new TableRow({
      height: { value: 400, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [
            createParagraph('Document Review of:', false, AlignmentType.LEFT),
          ],
          columnSpan: 4,
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    }),
  );

  // Collect all activities to calculate total rows for shared date
  const activities = [
    {
      label: 'Compliance with ECC Conditions/ Commitments',
      data: pd.activities?.complianceWithEccConditionsCommitments,
    },
    {
      label: 'Compliance with EPEP/ AEPEP Conditions',
      data: pd.activities?.complianceWithEpepAepepConditions,
    },
    {
      label: 'Site Ocular Validation',
      data: pd.activities?.siteOcularValidation,
    },
  ];

  // Calculate total member count for first 3 activities (they share the same date)
  const totalMembersForSharedDate = activities.reduce((total, activity) => {
    if (!activity.data) return total;
    const members = activity.data.mmtMembersInvolved;
    return total + (members && members.length > 0 ? members.length : 1);
  }, 0);

  let currentMemberIndex = 0;

  const addActivity = (
    label: string,
    data?: {
      mmtMembersInvolved?: string[];
      dateConducted?: string;
      remarks?: string;
    },
    isSharedDate = true,
  ) => {
    if (!data) return;
    const { mmtMembersInvolved: mmts, dateConducted: date, remarks } = data;
    const members = mmts && mmts.length > 0 ? mmts : ['-'];
    const rowCount = members.length;

    members.forEach((member, index) => {
      activityRows.push(
        new TableRow({
          height: { value: 400, rule: 'atLeast' },
          children: [
            // Activity label (only on first row, with rowSpan)
            ...(index === 0
              ? [
                  new TableCell({
                    children: [
                      createParagraph(label, false, AlignmentType.LEFT),
                    ],
                    rowSpan: rowCount,
                    verticalAlign: VerticalAlign.CENTER,
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  }),
                ]
              : []),
            // Date Conducted (merged for first 3 activities, separate for confirmatory sampling)
            ...(isSharedDate
              ? currentMemberIndex === 0
                ? [
                    new TableCell({
                      children: [
                        createParagraph(
                          date || pd.dateConducted || '-',
                          false,
                          AlignmentType.CENTER,
                        ),
                      ],
                      rowSpan: totalMembersForSharedDate,
                      verticalAlign: VerticalAlign.CENTER,
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                  ]
                : []
              : [
                  new TableCell({
                    children: [
                      createParagraph(
                        date || pd.dateConducted || '-',
                        false,
                        AlignmentType.CENTER,
                      ),
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    width: { size: 20, type: WidthType.PERCENTAGE },
                  }),
                ]),
            // Individual MMT Member
            new TableCell({
              children: [
                createFormattedMemberParagraph(member, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
            // Remarks (only on first row, with rowSpan)
            ...(index === 0
              ? [
                  new TableCell({
                    children: [
                      createParagraph(
                        remarks || pd.mergedMethodologyOrOtherRemarks || '-',
                        false,
                        AlignmentType.CENTER,
                      ),
                    ],
                    rowSpan: rowCount,
                    verticalAlign: VerticalAlign.CENTER,
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  }),
                ]
              : []),
          ],
        }),
      );
      currentMemberIndex++;
    });
  };

  // Add the first 3 activities with shared date
  activities.forEach((activity) => {
    addActivity(activity.label, activity.data, true);
  });

  // Special handling for Site Validation - Confirmatory Sampling (separate date)
  const samplingData = pd.activities?.siteValidationConfirmatorySampling;
  if (samplingData) {
    const members =
      samplingData.mmtMembersInvolved &&
      samplingData.mmtMembersInvolved.length > 0
        ? samplingData.mmtMembersInvolved
        : samplingData.none
          ? ['None']
          : ['-'];
    const rowCount = members.length;

    members.forEach((member, index) => {
      activityRows.push(
        new TableRow({
          height: { value: 400, rule: 'atLeast' },
          children: [
            ...(index === 0
              ? [
                  new TableCell({
                    children: [
                      createParagraph(
                        'Site Validation – Confirmatory Sampling (if needed)',
                        false,
                        AlignmentType.LEFT,
                      ),
                    ],
                    rowSpan: rowCount,
                    verticalAlign: VerticalAlign.CENTER,
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  }),
                ]
              : []),
            // Date Conducted for confirmatory sampling (not merged, can be different)
            ...(index === 0
              ? [
                  new TableCell({
                    children: [
                      createParagraph(
                        samplingData.none
                          ? 'None or Date Conducted'
                          : samplingData.dateConducted ||
                              pd.dateConducted ||
                              '-',
                        false,
                        AlignmentType.CENTER,
                      ),
                    ],
                    rowSpan: rowCount,
                    verticalAlign: VerticalAlign.CENTER,
                    width: { size: 20, type: WidthType.PERCENTAGE },
                  }),
                ]
              : []),
            new TableCell({
              children: [
                samplingData.none
                  ? createParagraph(
                      'None or MMT Members Involved',
                      false,
                      AlignmentType.CENTER,
                    )
                  : createFormattedMemberParagraph(
                      member,
                      AlignmentType.CENTER,
                    ),
              ],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
            ...(index === 0
              ? [
                  new TableCell({
                    children: [
                      createParagraph(
                        samplingData.none
                          ? 'None or Methodology/ Other Remarks'
                          : samplingData.remarks ||
                              pd.mergedMethodologyOrOtherRemarks ||
                              '-',
                        false,
                        AlignmentType.CENTER,
                      ),
                    ],
                    rowSpan: rowCount,
                    verticalAlign: VerticalAlign.CENTER,
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  }),
                ]
              : []),
          ],
        }),
      );
    });
  }

  arr.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createTableBorders(),
      rows: activityRows,
    }),
  );
  return arr;
}
