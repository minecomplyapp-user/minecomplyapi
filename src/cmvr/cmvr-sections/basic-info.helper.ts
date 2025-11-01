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
import type { CMVRGeneralInfo } from '../cmvr-pdf-generator.service';
import {
  createTableBorders,
  createParagraph,
  createKeyValueTable,
} from './general-use.helper';

export function createGeneralInfoKeyValues(
  generalInfo: CMVRGeneralInfo,
): (Paragraph | Table)[] {
  const paragraphs: (Paragraph | Table)[] = [];

  // Top page header format
  // "{quarter} QUARTER CY {year} MMT COMPLIANCE MONITORING AND VALIDATION REPORT"
  if (generalInfo.quarter || generalInfo.year) {
    const quarterText = (generalInfo.quarter || '').toString().toUpperCase();
    const yearText = generalInfo.year != null ? String(generalInfo.year) : '';
    const headerLine =
      `${quarterText} QUARTER CY ${yearText} MMT COMPLIANCE MONITORING`.trim();
    if (headerLine) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: headerLine,
              bold: true,
              font: 'Arial',
              size: 22,
              color: '000000',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
      );

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'AND VALIDATION REPORT',
              bold: true,
              font: 'Arial',
              size: 22,
              color: '000000',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '',
              bold: true,
              font: 'Arial',
              size: 22,
              color: '000000',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
      );
    }
  }

  // Company Name (bold, Arial 11pt)
  if (generalInfo.companyName) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: generalInfo.companyName.toUpperCase(),
            bold: true,
            font: 'Arial',
            size: 22, // 11pt
            color: '000000',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      }),
    );
  }

  // Specific coverage line
  paragraphs.push(
    new Table({
      width: { size: 70, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: '(This CMVR covers the ISAG Permit of ONRI and Fourteen (14) ISAG Permits under Supply Agreement with ONRI)',
                      font: 'Arial',
                      size: 22,
                      color: '000000',
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 100 },
                }),
              ],
              width: { size: 70, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ],
    }),
  );

  paragraphs.push(
    new Paragraph({
      children: [],
      spacing: { after: 20 },
    }),
  );

  // Location
  const locationStr =
    typeof generalInfo.location === 'string'
      ? generalInfo.location
      : generalInfo.location
        ? `Lat: ${generalInfo.location.latitude}, Long: ${generalInfo.location.longitude}`
        : '';

  if (locationStr) {
    paragraphs.push(
      new Table({
        width: { size: 93, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.CENTER,
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          insideHorizontal: {
            style: BorderStyle.NONE,
            size: 0,
            color: 'FFFFFF',
          },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: locationStr.toUpperCase(),
                        font: 'Arial',
                        size: 22,
                        color: '000000',
                        bold: true,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                  }),
                ],
                width: { size: 120, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
        ],
      }),
    );
  }

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '',
          bold: true,
          font: 'Arial',
          size: 22,
          color: '000000',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  );

  // Dates as table
  const dateRows: TableRow[] = [];

  if (generalInfo.dateOfComplianceMonitoringAndValidation) {
    dateRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Date of Compliance Monitoring and Validation:',
                    font: 'Arial',
                    size: 22,
                    color: '000000',
                    bold: false,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: generalInfo.dateOfComplianceMonitoringAndValidation,
                    font: 'Arial',
                    size: 22,
                    color: '000000',
                    bold: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    );
  }

  if (generalInfo.monitoringPeriodCovered) {
    dateRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Monitoring Period Covered:',
                    font: 'Arial',
                    size: 22,
                    color: '000000',
                    bold: false,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: generalInfo.monitoringPeriodCovered,
                    font: 'Arial',
                    size: 22,
                    color: '000000',
                    bold: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    );
  }

  if (generalInfo.dateOfCmrSubmission) {
    dateRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Date of CMR Submission:',
                    font: 'Arial',
                    size: 22,
                    color: '000000',
                    bold: false,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: generalInfo.dateOfCmrSubmission,
                    font: 'Arial',
                    size: 22,
                    color: '000000',
                    bold: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    );
  }

  if (dateRows.length > 0) {
    paragraphs.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.CENTER,
        borders: createTableBorders(),
        rows: dateRows,
      }),
    );
  }

  return paragraphs;
}

export function createECCTable(
  eccList: Array<{
    permitHolderName?: string;
    eccNumber?: string;
    dateOfIssuance?: string;
  }>,
): Table {
  const rows: TableRow[] = [];

  // Header row with merged label cell
  rows.push(
    new TableRow({
      height: {
        value: 600, // Height in twips (e.g., 600 twips ≈ 1.06 cm)
        rule: 'atLeast', // or 'exact' for fixed height
      },
      children: [
        // Label cell (merged vertically across all rows)
        new TableCell({
          children: [createParagraph('ECC', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: eccList.length + 1, // +1 for header row
          width: { size: 12, type: WidthType.PERCENTAGE },
        }),
        // Colon column
        new TableCell({
          children: [createParagraph(':', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: eccList.length + 1,
          width: { size: 3, type: WidthType.PERCENTAGE },
        }),
        // Header columns
        new TableCell({
          children: [
            createParagraph(
              'Name of Permit Holder',
              true,
              AlignmentType.CENTER,
            ),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 40, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [createParagraph('ECC Number', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph('Date of Issuance', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  );

  // Data rows
  eccList.forEach((ecc) => {
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          // No label cell here (it's merged from first row)
          new TableCell({
            children: [
              createParagraph(
                ecc.permitHolderName || 'N/A',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                ecc.eccNumber || 'N/A',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                ecc.dateOfIssuance || 'N/A',
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
export function createISAGTable(
  isagList: Array<{
    permitHolderName?: string;
    isagPermitNumber?: string;
    dateOfIssuance?: string;
  }>,
): Table {
  const rows: TableRow[] = [];

  // Header row with merged label cell
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [createParagraph('ISAG/MPP', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: isagList.length + 1,
          width: { size: 12, type: WidthType.PERCENTAGE },
        }),
        // Colon column
        new TableCell({
          children: [createParagraph(':', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: isagList.length + 1,
          width: { size: 3, type: WidthType.PERCENTAGE },
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
          width: { size: 40, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph('ISAG Permit Number', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph('Date of Issuance', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  );

  // Data rows
  isagList.forEach((isag) => {
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(
                isag.permitHolderName || 'N/A',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                isag.isagPermitNumber || 'N/A',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                isag.dateOfIssuance || 'N/A',
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

export function createEPEPTable(
  epepList: Array<{
    permitHolderName?: string;
    epepNumber?: string;
    dateOfApproval?: string;
  }>,
): Table {
  const rows: TableRow[] = [];

  // Header row (with label and ':' spanning all data rows)
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [
            createParagraph('EPEP/FMRDP Status', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: epepList.length + 1,
          width: { size: 12, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [createParagraph(':', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: epepList.length + 1,
          width: { size: 3, type: WidthType.PERCENTAGE },
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
          width: { size: 40, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph('EPEP Number', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph('Date of Approval', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  );

  // Data rows
  epepList.forEach((epep) => {
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(
                epep.permitHolderName || 'N/A',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                epep.epepNumber || 'N/A',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                epep.dateOfApproval || 'N/A',
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

export function createFundStatusSections(
  generalInfo: CMVRGeneralInfo,
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  const rcf = generalInfo.rehabilitationCashFund || [];
  const mtf = generalInfo.monitoringTrustFundUnified || [];
  const fmrdf = generalInfo.finalMineRehabilitationAndDecommissioningFund || [];

  const sections: Array<{
    title: string;
    list: Array<{
      permitHolderName?: string;
      savingsAccountNumber?: string;
      amountDeposited?: string;
      dateUpdated?: string;
    }>;
  }> = [];
  if (rcf.length)
    sections.push({ title: 'REHABILITATION CASH FUND', list: rcf });
  if (mtf.length)
    sections.push({ title: 'MONITORING TRUST FUND (UNIFIED)', list: mtf });
  if (fmrdf.length)
    sections.push({
      title: 'FINAL MINE REHABILITATION AND DECOMMISSIONING FUND',
      list: fmrdf,
    });

  if (sections.length === 0) return elements;

  // Build a single consolidated table with a left label column.
  const LABEL_COL_WIDTH = 15; // %
  const NAME_COL = 30;
  const ACCT_COL = 25;
  const AMOUNT_COL = 15;
  const DATE_COL = 15; // totals to 85% on the right side

  const rows: TableRow[] = [];

  // Compute total number of rows to span the label cell across:
  // For each section: 1 (section title header) + 1 (column header) + N (data rows)
  const totalRowsToSpan = sections.reduce(
    (sum, s) => sum + 1 + 1 + s.list.length,
    0,
  );

  const addColumnHeader = () =>
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [
            createParagraph(
              'Name of Permit Holder',
              true,
              AlignmentType.CENTER,
            ),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: NAME_COL, type: WidthType.PERCENTAGE },
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
          width: { size: ACCT_COL, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph('Amount Deposited', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: AMOUNT_COL, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph('Date Updated', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: DATE_COL, type: WidthType.PERCENTAGE },
        }),
      ],
    });

  let isFirstRow = true;
  for (const section of sections) {
    // Section title row
    if (isFirstRow) {
      rows.push(
        new TableRow({
          height: { value: 600, rule: 'atLeast' },
          children: [
            new TableCell({
              children: [
                createParagraph(
                  'RCF/ MTF and FMRDF Status',
                  true,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
              rowSpan: totalRowsToSpan,
              width: { size: LABEL_COL_WIDTH, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                createParagraph(section.title, true, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
              columnSpan: 4,
              width: { size: 85, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      );
      isFirstRow = false;
    } else {
      rows.push(
        new TableRow({
          height: { value: 600, rule: 'atLeast' },
          children: [
            new TableCell({
              children: [
                createParagraph(section.title, true, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
              columnSpan: 4,
              width: { size: 85, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      );
    }

    // Column header row for this section
    rows.push(addColumnHeader());

    // Data rows
    for (const fund of section.list) {
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
              width: { size: NAME_COL, type: WidthType.PERCENTAGE },
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
              width: { size: ACCT_COL, type: WidthType.PERCENTAGE },
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
              width: { size: AMOUNT_COL, type: WidthType.PERCENTAGE },
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
              width: { size: DATE_COL, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      );
    }
  }

  // Add a bit of spacing before the table for readability
  elements.push(new Paragraph({ text: '', spacing: { after: 100 } }));
  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createTableBorders(),
      rows,
    }),
  );

  return elements;
}

export function createAdditionalInfo(
  generalInfo: CMVRGeneralInfo,
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const rows: Array<[string, string]> = [];

  // Geographical Coordinates
  if (generalInfo.projectGeographicalCoordinates) {
    const coordStr =
      typeof generalInfo.projectGeographicalCoordinates === 'string'
        ? generalInfo.projectGeographicalCoordinates
        : `X: ${generalInfo.projectGeographicalCoordinates.x}, Y: ${generalInfo.projectGeographicalCoordinates.y}`;
    rows.push(['Project Geographical Coordinates', coordStr]);
  }

  // Proponent info
  if (generalInfo.proponent) {
    if (generalInfo.proponent.contactPersonAndPosition) {
      rows.push([
        'Proponent - Contact Person and Position',
        generalInfo.proponent.contactPersonAndPosition,
      ]);
    }
    if (generalInfo.proponent.mailingAddress) {
      rows.push([
        'Proponent - Mailing Address',
        generalInfo.proponent.mailingAddress,
      ]);
    }
    if (generalInfo.proponent.telephoneFax) {
      rows.push([
        'Proponent - Telephone/Fax',
        generalInfo.proponent.telephoneFax,
      ]);
    }
    if (generalInfo.proponent.emailAddress) {
      rows.push([
        'Proponent - Email Address',
        generalInfo.proponent.emailAddress,
      ]);
    }
  }

  // MMT info
  if (generalInfo.mmt) {
    if (generalInfo.mmt.contactPersonAndPosition) {
      rows.push([
        'MMT - Contact Person and Position',
        generalInfo.mmt.contactPersonAndPosition,
      ]);
    }
    if (generalInfo.mmt.mailingAddress) {
      rows.push(['MMT - Mailing Address', generalInfo.mmt.mailingAddress]);
    }
    if (generalInfo.mmt.telephoneFax) {
      rows.push(['MMT - Telephone/Fax', generalInfo.mmt.telephoneFax]);
    }
    if (generalInfo.mmt.emailAddress) {
      rows.push(['MMT - Email Address', generalInfo.mmt.emailAddress]);
    }
  }

  if (rows.length > 0) {
    elements.push(createKeyValueTable(rows));
  }

  return elements;
}
