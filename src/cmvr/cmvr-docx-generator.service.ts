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
import type { CMVRGeneralInfo } from './cmvr-pdf-generator.service';

import { createFundTable, createTableBorders, createText, createParagraph,createKeyValueTable } from './cmvr-sections/general-use.helper';



import { createGeneralInfoKeyValues, createECCTable, createAdditionalInfo, createEPEPTable,createFundStatusSections,createISAGTable } from './cmvr-sections/basic-info.helper';
import { createComplianceToProjectLocationTable, createComplianceToImpactManagementCommitmentsTables, createAirQualitySection, createWaterQualitySection, createNoiseQualityTable, createSolidAndHazardousWasteSection } from './cmvr-sections/compliance-monitoring.helper';
import {createProcessDocumentation} from './cmvr-sections/process-documentation.helper';
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

      // Title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'COMPLIANCE MONITORING AND VALIDATION REPORT',
              bold: true,
              font: 'Arial',
              size: 22, // 11pt (size is in half-points)
              color: '000000',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
      );

      // Subtitle
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'GENERAL INFORMATION',
              bold: true,
              font: 'Arial',
              size: 22, // 11pt
              color: '000000',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),
      );

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

      // Project info (Current Name, Status)
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

      if (projectInfoRows.length > 0) {
        children.push(
          new Paragraph({ text: '', spacing: { after: 100 } }), // Small spacing
        );
        children.push(createKeyValueTable(projectInfoRows));
      }

      // EPEP Table
      if (generalInfo.epep && generalInfo.epep.length > 0) {
        children.push(createEPEPTable(generalInfo.epep));
      }

      // Fund Status Section (Rehabilitation Cash Fund, MTF, FMRDF)
      const fundSections = createFundStatusSections(generalInfo);
      if (fundSections.length > 0) {
        children.push(...fundSections);
      }

      // Additional Information (Geographical Coordinates, Proponent, MMT)
      const additionalInfo = createAdditionalInfo(generalInfo);
      if (additionalInfo.length > 0) {
        children.push(
          new Paragraph({ text: '', spacing: { after: 200 } }), // Spacing
        );
        children.push(...additionalInfo);
      }

      // Create document with exact specifications
      // Page size: 21.59 cm x 33.02 cm
      // Convert cm to twips (1 cm = 567 twips approximately, or exactly: 1 inch = 1440 twips, 1 inch = 2.54 cm)
      // 21.59 cm = 8.5 inch = 12240 twips
      // 33.02 cm = 13 inch = 18720 twips
      // Margins in twips: top 1.87cm=1064, bottom 1.94cm=1102, left 1.27cm=723, right 0.63cm=359
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
                  top: 1064, // 1.87 cm
                  bottom: 1102, // 1.94 cm
                  left: 723, // 1.27 cm
                  right: 359, // 0.63 cm
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
  async generateFullReportDocx(info: CMVRGeneralInfo): Promise<Buffer> {
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'COMPLIANCE MONITORING AND VALIDATION REPORT',
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

    // Section: GENERAL INFORMATION (reuse existing builders)
    children.push(
      new Paragraph({
        children: [createText('GENERAL INFORMATION', true)],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 200 },
      }),
    );
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
    if (projRows.length) {
      children.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      children.push(createKeyValueTable(projRows));
    }
    if (info.epep?.length) children.push(createEPEPTable(info.epep));
    children.push(...createFundStatusSections(info));
    children.push(...createAdditionalInfo(info));

    // Section II: EXECUTIVE SUMMARY OF COMPLIANCE
    children.push(
      new Paragraph({
        children: [
          createText('II. EXECUTIVE SUMMARY OF COMPLIANCE', true),
        ],
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
          createText(
            'IV. COMPLIANCE MONITORING REPORT AND DISCUSSIONS',
            true,
          ),
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
        children: [
          createText('B.2.  Air Quality Impact Assessment', true),
        ],
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
        children: [
          createText('B.3.  Water Quality Impact Assessment', true),
        ],
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
        children: [
          createText('B.4.  Noise Quality Impact Assessment', true),
        ],
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
      children.push(
        createNoiseQualityTable(info.noiseQualityImpactAssessment),
      );
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

    // Build DOCX with page/margin spec
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { width: 12240, height: 18720 },
              margin: { top: 1064, bottom: 1102, left: 723, right: 359 },
            },
          },
          children,
        },
      ],
    });
    return Packer.toBuffer(doc);
  }

 



}
