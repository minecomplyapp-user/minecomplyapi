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
  VerticalAlign,
  BorderStyle,
} from 'docx';
import type { CMVRGeneralInfo } from './cmvr-pdf-generator.service';

import {
  createTableBorders,
  createText,
  createParagraph,
} from './cmvr-sections/general-use.helper';

import {
  createGeneralInfoKeyValues,
  createECCTable,
  createAdditionalInfo,
  createISAGTable,
} from './cmvr-sections/basic-info.helper';
import {
  createComplaintsVerificationAndManagement,
  createRecommendationTable,
  complianceWithGoodPracticeInChemicalSafetyManagement,
  createComplianceToProjectLocationTable,
  createComplianceToImpactManagementCommitmentsTables,
  createAirQualitySection,
  createWaterQualitySection,
  createNoiseQualityTable,
  createSolidAndHazardousWasteSection,
} from './cmvr-sections/compliance-monitoring.helper';
import { createProcessDocumentation } from './cmvr-sections/process-documentation.helper';
import { createExecutiveSummaryTable } from './cmvr-sections/executive-summary-compliance.helper';
// Importing the richer interface from PDF generator for parity

@Injectable()
export class CMVRDocxGeneratorService {
  /**
   * Generate CMVR General Information as DOCX
   * Following the same structure as PDF generator
   */
  async generateGeneralInfoDocx(generalInfo: CMVRGeneralInfo): Promise<Buffer> {
    try {
      const children: (Paragraph | Table)[] = [];
      // Key-value pairs at the top (like PDF)
      children.push(...createGeneralInfoKeyValues(generalInfo));

      // Section I: BASIC INFORMATION
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'I. BASIC INFORMATION',
              bold: true,
              font: 'Arial',
              size: 22, // 11pt
              color: '000000',
            }),
          ],
          spacing: { before: 300, after: 200 },
        }),
      );

      // ECC Table
      if (generalInfo.ecc && generalInfo.ecc.length > 0) {
        children.push(createECCTable(generalInfo.ecc));
      }

      // ISAG/MPP Table (connected to ECC if both exist)
      if (generalInfo.isagMpp && generalInfo.isagMpp.length > 0) {
        children.push(createISAGTable(generalInfo.isagMpp));
      }

      // Project info (Current Name, Status) + EPEP merged into a single 5-column table
      const projectInfoRows: Array<[string, string]> = [];
      if (generalInfo.projectCurrentName) {
        projectInfoRows.push([
          'Project Current Name',
          generalInfo.projectCurrentName,
        ]);
      }
      if (generalInfo.projectStatus) {
        projectInfoRows.push(['Project Status', generalInfo.projectStatus]);
      }

      if (
        projectInfoRows.length > 0 ||
        (generalInfo.epep && generalInfo.epep.length > 0)
      ) {
        // Small spacing before merged table
        children.push(new Paragraph({ text: '', spacing: { after: 100 } }));

        const mergedRows: TableRow[] = [];

        // Add Project Info rows (Label | ':' | Value spans 3 columns)
        for (const [label, value] of projectInfoRows) {
          mergedRows.push(
            new TableRow({
              height: { value: 400, rule: 'atLeast' },
              children: [
                new TableCell({
                  children: [
                    createParagraph(label, true, AlignmentType.CENTER),
                  ],
                  width: { size: 15, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [createParagraph(':', true, AlignmentType.CENTER)],
                  width: { size: 3, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [
                    createParagraph(
                      value || 'N/A',
                      false,
                      AlignmentType.CENTER,
                    ),
                  ],
                  width: { size: 82, type: WidthType.PERCENTAGE },
                  columnSpan: 4,
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            }),
          );
        }

        // Add EPEP header and rows (with label + ':' sharing vertical span)
        const epepList = generalInfo.epep || [];
        if (epepList.length >= 0) {
          // Header row
          mergedRows.push(
            new TableRow({
              height: { value: 600, rule: 'atLeast' },
              children: [
                new TableCell({
                  children: [
                    createParagraph(
                      'EPEP/FMRDP Status',
                      true,
                      AlignmentType.CENTER,
                    ),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                  rowSpan: epepList.length + 1,
                  width: { size: 15, type: WidthType.PERCENTAGE },
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
                  width: { size: 30, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [
                    createParagraph('EPEP Number', true, AlignmentType.CENTER),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                  width: { size: 25, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [
                    createParagraph(
                      'Date of Approval',
                      true,
                      AlignmentType.CENTER,
                    ),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                  columnSpan: 2,
                }),
              ],
            }),
          );

          // Data rows
          for (const epep of epepList) {
            mergedRows.push(
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
                    columnSpan: 2,
                  }),
                ],
              }),
            );
          }
        }

        // Append Funds into the same merged table (single table output)
        const rcf = generalInfo.rehabilitationCashFund || [];
        const mtf = generalInfo.monitoringTrustFundUnified || [];
        const fmrdf =
          generalInfo.finalMineRehabilitationAndDecommissioningFund || [];
        const fundSections: Array<{
          title: string;
          list: Array<{
            permitHolderName?: string;
            savingsAccountNumber?: string;
            amountDeposited?: string;
            dateUpdated?: string;
          }>;
        }> = [];
        if (rcf.length)
          fundSections.push({ title: 'REHABILITATION CASH FUND', list: rcf });
        if (mtf.length)
          fundSections.push({
            title: 'MONITORING TRUST FUND (UNIFIED)',
            list: mtf,
          });
        if (fmrdf.length)
          fundSections.push({
            title: 'FINAL MINE REHABILITATION AND DECOMMISSIONING FUND',
            list: fmrdf,
          });

        const totalFundRows = fundSections.reduce(
          (sum, s) => sum + 1 + 1 + s.list.length,
          0,
        ); // section header + col header + data rows
        let placedFundLabel = false;
        const NAME_COL = 30;
        const ACCT_COL = 25;
        const AMOUNT_COL = 15;
        const DATE_COL = 12; // totals 82 with above

        for (const section of fundSections) {
          // Section title row
          if (!placedFundLabel) {
            mergedRows.push(
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
                    rowSpan: totalFundRows,
                    width: { size: 15, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      createParagraph('', false, AlignmentType.CENTER),
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    width: { size: 3, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      createParagraph(
                        section.title,
                        true,
                        AlignmentType.CENTER,
                      ),
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    columnSpan: 4,
                  }),
                ],
              }),
            );
            placedFundLabel = true;
          } else {
            mergedRows.push(
              new TableRow({
                height: { value: 600, rule: 'atLeast' },
                children: [
                  new TableCell({
                    children: [
                      createParagraph('', false, AlignmentType.CENTER),
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    width: { size: 3, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      createParagraph(
                        section.title,
                        true,
                        AlignmentType.CENTER,
                      ),
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    columnSpan: 4,
                  }),
                ],
              }),
            );
          }

          // Column headers for funds
          mergedRows.push(
            new TableRow({
              height: { value: 600, rule: 'atLeast' },
              children: [
                new TableCell({
                  children: [createParagraph('', false, AlignmentType.CENTER)],
                  verticalAlign: VerticalAlign.CENTER,
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
                    createParagraph(
                      'Amount Deposited',
                      true,
                      AlignmentType.CENTER,
                    ),
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
            }),
          );

          for (const fund of section.list) {
            mergedRows.push(
              new TableRow({
                height: { value: 400, rule: 'atLeast' },
                children: [
                  new TableCell({
                    children: [
                      createParagraph('', false, AlignmentType.CENTER),
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    width: { size: 3, type: WidthType.PERCENTAGE },
                  }),
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

        // Push single merged table
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: createTableBorders(),
            rows: mergedRows,
          }),
        );
      }

      // Fund Status Section (Rehabilitation Cash Fund, MTF, FMRDF)
      // Fund sections are now merged into the EPEP table above

      // Additional Information (Geographical Coordinates, Proponent, MMT)
      const additionalInfo = createAdditionalInfo(generalInfo);
      if (additionalInfo.length > 0) {
        children.push(
          new Paragraph({ text: '', spacing: { after: 200 } }), // Spacing
        );
        children.push(...additionalInfo);
      }

      // Margins in twips: top 2cm=1134, left 2cm=1134, bottom 2.5cm=1418, right 1.8cm=1021
      // Page size remains 21.59 cm x 33.02 cm
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: {
                  width: 12240, // 21.59 cm in twips
                  height: 18720, // 33.02 cm in twips
                },
                margin: {
                  top: 1134, // 2 cm
                  left: 1134, // 2 cm
                  bottom: 1418, // 2.5 cm
                  right: 1021, // 1.8 cm
                },
              },
            },
            children,
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      return buffer;
    } catch (error) {
      throw new Error(
        `Failed to generate DOCX: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Generate the FULL CMVR report as DOCX using cmvrReport mock shape
   * Mirrors PDF sections: General Info, Executive Summary, Process Documentation,
   * Compliance tables, Air/Water/Noise, Solid & Hazardous Waste
   */
  async generateFullReportDocx(
    info: CMVRGeneralInfo,
    attendanceData?: any,
  ): Promise<Buffer> {
    const children: (Paragraph | Table)[] = [];

    children.push(...createGeneralInfoKeyValues(info));
    children.push(
      new Paragraph({
        children: [createText('I. BASIC INFORMATION', true)],
        spacing: { before: 300, after: 200 },
      }),
    );
    if (info.ecc?.length) children.push(createECCTable(info.ecc));
    if (info.isagMpp?.length) children.push(createISAGTable(info.isagMpp));

    const projRows: Array<[string, string]> = [];
    if (info.projectCurrentName)
      projRows.push(['Project Current Name', info.projectCurrentName]);
    if (info.projectStatus)
      projRows.push(['Project Status', info.projectStatus]);

    if (
      projRows.length ||
      (info.epep && info.epep.length) ||
      info.rehabilitationCashFund?.length ||
      info.monitoringTrustFundUnified?.length ||
      info.finalMineRehabilitationAndDecommissioningFund?.length
    ) {
      // small spacing before merged table
      children.push(new Paragraph({ text: '', spacing: { after: 100 } }));

      const mergedRows: TableRow[] = [];
      // Project rows first (Label | ':' | Value spans 3 cols)
      for (const [label, value] of projRows) {
        mergedRows.push(
          new TableRow({
            height: { value: 400, rule: 'atLeast' },
            children: [
              new TableCell({
                children: [createParagraph(label, true, AlignmentType.CENTER)],
                width: { size: 15, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [createParagraph(':', true, AlignmentType.CENTER)],
                width: { size: 3, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [
                  createParagraph(value || 'N/A', false, AlignmentType.CENTER),
                ],
                width: { size: 82, type: WidthType.PERCENTAGE },
                columnSpan: 4,
                verticalAlign: VerticalAlign.CENTER,
              }),
            ],
          }),
        );
      }

      const epepList = info.epep || [];
      // EPEP header + data (with label + ':' rowSpan across header+data rows)
      mergedRows.push(
        new TableRow({
          height: { value: 600, rule: 'atLeast' },
          children: [
            new TableCell({
              children: [
                createParagraph(
                  'EPEP/FMRDP Status',
                  true,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
              rowSpan: epepList.length + 1,
              width: { size: 15, type: WidthType.PERCENTAGE },
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
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                createParagraph('EPEP Number', true, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                createParagraph('Date of Approval', true, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
              columnSpan: 2,
            }),
          ],
        }),
      );

      for (const epep of epepList) {
        mergedRows.push(
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
                columnSpan: 2,
              }),
            ],
          }),
        );
      }

      // Append Funds into the same merged table (single table output)
      const rcf = info.rehabilitationCashFund || [];
      const mtf = info.monitoringTrustFundUnified || [];
      const fmrdf = info.finalMineRehabilitationAndDecommissioningFund || [];
      const fundSections: Array<{
        title: string;
        list: Array<{
          permitHolderName?: string;
          savingsAccountNumber?: string;
          amountDeposited?: string;
          dateUpdated?: string;
        }>;
      }> = [];
      if (rcf.length)
        fundSections.push({ title: 'REHABILITATION CASH FUND', list: rcf });
      if (mtf.length)
        fundSections.push({
          title: 'MONITORING TRUST FUND (UNIFIED)',
          list: mtf,
        });
      if (fmrdf.length)
        fundSections.push({
          title: 'FINAL MINE REHABILITATION AND DECOMMISSIONING FUND',
          list: fmrdf,
        });

      const totalFundRows = fundSections.reduce(
        (sum, s) => sum + 1 + 1 + s.list.length,
        0,
      );
      let placedFundLabel = false;
      const NAME_COL = 30;
      const ACCT_COL = 25;
      const AMOUNT_COL = 15;
      const DATE_COL = 12;

      for (const section of fundSections) {
        if (!placedFundLabel) {
          mergedRows.push(
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
                  rowSpan: totalFundRows,
                  width: { size: 15, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [createParagraph('', false, AlignmentType.CENTER)],
                  verticalAlign: VerticalAlign.CENTER,
                  width: { size: 3, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [
                    createParagraph(section.title, true, AlignmentType.CENTER),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                  columnSpan: 4,
                }),
              ],
            }),
          );
          placedFundLabel = true;
        } else {
          mergedRows.push(
            new TableRow({
              height: { value: 600, rule: 'atLeast' },
              children: [
                new TableCell({
                  children: [createParagraph('', false, AlignmentType.CENTER)],
                  verticalAlign: VerticalAlign.CENTER,
                  width: { size: 3, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [
                    createParagraph(section.title, true, AlignmentType.CENTER),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                  columnSpan: 4,
                }),
              ],
            }),
          );
        }

        mergedRows.push(
          new TableRow({
            height: { value: 600, rule: 'atLeast' },
            children: [
              new TableCell({
                children: [createParagraph('', false, AlignmentType.CENTER)],
                verticalAlign: VerticalAlign.CENTER,
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
                  createParagraph(
                    'Amount Deposited',
                    true,
                    AlignmentType.CENTER,
                  ),
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
          }),
        );

        for (const fund of section.list) {
          mergedRows.push(
            new TableRow({
              height: { value: 400, rule: 'atLeast' },
              children: [
                new TableCell({
                  children: [createParagraph('', false, AlignmentType.CENTER)],
                  verticalAlign: VerticalAlign.CENTER,
                  width: { size: 3, type: WidthType.PERCENTAGE },
                }),
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
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: createTableBorders(),
          rows: mergedRows,
        }),
      );
    }
    // Fund sections are already merged with EPEP table above
    children.push(...createAdditionalInfo(info));

    // Section II: EXECUTIVE SUMMARY OF COMPLIANCE
    children.push(
      new Paragraph({
        children: [createText('II. EXECUTIVE SUMMARY OF COMPLIANCE', true)],
        spacing: { before: 300, after: 200 },
      }),
    );
    if (info.executiveSummaryOfCompliance) {
      children.push(
        createExecutiveSummaryTable(info.executiveSummaryOfCompliance),
      );
    }

    // Section III: PROCESS DOCUMENTATION OF ACTIVITIES UNDERTAKEN
    children.push(
      new Paragraph({
        children: [
          createText(
            'III. PROCESS DOCUMENTATION OF ACTIVITIES UNDERTAKEN',
            true,
          ),
        ],
        spacing: { before: 300, after: 200 },
      }),
    );
    if (info.processDocumentationOfActivitiesUndertaken) {
      children.push(
        ...createProcessDocumentation(
          info.processDocumentationOfActivitiesUndertaken,
        ),
      );
    }

    // Section I (per PDF): COMPLIANCE MONITORING REPORT AND DISCUSSIONS
    children.push(
      new Paragraph({
        children: [
          createText('IV. COMPLIANCE MONITORING REPORT AND DISCUSSIONS', true),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 100 },
      }),
    );

    children.push(
      new Paragraph({
        children: [
          createText(
            '1.   Compliance to Project Location and Coverage Limits (As specified in ECC and/ or EPEP)',
            true,
          ),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 100 },
      }),
    );
    if (info.complianceToProjectLocationAndCoverageLimits) {
      children.push(
        createComplianceToProjectLocationTable(
          info.complianceToProjectLocationAndCoverageLimits,
        ),
      );
    }

    children.push(
      new Paragraph({
        children: [
          createText(
            '2.   Compliance to Impact Management Commitments in EIA report & EPEP',
            true,
          ),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
      }),
    );
    if (info.complianceToImpactManagementCommitments) {
      children.push(
        ...createComplianceToImpactManagementCommitmentsTables(
          info.complianceToImpactManagementCommitments,
        ),
      );
    }

    // B.1 ECC Conditions note
    children.push(
      new Paragraph({
        children: [
          createText(
            'B.1.  Compliance to Environmental Compliance Certificate Conditions',
            true,
          ),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
      }),
    );
    children.push(
      createParagraph(
        'Please see attached Annexes for ECC conditions',
        false,
        AlignmentType.CENTER,
      ),
    );

    // B.2 Air Quality Impact Assessment
    children.push(
      new Paragraph({
        children: [createText('B.2.  Air Quality Impact Assessment', true)],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
      }),
    );
    if (info.airQualityImpactAssessment) {
      children.push(
        ...createAirQualitySection(info.airQualityImpactAssessment),
      );
    }

    // B.3 Water Quality Impact Assessment
    children.push(
      new Paragraph({
        children: [createText('B.3.  Water Quality Impact Assessment', true)],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
      }),
    );
    if (info.waterQualityImpactAssessment) {
      children.push(
        ...createWaterQualitySection(info.waterQualityImpactAssessment),
      );
    }

    // B.4 Noise Quality Impact Assessment
    children.push(
      new Paragraph({
        children: [createText('B.4.  Noise Quality Impact Assessment', true)],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
      }),
    );
    children.push(
      createParagraph(
        'Refer to attached internal noise level monitoring line graphs for April to June 2025',
        false,
        AlignmentType.CENTER,
      ),
    );
    if (info.noiseQualityImpactAssessment) {
      children.push(createNoiseQualityTable(info.noiseQualityImpactAssessment));
    }

    // 3. Solid and Hazardous Waste Management
    children.push(
      new Paragraph({
        children: [
          createText(
            '3.   Compliance with Good Practice in Solid and Hazardous Waste Management',
            true,
          ),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
      }),
    );
    if (info.complianceWithGoodPracticeInSolidAndHazardousWasteManagement) {
      children.push(
        ...createSolidAndHazardousWasteSection(
          info.complianceWithGoodPracticeInSolidAndHazardousWasteManagement,
        ),
      );
    }

    if (info.complianceWithGoodPracticeInChemicalSafetyManagement) {
      children.push(
        new Paragraph({
          children: [
            createText(
              '4.	Compliance with Good Practice in Chemical Safety Management',
              true,
            ),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 200 },
        }),
      );
      children.push(
        ...complianceWithGoodPracticeInChemicalSafetyManagement(
          info.complianceWithGoodPracticeInChemicalSafetyManagement,
        ),
      );
    }

    // 5.	Compliance with Health and Safety Program Commitments
    children.push(
      new Paragraph({
        children: [
          createText(
            '5.	Compliance with Health and Safety Program Commitments',
            true,
          ),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 200 },
      }),
    );
    // 6.	Compliance with Social Development Plan Targets
    children.push(
      new Paragraph({
        children: [
          createText('6.	Compliance with Social Development Plan Targets', true),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 200 },
      }),
    );

    //7.	Complaints Verification and Management
    children.push(
      new Paragraph({
        children: [
          createText('7.	Complaints Verification and Management', true),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 200 },
      }),
    );
    console.log(
      'info.complaintsVerificationAndManagement',
      info.complaintsVerificationAndManagement,
    );
    if (info.complaintsVerificationAndManagement) {
      children.push(
        ...createComplaintsVerificationAndManagement(
          info.complaintsVerificationAndManagement,
        ),
      );
    }

    children.push(
      new Paragraph({
        children: [
          createText(
            `II.	PREVIOUS RECOMMENDATIONS (${info.recommendationFromPrevQuarter?.quarter} QUARTER ${info.recommendationFromPrevQuarter?.year} MONITORING)`,
            true,
          ),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { before: 100, after: 200 },
      }),
    );

    if (info.recommendationFromPrevQuarter) {
      children.push(
        ...createRecommendationTable(info.recommendationFromPrevQuarter),
      );
    }

    children.push(
      new Paragraph({
        children: [
          createText(
            `III.	RECOMMENDATIONS FOR THE ${info.recommendationForNextQuarter?.quarter} QUARTER ${info.recommendationForNextQuarter?.year}`,
            true,
          ),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { before: 100, after: 200 },
      }),
    );
    if (info.recommendationForNextQuarter) {
      children.push(
        ...createRecommendationTable(info.recommendationForNextQuarter),
      );
    }

    // Add attendance section if attendance data is provided
    if (attendanceData?.attendees) {
      children.push(
        new Paragraph({
          children: [createText('ATTENDANCE:', true)],
          spacing: { before: 300, after: 200 },
        }),
      );

      const attendees = Array.isArray(attendanceData.attendees)
        ? attendanceData.attendees
        : [];

      if (attendees.length > 0) {
        const attendanceRows: TableRow[] = [
          // Header row
          new TableRow({
            height: { value: 500, rule: 'atLeast' },
            children: [
              new TableCell({
                children: [createParagraph('NAME', true, AlignmentType.CENTER)],
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 40, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  createParagraph('AGENCY/ OFFICE', true, AlignmentType.CENTER),
                ],
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 30, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  createParagraph('POSITION', true, AlignmentType.CENTER),
                ],
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 20, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  createParagraph('SIGNATURE', true, AlignmentType.CENTER),
                ],
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 10, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
        ];

        // Data rows with numbering
        attendees.forEach((attendee: any, index: number) => {
          attendanceRows.push(
            new TableRow({
              height: { value: 400, rule: 'atLeast' },
              children: [
                new TableCell({
                  children: [
                    createParagraph(
                      `${index + 1}.   ${attendee.name || ''}`,
                      false,
                      AlignmentType.LEFT,
                    ),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [
                    createParagraph(
                      attendee.company || '',
                      false,
                      AlignmentType.CENTER,
                    ),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [
                    createParagraph(
                      attendee.position || '',
                      false,
                      AlignmentType.CENTER,
                    ),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                  children: [createParagraph('', false, AlignmentType.CENTER)],
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            }),
          );
        });

        children.push(
          new Table({
            rows: attendanceRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
        );
      }
    }

    // Margins in twips: top 2cm=1134, left 2cm=1134, bottom 2.5cm=1418, right 1.8cm=1021
    // Page size remains 21.59 cm x 33.02 cm
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { width: 12240, height: 18720 },
              margin: { top: 1134, left: 1134, bottom: 1418, right: 1021 },
            },
          },
          children,
        },
      ],
    });
    return Packer.toBuffer(doc);
  }
}
