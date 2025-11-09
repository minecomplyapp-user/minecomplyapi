/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
  ImageRun,
} from 'docx';
import axios from 'axios';
import mammoth from 'mammoth';
import { parse } from 'node-html-parser';
import type { CMVRGeneralInfo } from './cmvr-pdf-generator.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';

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
  constructor(private readonly storageService: SupabaseStorageService) {}

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
    attachments: Array<{ path: string; caption?: string }> = [],
  ): Promise<Buffer> {
    const children: (Paragraph | Table)[] = [];
    const attachmentEntries = this.normalizeAttachments(attachments);
    const eccAttachment = info.eccConditionsAttachment;
    const eccSupportsMerge = this.supportsDocxMerge(eccAttachment);

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

    // Add ECC attachment reference if available
    if (eccAttachment?.fileName) {
      if (eccSupportsMerge) {
        children.push(
          createParagraph(
            `ECC Conditions document "${eccAttachment.fileName}" is included in the appendix of this report. If any pages appear blank, download the original file from the system.`,
            false,
            AlignmentType.CENTER,
          ),
        );
      } else {
        children.push(
          createParagraph(
            `Please see attached document: ${eccAttachment.fileName}`,
            false,
            AlignmentType.CENTER,
          ),
        );
      }
    } else {
      children.push(
        createParagraph(
          'Please see attached Annexes for ECC conditions',
          false,
          AlignmentType.CENTER,
        ),
      );
    }

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

        // Data rows with numbering - fetch and add signatures
        for (let index = 0; index < attendees.length; index++) {
          const attendee: any = attendees[index];

          // Prepare signature cell content
          const signatureCellChildren: Paragraph[] = [];

          // Check if attendee is absent
          if (attendee.attendanceStatus === 'ABSENT') {
            signatureCellChildren.push(
              createParagraph('ABSENT', false, AlignmentType.CENTER),
            );
          } else if (
            attendee.signatureUrl &&
            attendee.signatureUrl.trim() !== ''
          ) {
            try {
              // Convert storage path to signed URL
              const signedUrl =
                await this.storageService.createSignedDownloadUrl(
                  attendee.signatureUrl,
                  60, // expires in 60 seconds
                );

              const imageBuffer = await this.fetchImageBuffer(signedUrl);
              if (imageBuffer) {
                // Add image to cell
                signatureCellChildren.push(
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: imageBuffer,
                        transformation: {
                          width: 60,
                          height: 30,
                        },
                        type: 'png',
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                );
              } else {
                // Fallback to ABSENT if image fetch failed
                signatureCellChildren.push(
                  createParagraph('ABSENT', false, AlignmentType.CENTER),
                );
              }
            } catch (error) {
              console.error(
                `Failed to add signature image for ${attendee.name}:`,
                error,
              );
              signatureCellChildren.push(
                createParagraph('ABSENT', false, AlignmentType.CENTER),
              );
            }
          } else {
            // No signature URL, add ABSENT
            signatureCellChildren.push(
              createParagraph('ABSENT', false, AlignmentType.CENTER),
            );
          }

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
                      attendee.agency || attendee.office || '',
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
                  children: signatureCellChildren,
                  verticalAlign: VerticalAlign.CENTER,
                }),
              ],
            }),
          );
        }

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

    if (attachmentEntries.length > 0) {
      const attachmentRows = await this.buildAttachmentRows(attachmentEntries);

      if (attachmentRows.length > 0) {
        children.push(
          new Paragraph({
            children: [createText('PHOTO DOCUMENTATION', true)],
            spacing: { before: 300, after: 200 },
            pageBreakBefore: true,
          }),
        );
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: createTableBorders(),
            rows: attachmentRows,
          }),
        );
        children.push(createParagraph('', false, AlignmentType.CENTER));
      }
    }

    // Add project location images if available
    if (
      info.complianceToProjectLocationAndCoverageLimits?.uploadedImages &&
      Object.keys(
        info.complianceToProjectLocationAndCoverageLimits.uploadedImages,
      ).length > 0
    ) {
      const locationImagesElements = await this.buildLocationImagesSection(
        info.complianceToProjectLocationAndCoverageLimits.uploadedImages,
      );
      children.push(...locationImagesElements);
    }

    // Add noise quality monitoring charts if available
    if (
      info.noiseQualityImpactAssessment?.uploadedFiles &&
      info.noiseQualityImpactAssessment.uploadedFiles.length > 0
    ) {
      const noiseQualityElements = await this.buildNoiseQualityFilesSection(
        info.noiseQualityImpactAssessment.uploadedFiles,
      );
      children.push(...noiseQualityElements);
    }

    // Margins in twips: top 2cm=1134, left 2cm=1134, bottom 2.5cm=1418, right 1.8cm=1021
    // Page size remains 21.59 cm x 33.02 cm

    // If ECC file is attached and it's a DOCX, add a reference note
    await this.appendEccAppendix(children, eccAttachment);

    // Generate the main CMVR report buffer (without ECC merge if merge failed or no ECC)
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { width: 12240, height: 18720 },
              margin: {
                top: 1134,
                left: 1134,
                bottom: 1418,
                right: 1021,
              },
            },
          },
          children,
        },
      ],
    });

    const mainDocBuffer = await Packer.toBuffer(doc);
    return mainDocBuffer;
  }

  private normalizeAttachments(
    raw: Array<{ path: string; caption?: string }> = [],
  ): Array<{ path: string; caption?: string }> {
    return raw.filter(
      (item): item is { path: string; caption?: string } =>
        !!item && typeof item.path === 'string' && item.path.trim().length > 0,
    );
  }

  private async buildAttachmentRows(
    attachments: Array<{ path: string; caption?: string }>,
  ): Promise<TableRow[]> {
    const rows: TableRow[] = [];

    for (let index = 0; index < attachments.length; index += 2) {
      const first = attachments[index];
      const second = attachments[index + 1];

      const imageCells = await Promise.all([
        this.createAttachmentImageCell(first, index + 1),
        this.createAttachmentImageCell(second, index + 2),
      ]);

      rows.push(
        new TableRow({
          height: { value: 3200, rule: 'atLeast' },
          children: imageCells,
        }),
      );

      rows.push(
        new TableRow({
          height: { value: 400, rule: 'atLeast' },
          children: [
            this.createAttachmentCaptionCell(first),
            this.createAttachmentCaptionCell(second),
          ],
        }),
      );
    }

    return rows;
  }

  private async createAttachmentImageCell(
    attachment: { path: string; caption?: string } | undefined,
    displayIndex: number,
  ): Promise<TableCell> {
    const placeholderLabel = `PHOTO ${displayIndex}`;

    if (!attachment) {
      return new TableCell({
        children: [createParagraph('', false, AlignmentType.CENTER)],
        width: { size: 50, type: WidthType.PERCENTAGE },
        verticalAlign: VerticalAlign.CENTER,
      });
    }

    try {
      const signedUrl = await this.storageService.createSignedDownloadUrl(
        attachment.path,
        120,
      );
      const imageBuffer = await this.fetchImageBuffer(signedUrl);

      if (imageBuffer) {
        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 360,
                    height: 240,
                  },
                  type: this.resolveImageType(attachment.path),
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
        });
      }
    } catch (error) {
      console.warn(
        `Failed to load attachment image for ${attachment.path}:`,
        error,
      );
    }

    return new TableCell({
      children: [createParagraph(placeholderLabel, true, AlignmentType.CENTER)],
      width: { size: 50, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
    });
  }

  private createAttachmentCaptionCell(
    attachment: { path: string; caption?: string } | undefined,
  ): TableCell {
    const captionRaw = attachment?.caption?.trim();
    const captionText = captionRaw && captionRaw.length > 0 ? captionRaw : ``;

    return new TableCell({
      children: [createParagraph(captionText, true, AlignmentType.CENTER)],
      width: { size: 50, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
    });
  }

  private resolveImageType(path: string): 'png' | 'gif' | 'bmp' | 'jpg' {
    const extension = path.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'jpg';
      case 'gif':
        return 'gif';
      case 'bmp':
        return 'bmp';
      case 'tif':
      case 'tiff':
        return 'png';
      default:
        return 'png';
    }
  }

  /**
   * Fetch image buffer from URL (for signature images)
   */
  private async fetchImageBuffer(url: string): Promise<Buffer | null> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 5000, // 5 second timeout
      });
      return Buffer.from(response.data);
    } catch (error) {
      // Log simplified error message (404s are expected for missing signatures)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(`Image not found (404): ${url}`);
      } else {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`Failed to fetch image from ${url}: ${errorMsg}`);
      }
      return null;
    }
  }

  private supportsDocxMerge(
    attachment?: {
      fileName?: string;
      mimeType?: string;
    } | null,
  ): boolean {
    if (!attachment?.fileName && !attachment?.mimeType) {
      return false;
    }

    const mimeType = attachment.mimeType?.toLowerCase() ?? '';
    const fileName = attachment.fileName?.toLowerCase() ?? '';

    if (fileName.endsWith('.docx')) {
      return true;
    }

    if (mimeType.includes('wordprocessingml')) {
      return true;
    }

    if (mimeType === 'application/msword') {
      return true;
    }

    return false;
  }

  private createEccAppendixHeader(fileName: string): Paragraph[] {
    return [
      new Paragraph({
        pageBreakBefore: true,
        children: [
          new TextRun({
            text: 'APPENDIX: ECC CONDITIONS DOCUMENT',
            bold: true,
            size: 28,
          }),
        ],
        spacing: { before: 200, after: 400 },
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Document Name: "${fileName}"`,
            bold: true,
            size: 24,
          }),
        ],
        spacing: { after: 200 },
        alignment: AlignmentType.CENTER,
      }),
    ];
  }

  /**
   * Build location images section for the document
   */
  private async buildLocationImagesSection(
    uploadedImages: Record<string, string>,
  ): Promise<(Paragraph | Table)[]> {
    const elements: (Paragraph | Table)[] = [];

    if (!uploadedImages || Object.keys(uploadedImages).length === 0) {
      return elements;
    }

    // Add section title
    elements.push(
      new Paragraph({
        children: [createText('PROJECT LOCATION IMAGES', true)],
        spacing: { before: 300, after: 200 },
        pageBreakBefore: false,
      }),
    );

    // Process each image
    for (const [fieldKey, storagePath] of Object.entries(uploadedImages)) {
      if (!storagePath) continue;

      try {
        const signedUrl = await this.storageService.createSignedDownloadUrl(
          storagePath,
          60,
        );
        const imageBuffer = await this.fetchImageBuffer(signedUrl);

        if (imageBuffer) {
          // Add large image (single image, make it big)
          elements.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 500, // Large width for single project location image
                    height: 350, // Maintain aspect ratio
                  },
                  type: this.resolveImageType(storagePath),
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
          );
        }
      } catch (error) {
        console.error(`Failed to add location image for ${fieldKey}:`, error);
      }
    }

    return elements;
  }

  /**
   * Build noise quality files section for the document
   */
  private async buildNoiseQualityFilesSection(
    uploadedFiles: Array<{
      uri: string;
      name: string;
      size?: number;
      mimeType?: string;
      storagePath?: string;
    }>,
  ): Promise<(Paragraph | Table)[]> {
    const elements: (Paragraph | Table)[] = [];

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return elements;
    }

    // Add section title
    elements.push(
      new Paragraph({
        children: [createText('NOISE QUALITY MONITORING CHARTS', true)],
        spacing: { before: 300, after: 200 },
        pageBreakBefore: false,
      }),
    );

    // Process each file (assuming they are images/charts)
    for (const file of uploadedFiles) {
      if (!file.storagePath) continue;

      try {
        const signedUrl = await this.storageService.createSignedDownloadUrl(
          file.storagePath,
          60,
        );
        const imageBuffer = await this.fetchImageBuffer(signedUrl);

        if (imageBuffer) {
          // Add file caption
          elements.push(
            new Paragraph({
              children: [createText(file.name, true)],
              spacing: { before: 100, after: 100 },
            }),
          );

          // Add large chart image
          elements.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 500, // Large width for charts
                    height: 300,
                  },
                  type: this.resolveImageType(file.storagePath || file.name),
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
          );
        }
      } catch (error) {
        console.error(`Failed to add noise quality file ${file.name}:`, error);
      }
    }

    return elements;
  }

  private async appendEccAppendix(
    children: (Paragraph | Table)[],
    attachment?: {
      fileName?: string;
      fileUrl?: string;
      mimeType?: string;
      storagePath?: string;
    } | null,
  ): Promise<'none' | 'merged' | 'fallback' | 'unsupported'> {
    if (!attachment?.fileName) {
      return 'none';
    }

    const headerParagraphs = this.createEccAppendixHeader(attachment.fileName);
    let headerPushed = false;
    const ensureHeader = () => {
      if (!headerPushed) {
        children.push(...headerParagraphs);
        headerPushed = true;
      }
    };

    if (!this.supportsDocxMerge(attachment)) {
      ensureHeader();
      children.push(
        new Paragraph({
          children: [
            createText(
              'This ECC Conditions document cannot be merged automatically because it is not a DOCX file. Please download the original file from the system.',
            ),
          ],
          spacing: { after: 200 },
        }),
      );

      if (attachment.fileUrl) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Access URL: ',
                bold: true,
                size: 22,
              }),
              new TextRun({
                text: attachment.fileUrl,
                color: '0000EE',
                size: 20,
              }),
            ],
            spacing: { after: 200 },
          }),
        );
      }

      return 'unsupported';
    }

    const downloadCandidates = await this.buildDownloadCandidates(attachment);
    const eccBuffer = await this.fetchFirstAvailableBuffer(downloadCandidates);
    ensureHeader();
    if (!eccBuffer) {
      children.push(
        new Paragraph({
          children: [
            createText(
              'The ECC Conditions document could not be downloaded for merging. Please open the original file in the system.',
            ),
          ],
          spacing: { after: 200 },
        }),
      );
      return 'fallback';
    }

    try {
      const htmlResult = await mammoth.convertToHtml({ buffer: eccBuffer });
      const htmlWarnings = htmlResult.messages?.filter(
        (message) => message.type === 'warning',
      );
      if (htmlWarnings && htmlWarnings.length > 0) {
        console.warn(
          'Warnings while extracting ECC document HTML:',
          htmlWarnings.map((warning) => warning.message).join('; '),
        );
      }

      const docNodes = this.convertHtmlToDocxNodes(htmlResult.value ?? '');
      let mergedSuccessfully = false;

      if (docNodes.length > 0) {
        children.push(...docNodes);
        mergedSuccessfully = true;
      } else {
        const textResult = await mammoth.extractRawText({ buffer: eccBuffer });
        const textWarnings = textResult.messages?.filter(
          (message) => message.type === 'warning',
        );
        if (textWarnings && textWarnings.length > 0) {
          console.warn(
            'Warnings while extracting ECC document text:',
            textWarnings.map((warning) => warning.message).join('; '),
          );
        }

        const sanitized = this.sanitizeExtractedText(textResult.value ?? '');
        if (!sanitized) {
          children.push(
            new Paragraph({
              children: [
                createText(
                  'The ECC Conditions document did not contain extractable text. Please download the original file for full details.',
                ),
              ],
              spacing: { after: 200 },
            }),
          );

          if (attachment.fileUrl) {
            children.push(
              this.createLinkParagraph('Access URL: ', attachment.fileUrl),
            );
          }

          return 'fallback';
        }

        children.push(...this.convertPlainTextToParagraphs(sanitized));
      }

      children.push(this.createEndOfEccParagraph());

      if (attachment.fileUrl) {
        children.push(this.createOriginalFileParagraph(attachment.fileUrl));
      }

      return mergedSuccessfully ? 'merged' : 'fallback';
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Failed to merge ECC document text: ${errorMsg}`);

      children.push(
        new Paragraph({
          children: [
            createText(
              'The ECC Conditions document could not be merged automatically. Please download the original file from the system.',
            ),
          ],
          spacing: { after: 200 },
        }),
      );

      if (attachment.fileUrl) {
        children.push(
          this.createLinkParagraph('Access URL: ', attachment.fileUrl),
        );
      }

      return 'fallback';
    }
  }

  private async fetchFileBuffer(url: string): Promise<Buffer | null> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      return Buffer.from(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(`ECC document not found (404): ${url}`);
      } else {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(
          `Failed to download ECC document from ${url}: ${errorMsg}`,
        );
      }
      return null;
    }
  }

  private async buildDownloadCandidates(attachment: {
    fileUrl?: string;
    storagePath?: string;
  }): Promise<Array<{ url: string; source: 'public' | 'signed' }>> {
    const candidates: Array<{ url: string; source: 'public' | 'signed' }> = [];

    if (attachment.storagePath) {
      try {
        const signedUrl = await this.storageService.createSignedDownloadUrl(
          attachment.storagePath,
          600,
        );
        candidates.push({ url: signedUrl, source: 'signed' });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(
          `Failed to create signed download URL for ${attachment.storagePath}: ${errorMsg}`,
        );
      }
    }

    if (attachment.fileUrl) {
      candidates.push({ url: attachment.fileUrl, source: 'public' });
    }

    return candidates;
  }

  private async fetchFirstAvailableBuffer(
    candidates: Array<{ url: string; source: 'public' | 'signed' }>,
  ): Promise<Buffer | null> {
    for (const candidate of candidates) {
      const buffer = await this.fetchFileBuffer(candidate.url);
      if (buffer) {
        if (candidate.source === 'signed') {
          console.log('ECC document fetched using signed URL.');
        }
        return buffer;
      }
    }
    return null;
  }

  private sanitizeExtractedText(raw: string): string {
    return raw.replace(/\r/g, '\n').split('\u0000').join('').trim();
  }

  private convertPlainTextToParagraphs(text: string): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    const lines = text.split(/\n/);
    let blankStreak = 0;

    for (const line of lines) {
      const normalized = line.replace(/\t/g, '    ');
      if (normalized.trim().length === 0) {
        blankStreak += 1;
        if (blankStreak > 2) {
          continue;
        }
        paragraphs.push(this.createPlainParagraph(''));
        continue;
      }

      blankStreak = 0;
      paragraphs.push(this.createPlainParagraph(normalized.trim()));
    }

    return paragraphs;
  }

  private convertHtmlToDocxNodes(html: string): Array<Paragraph | Table> {
    if (!html || html.trim().length === 0) {
      return [];
    }

    const root = parse(html);
    const body = (
      root as { querySelector?: (selector: string) => unknown }
    )?.querySelector?.('body') as { childNodes?: unknown[] } | undefined;
    const container = (body?.childNodes?.length ? body : root) as {
      childNodes?: unknown[];
    };

    if (!container.childNodes || container.childNodes.length === 0) {
      return [];
    }

    const output: Array<Paragraph | Table> = [];

    for (const node of container.childNodes) {
      output.push(...this.convertHtmlNodeToDocx(node));
    }

    return output;
  }

  private convertHtmlNodeToDocx(node: unknown): Array<Paragraph | Table> {
    if (!node) {
      return [];
    }

    const htmlNode = node as {
      nodeType?: number;
      text?: string;
      tagName?: string;
      rawTagName?: string;
      childNodes?: unknown[];
    };

    if (htmlNode.nodeType === 3) {
      const text = (htmlNode.text ?? '').trim();
      return text.length > 0 ? [this.createPlainParagraph(text)] : [];
    }

    if (htmlNode.nodeType !== 1) {
      return [];
    }

    const tagName = (
      htmlNode.tagName ??
      htmlNode.rawTagName ??
      ''
    ).toLowerCase();
    const element = htmlNode as {
      childNodes?: unknown[];
      innerText?: string;
      getAttribute?: (name: string) => string | undefined;
      querySelectorAll?: (selector: string) => unknown[];
    };

    switch (tagName) {
      case 'p':
        return this.createParagraphsFromInnerText(element.innerText ?? '');
      case 'h1':
        return this.createParagraphsFromInnerText(element.innerText ?? '', {
          bold: true,
          size: 36,
          spacing: { before: 300, after: 200 },
        });
      case 'h2':
        return this.createParagraphsFromInnerText(element.innerText ?? '', {
          bold: true,
          size: 32,
          spacing: { before: 260, after: 180 },
        });
      case 'h3':
        return this.createParagraphsFromInnerText(element.innerText ?? '', {
          bold: true,
          size: 28,
          spacing: { before: 240, after: 160 },
        });
      case 'h4':
      case 'h5':
      case 'h6':
        return this.createParagraphsFromInnerText(element.innerText ?? '', {
          bold: true,
          size: 24,
          spacing: { before: 220, after: 140 },
        });
      case 'br':
        return [this.createPlainParagraph('')];
      case 'ul':
      case 'ol': {
        const nodes: Paragraph[] = [];
        const listItems = (element.childNodes ?? []).filter((child) =>
          this.isTag(child, 'li'),
        );
        let index = 1;
        for (const item of listItems) {
          const text = this.collectTextContent(item).trim();
          if (!text) {
            continue;
          }
          const prefix = tagName === 'ol' ? `${index}. ` : '• ';
          nodes.push(this.createPlainParagraph(`${prefix}${text}`));
          index += 1;
        }
        return nodes;
      }
      case 'table': {
        const table = this.convertHtmlTable(element);
        return table ? [table] : [];
      }
      default: {
        const children = htmlNode.childNodes ?? [];
        const collected: Array<Paragraph | Table> = [];
        for (const child of children) {
          collected.push(...this.convertHtmlNodeToDocx(child));
        }
        return collected;
      }
    }
  }

  private convertHtmlTable(element: {
    querySelectorAll?: (selector: string) => unknown[];
  }): Table | null {
    const querySelectorAll = element.querySelectorAll?.bind(element);
    const rowElements = querySelectorAll ? querySelectorAll('tr') : [];

    if (!rowElements || rowElements.length === 0) {
      return null;
    }

    const rows: TableRow[] = [];

    for (const rowElement of rowElements) {
      const cellElements = (
        rowElement as {
          querySelectorAll?: (selector: string) => unknown[];
        }
      ).querySelectorAll?.('th,td');

      if (!cellElements || cellElements.length === 0) {
        continue;
      }

      const cells: TableCell[] = [];

      for (const cellElement of cellElements) {
        const cell = cellElement as {
          tagName?: string;
          rawTagName?: string;
          innerText?: string;
          getAttribute?: (name: string) => string | undefined;
        };
        const isHeader = this.isTag(cell, 'th');
        const textLines = this.collectTextContent(cell)
          .split(/\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        const paragraphs =
          textLines.length > 0
            ? textLines.map((line) =>
                this.createPlainParagraph(line, {
                  bold: isHeader,
                }),
              )
            : [this.createPlainParagraph('')];

        const columnSpanRaw = cell.getAttribute?.('colspan');
        const rowSpanRaw = cell.getAttribute?.('rowspan');
        const columnSpan = columnSpanRaw ? Number(columnSpanRaw) : undefined;
        const rowSpan = rowSpanRaw ? Number(rowSpanRaw) : undefined;

        cells.push(
          new TableCell({
            children: paragraphs,
            columnSpan: columnSpan && columnSpan > 1 ? columnSpan : undefined,
            rowSpan: rowSpan && rowSpan > 1 ? rowSpan : undefined,
            verticalAlign: VerticalAlign.CENTER,
          }),
        );
      }

      if (cells.length > 0) {
        rows.push(new TableRow({ children: cells }));
      }
    }

    if (rows.length === 0) {
      return null;
    }

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createTableBorders(),
      rows,
    });
  }

  private createPlainParagraph(
    text: string,
    options?: {
      bold?: boolean;
      size?: number;
      spacing?: { before?: number; after?: number };
    },
  ): Paragraph {
    const spacing = options?.spacing ?? { after: 100 };
    const trimmed = text ?? '';
    return new Paragraph({
      children:
        trimmed.length > 0
          ? [createText(trimmed, options?.bold ?? false, options?.size ?? 22)]
          : [],
      spacing,
    });
  }

  private createParagraphsFromInnerText(
    text: string,
    options?: {
      bold?: boolean;
      size?: number;
      spacing?: { before?: number; after?: number };
    },
  ): Paragraph[] {
    const normalized = text
      .replace(/\r/g, '\n')
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (normalized.length === 0) {
      return [];
    }

    return normalized.map((line) => this.createPlainParagraph(line, options));
  }

  private collectTextContent(node: unknown): string {
    if (!node) {
      return '';
    }

    const htmlNode = node as {
      nodeType?: number;
      text?: string;
      childNodes?: unknown[];
      tagName?: string;
      rawTagName?: string;
    };

    if (htmlNode.nodeType === 3) {
      return htmlNode.text ?? '';
    }

    if (htmlNode.nodeType !== 1) {
      return '';
    }

    const tag = (htmlNode.tagName ?? htmlNode.rawTagName ?? '').toLowerCase();
    if (tag === 'br') {
      return '\n';
    }

    const children = htmlNode.childNodes ?? [];
    const parts: string[] = [];
    for (const child of children) {
      const content = this.collectTextContent(child);
      if (content.length > 0) {
        parts.push(content);
      }
    }

    if (tag === 'li' && parts.length > 0) {
      return `\n• ${parts.join('').trim()}`;
    }

    return parts.join('');
  }

  private isTag(node: unknown, tagName: string): boolean {
    if (!node) {
      return false;
    }
    const htmlNode = node as { tagName?: string; rawTagName?: string };
    const tag = (htmlNode.tagName ?? htmlNode.rawTagName ?? '').toLowerCase();
    return tag === tagName.toLowerCase();
  }

  private createEndOfEccParagraph(): Paragraph {
    return new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: 'End of ECC Conditions document.',
          italics: true,
          size: 20,
          color: '666666',
        }),
      ],
    });
  }

  private createOriginalFileParagraph(url: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: 'Original file: ',
          bold: true,
          size: 20,
        }),
        new TextRun({
          text: url,
          color: '0000EE',
          size: 20,
        }),
      ],
      spacing: { after: 100 },
    });
  }

  private createLinkParagraph(
    label: string,
    url: string,
    options?: { spacingAfter?: number; labelSize?: number; urlSize?: number },
  ): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: label,
          bold: true,
          size: options?.labelSize ?? 22,
        }),
        new TextRun({
          text: url,
          color: '0000EE',
          size: options?.urlSize ?? 20,
        }),
      ],
      spacing: { after: options?.spacingAfter ?? 200 },
    });
  }
}
