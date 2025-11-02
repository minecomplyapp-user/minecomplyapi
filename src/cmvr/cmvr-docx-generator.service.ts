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
   * Generate the FULL CMVR report as DOCX using cmvrReport mock shape
   * Mirrors PDF sections: General Info, Executive Summary, Process Documentation,
   * Compliance tables, Air/Water/Noise, Solid & Hazardous Waste
   */
  async generateFullReportDocx(info: CMVRGeneralInfo): Promise<Buffer> {
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
                width: { size: 25, type: WidthType.PERCENTAGE },
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
                width: { size: 72, type: WidthType.PERCENTAGE },
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
              width: { size: 25, type: WidthType.PERCENTAGE },
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
              width: { size: 28, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                createParagraph('EPEP Number', true, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 22, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                createParagraph('Date of Approval', true, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 27, type: WidthType.PERCENTAGE },
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
                width: { size: 30, type: WidthType.PERCENTAGE },
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
                width: { size: 25, type: WidthType.PERCENTAGE },
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
                width: { size: 27, type: WidthType.PERCENTAGE },
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
      const NAME_COL = 22;
      const ACCT_COL = 25;
      const AMOUNT_COL = 15;
      const DATE_COL = 20;

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
                  width: { size: 82, type: WidthType.PERCENTAGE },
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
                  width: { size: 82, type: WidthType.PERCENTAGE },
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
