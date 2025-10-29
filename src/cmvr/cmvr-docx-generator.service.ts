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
      children.push(...this.createGeneralInfoKeyValues(generalInfo));

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
        children.push(this.createECCTable(generalInfo.ecc));
      }

      // ISAG/MPP Table (connected to ECC if both exist)
      if (generalInfo.isagMpp && generalInfo.isagMpp.length > 0) {
        children.push(this.createISAGTable(generalInfo.isagMpp));
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
        children.push(this.createKeyValueTable(projectInfoRows));
      }

      // EPEP Table
      if (generalInfo.epep && generalInfo.epep.length > 0) {
        children.push(this.createEPEPTable(generalInfo.epep));
      }

      // Fund Status Section (Rehabilitation Cash Fund, MTF, FMRDF)
      const fundSections = this.createFundStatusSections(generalInfo);
      if (fundSections.length > 0) {
        children.push(...fundSections);
      }

      // Additional Information (Geographical Coordinates, Proponent, MMT)
      const additionalInfo = this.createAdditionalInfo(generalInfo);
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
        children: [this.createText('GENERAL INFORMATION', true)],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 200 },
      }),
    );
    children.push(...this.createGeneralInfoKeyValues(info));
    children.push(
      new Paragraph({
        children: [this.createText('I. BASIC INFORMATION', true)],
        spacing: { before: 300, after: 200 },
      }),
    );
    if (info.ecc?.length) children.push(this.createECCTable(info.ecc));
    if (info.isagMpp?.length) children.push(this.createISAGTable(info.isagMpp));

    const projRows: Array<[string, string]> = [];
    if (info.projectCurrentName)
      projRows.push(['Project Current Name', info.projectCurrentName]);
    if (info.projectStatus)
      projRows.push(['Project Status', info.projectStatus]);
    if (projRows.length) {
      children.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      children.push(this.createKeyValueTable(projRows));
    }
    if (info.epep?.length) children.push(this.createEPEPTable(info.epep));
    children.push(...this.createFundStatusSections(info));
    children.push(...this.createAdditionalInfo(info));

    // Section II: EXECUTIVE SUMMARY OF COMPLIANCE
    children.push(
      new Paragraph({
        children: [
          this.createText('II. EXECUTIVE SUMMARY OF COMPLIANCE', true),
        ],
        spacing: { before: 300, after: 200 },
      }),
    );
    if (info.executiveSummaryOfCompliance) {
      children.push(
        this.createExecutiveSummaryTable(info.executiveSummaryOfCompliance),
      );
    }

    // Section III: PROCESS DOCUMENTATION OF ACTIVITIES UNDERTAKEN
    children.push(
      new Paragraph({
        children: [
          this.createText(
            'III. PROCESS DOCUMENTATION OF ACTIVITIES UNDERTAKEN',
            true,
          ),
        ],
        spacing: { before: 300, after: 200 },
      }),
    );
    if (info.processDocumentationOfActivitiesUndertaken) {
      children.push(
        ...this.createProcessDocumentation(
          info.processDocumentationOfActivitiesUndertaken,
        ),
      );
    }

    // Section I (per PDF): COMPLIANCE MONITORING REPORT AND DISCUSSIONS
    children.push(
      new Paragraph({
        children: [
          this.createText(
            'I. COMPLIANCE MONITORING REPORT AND DISCUSSIONS',
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
          this.createText(
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
        this.createComplianceToProjectLocationTable(
          info.complianceToProjectLocationAndCoverageLimits,
        ),
      );
    }

    children.push(
      new Paragraph({
        children: [
          this.createText(
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
        ...this.createComplianceToImpactManagementCommitmentsTables(
          info.complianceToImpactManagementCommitments,
        ),
      );
    }

    // B.1 ECC Conditions note
    children.push(
      new Paragraph({
        children: [
          this.createText(
            'B.1.  Compliance to Environmental Compliance Certificate Conditions',
            true,
          ),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
      }),
    );
    children.push(
      this.createParagraph(
        'Please see attached Annexes for ECC conditions',
        false,
        AlignmentType.CENTER,
      ),
    );

    // B.2 Air Quality Impact Assessment
    children.push(
      new Paragraph({
        children: [
          this.createText('B.2.  Air Quality Impact Assessment', true),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
      }),
    );
    if (info.airQualityImpactAssessment) {
      children.push(
        ...this.createAirQualitySection(info.airQualityImpactAssessment),
      );
    }

    // B.3 Water Quality Impact Assessment
    children.push(
      new Paragraph({
        children: [
          this.createText('B.3.  Water Quality Impact Assessment', true),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
      }),
    );
    if (info.waterQualityImpactAssessment) {
      children.push(
        ...this.createWaterQualitySection(info.waterQualityImpactAssessment),
      );
    }

    // B.4 Noise Quality Impact Assessment
    children.push(
      new Paragraph({
        children: [
          this.createText('B.4.  Noise Quality Impact Assessment', true),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
      }),
    );
    children.push(
      this.createParagraph(
        'Refer to attached internal noise level monitoring line graphs for April to June 2025',
        false,
        AlignmentType.CENTER,
      ),
    );
    if (info.noiseQualityImpactAssessment) {
      children.push(
        this.createNoiseQualityTable(info.noiseQualityImpactAssessment),
      );
    }

    // 3. Solid and Hazardous Waste Management
    children.push(
      new Paragraph({
        children: [
          this.createText(
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
        ...this.createSolidAndHazardousWasteSection(
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

  /**
   * Create general info key-value pairs at the top (like PDF)
   * Font: Arial 11pt, all black text
   */
  private createGeneralInfoKeyValues(
    generalInfo: CMVRGeneralInfo,
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Company Name (bold, Arial 11pt)
    if (generalInfo.companyName) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: generalInfo.companyName,
              bold: true,
              font: 'Arial',
              size: 22, // 11pt
              color: '000000',
            }),
          ],
          spacing: { after: 100 },
        }),
      );
    }

    // Location
    const locationStr =
      typeof generalInfo.location === 'string'
        ? generalInfo.location
        : generalInfo.location
          ? `Lat: ${generalInfo.location.latitude}, Long: ${generalInfo.location.longitude}`
          : '';

    if (locationStr) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: locationStr,
              font: 'Arial',
              size: 22,
              color: '000000',
            }),
          ],
          spacing: { after: 100 },
        }),
      );
    }

    // Quarter and Year
    if (generalInfo.quarter || generalInfo.year) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Quarter: ${generalInfo.quarter || 'N/A'} ${generalInfo.year || ''}`,
              font: 'Arial',
              size: 22,
              color: '000000',
            }),
          ],
          spacing: { after: 100 },
        }),
      );
    }

    // Dates
    if (generalInfo.dateOfComplianceMonitoringAndValidation) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Date of Compliance Monitoring and Validation: ${generalInfo.dateOfComplianceMonitoringAndValidation}`,
              font: 'Arial',
              size: 22,
              color: '000000',
            }),
          ],
          spacing: { after: 100 },
        }),
      );
    }

    if (generalInfo.monitoringPeriodCovered) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Monitoring Period Covered: ${generalInfo.monitoringPeriodCovered}`,
              font: 'Arial',
              size: 22,
              color: '000000',
            }),
          ],
          spacing: { after: 100 },
        }),
      );
    }

    if (generalInfo.dateOfCmrSubmission) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Date of CMR Submission: ${generalInfo.dateOfCmrSubmission}`,
              font: 'Arial',
              size: 22,
              color: '000000',
            }),
          ],
          spacing: { after: 200 },
        }),
      );
    }

    return paragraphs;
  }

  /**
   * Create ECC table with merged label column
   * Font: Arial 11pt, all black
   */
  private createECCTable(
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
        children: [
          // Label cell (merged vertically across all rows)
          new TableCell({
            children: [this.createParagraph('ECC', true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: eccList.length + 1, // +1 for header row
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          // Header columns
          new TableCell({
            children: [
              this.createParagraph(
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
              this.createParagraph('ECC Number', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              this.createParagraph(
                'Date of Issuance',
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

    // Data rows
    eccList.forEach((ecc) => {
      rows.push(
        new TableRow({
          children: [
            // No label cell here (it's merged from first row)
            new TableCell({
              children: [this.createParagraph(ecc.permitHolderName || 'N/A')],
            }),
            new TableCell({
              children: [this.createParagraph(ecc.eccNumber || 'N/A')],
            }),
            new TableCell({
              children: [this.createParagraph(ecc.dateOfIssuance || 'N/A')],
            }),
          ],
        }),
      );
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: this.createTableBorders(),
      rows,
    });
  }

  /**
   * Create ISAG/MPP table
   * Font: Arial 11pt, all black
   */
  private createISAGTable(
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
        children: [
          new TableCell({
            children: [
              this.createParagraph('ISAG/MPP', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: isagList.length + 1,
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              this.createParagraph(
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
              this.createParagraph(
                'ISAG Permit Number',
                true,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              this.createParagraph(
                'Date of Issuance',
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

    // Data rows
    isagList.forEach((isag) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [this.createParagraph(isag.permitHolderName || 'N/A')],
            }),
            new TableCell({
              children: [this.createParagraph(isag.isagPermitNumber || 'N/A')],
            }),
            new TableCell({
              children: [this.createParagraph(isag.dateOfIssuance || 'N/A')],
            }),
          ],
        }),
      );
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: this.createTableBorders(),
      rows,
    });
  }

  /**
   * Create key-value table (for Project info)
   * Font: Arial 11pt, all black
   */
  private createKeyValueTable(rows: Array<[string, string]>): Table {
    const tableRows: TableRow[] = rows.map(
      ([key, value]) =>
        new TableRow({
          children: [
            new TableCell({
              children: [this.createParagraph(`${key}:`, true)],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [this.createParagraph(value || 'N/A')],
              width: { size: 60, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
    );

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: this.createTableBorders(),
      rows: tableRows,
    });
  }

  /**
   * Create EPEP table
   * Font: Arial 11pt, all black
   */
  private createEPEPTable(
    epepList: Array<{
      permitHolderName?: string;
      epepNumber?: string;
      dateOfApproval?: string;
    }>,
  ): Table {
    const rows: TableRow[] = [];

    // Header row
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              this.createParagraph(
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
            children: [
              this.createParagraph(
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
              this.createParagraph('EPEP Number', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              this.createParagraph(
                'Date of Approval',
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

    // Data rows
    epepList.forEach((epep) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [this.createParagraph(epep.permitHolderName || 'N/A')],
            }),
            new TableCell({
              children: [this.createParagraph(epep.epepNumber || 'N/A')],
            }),
            new TableCell({
              children: [this.createParagraph(epep.dateOfApproval || 'N/A')],
            }),
          ],
        }),
      );
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: this.createTableBorders(),
      rows,
    });
  }

  // ===== Additional Sections (DOCX, mirroring PDF helpers at a high level) =====

  private createExecutiveSummaryTable(
    summary: NonNullable<CMVRGeneralInfo['executiveSummaryOfCompliance']>,
  ): Table {
    const rows: TableRow[] = [];

    const yn = (v: boolean | undefined) =>
      v ? 'Yes' : v === false ? 'No' : '-';

    // EPEP Commitments
    if (summary.complianceWithEpepCommitments) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                this.createParagraph('Compliance with EPEP Commitments', true),
              ],
              columnSpan: 4,
            }),
          ],
        }),
      );
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [this.createParagraph('Safety')] }),
            new TableCell({
              children: [
                this.createParagraph(
                  yn(summary.complianceWithEpepCommitments.safety),
                ),
              ],
            }),
            new TableCell({ children: [this.createParagraph('Social')] }),
            new TableCell({
              children: [
                this.createParagraph(
                  yn(summary.complianceWithEpepCommitments.social),
                ),
              ],
            }),
          ],
        }),
      );
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [this.createParagraph('Rehabilitation')],
            }),
            new TableCell({
              children: [
                this.createParagraph(
                  yn(summary.complianceWithEpepCommitments.rehabilitation),
                ),
              ],
            }),
            new TableCell({ children: [this.createParagraph('Remarks')] }),
            new TableCell({
              children: [
                this.createParagraph(
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
                this.createParagraph('Compliance with SDMP Commitments', true),
              ],
              columnSpan: 4,
            }),
          ],
        }),
      );
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [this.createParagraph('Complied')] }),
            new TableCell({
              children: [
                this.createParagraph(
                  yn(summary.complianceWithSdmpCommitments.complied),
                ),
              ],
            }),
            new TableCell({ children: [this.createParagraph('Not Complied')] }),
            new TableCell({
              children: [
                this.createParagraph(
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
            new TableCell({ children: [this.createParagraph('Remarks')] }),
            new TableCell({
              children: [
                this.createParagraph(
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
              children: [this.createParagraph('Complaints Management', true)],
              columnSpan: 4,
            }),
          ],
        }),
      );
      const addPair = (k: string, v?: boolean) =>
        rows.push(
          new TableRow({
            children: [
              new TableCell({ children: [this.createParagraph(k)] }),
              new TableCell({
                children: [this.createParagraph(yn(v))],
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
            new TableCell({ children: [this.createParagraph('Remarks')] }),
            new TableCell({
              children: [this.createParagraph(c.remarks || '-')],
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
              children: [this.createParagraph('Accountability', true)],
              columnSpan: 4,
            }),
          ],
        }),
      );
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [this.createParagraph('Complied')] }),
            new TableCell({
              children: [
                this.createParagraph(yn(summary.accountability.complied)),
              ],
            }),
            new TableCell({ children: [this.createParagraph('Not Complied')] }),
            new TableCell({
              children: [
                this.createParagraph(yn(summary.accountability.notComplied)),
              ],
            }),
          ],
        }),
      );
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [this.createParagraph('Remarks')] }),
            new TableCell({
              children: [
                this.createParagraph(summary.accountability.remarks || '-'),
              ],
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
              children: [this.createParagraph('Others', true)],
              columnSpan: 4,
            }),
          ],
        }),
      );
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [this.createParagraph('Specify')] }),
            new TableCell({
              children: [this.createParagraph(summary.others.specify || '-')],
              columnSpan: 3,
            }),
          ],
        }),
      );
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [this.createParagraph('N/A')] }),
            new TableCell({
              children: [this.createParagraph(yn(summary.others.na))],
              columnSpan: 3,
            }),
          ],
        }),
      );
    }

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: this.createTableBorders(),
      rows,
    });
  }

  private createProcessDocumentation(
    pd: NonNullable<
      CMVRGeneralInfo['processDocumentationOfActivitiesUndertaken']
    >,
  ): (Paragraph | Table)[] {
    const arr: (Paragraph | Table)[] = [];
    if (pd.dateConducted)
      arr.push(this.createParagraph(`Date Conducted: ${pd.dateConducted}`));
    if (pd.mergedMethodologyOrOtherRemarks)
      arr.push(
        this.createParagraph(`Remarks: ${pd.mergedMethodologyOrOtherRemarks}`),
      );

    const activityRows: TableRow[] = [];
    activityRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [this.createParagraph('Activity', true)] }),
          new TableCell({
            children: [this.createParagraph('MMT Members Involved', true)],
          }),
          new TableCell({
            children: [this.createParagraph('Date Conducted', true)],
          }),
          new TableCell({ children: [this.createParagraph('Remarks', true)] }),
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
            new TableCell({ children: [this.createParagraph(label)] }),
            new TableCell({
              children: [this.createParagraph(mmts?.join(', ') || '-')],
            }),
            new TableCell({ children: [this.createParagraph(date || '-')] }),
            new TableCell({ children: [this.createParagraph(remarks || '-')] }),
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
        borders: this.createTableBorders(),
        rows: activityRows,
      }),
    );
    return arr;
  }

  private createComplianceToProjectLocationTable(
    section: NonNullable<
      CMVRGeneralInfo['complianceToProjectLocationAndCoverageLimits']
    >,
  ): Table {
    const rows: TableRow[] = [];
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [this.createParagraph('Parameter', true)],
          }),
          new TableCell({
            children: [this.createParagraph('Specification', true)],
          }),
          new TableCell({
            children: [this.createParagraph('Within Specs', true)],
          }),
          new TableCell({ children: [this.createParagraph('Remarks', true)] }),
        ],
      }),
    );

    const toStr = (v: unknown) => {
      if (typeof v === 'string') return v;
      if (v && typeof v === 'object') {
        try {
          return Object.entries(v as Record<string, unknown>)
            .map(
              ([k, val]) =>
                `${k}: ${
                  val == null
                    ? '-'
                    : typeof val === 'object'
                      ? JSON.stringify(val)
                      : `${val as string | number | boolean}`
                }`,
            )
            .join('\n');
        } catch {
          return JSON.stringify(v);
        }
      }
      return '-';
    };

    section.parameters?.forEach((p) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [this.createParagraph(p.name || '-')] }),
            new TableCell({
              children: [this.createParagraph(toStr(p.specification))],
            }),
            new TableCell({
              children: [
                this.createParagraph(
                  p.withinSpecs ? 'Yes' : p.withinSpecs === false ? 'No' : '-',
                ),
              ],
            }),
            new TableCell({
              children: [this.createParagraph(toStr(p.remarks))],
            }),
          ],
        }),
      );
    });

    const otherComponents = (section.otherComponents || []) as Array<{
      name?: string;
      specification?: unknown;
      withinSpecs?: boolean;
      remarks?: unknown;
    }>;
    otherComponents.forEach((c) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [this.createParagraph(c.name || 'Other Components')],
            }),
            new TableCell({
              children: [this.createParagraph(toStr(c.specification))],
            }),
            new TableCell({
              children: [
                this.createParagraph(
                  c.withinSpecs ? 'Yes' : c.withinSpecs === false ? 'No' : '-',
                ),
              ],
            }),
            new TableCell({
              children: [this.createParagraph(toStr(c.remarks))],
            }),
          ],
        }),
      );
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: this.createTableBorders(),
      rows,
    });
  }

  private createComplianceToImpactManagementCommitmentsTables(
    section: NonNullable<
      CMVRGeneralInfo['complianceToImpactManagementCommitments']
    >,
  ): (Paragraph | Table)[] {
    const out: (Paragraph | Table)[] = [];
    const build = (
      title: string,
      groups?: Array<{
        areaName?: string;
        commitments?: Array<{
          plannedMeasure?: string;
          actualObservation?: string;
          isEffective?: boolean | null;
          recommendations?: string;
        }>;
      }>,
    ) => {
      if (!groups || groups.length === 0) return;
      out.push(
        new Paragraph({
          children: [this.createText(title, true)],
          spacing: { before: 100, after: 100 },
        }),
      );
      const rows: TableRow[] = [];
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [this.createParagraph('Area Name', true)],
            }),
            new TableCell({
              children: [this.createParagraph('Planned Measure', true)],
            }),
            new TableCell({
              children: [this.createParagraph('Actual Observation', true)],
            }),
            new TableCell({
              children: [this.createParagraph('Effective', true)],
            }),
            new TableCell({
              children: [this.createParagraph('Recommendations', true)],
            }),
          ],
        }),
      );
      for (const g of groups) {
        for (const c of g.commitments || []) {
          rows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [this.createParagraph(g.areaName || '-')],
                }),
                new TableCell({
                  children: [this.createParagraph(c.plannedMeasure || '-')],
                }),
                new TableCell({
                  children: [this.createParagraph(c.actualObservation || '-')],
                }),
                new TableCell({
                  children: [
                    this.createParagraph(
                      c.isEffective === null
                        ? '-'
                        : c.isEffective
                          ? 'Yes'
                          : 'No',
                    ),
                  ],
                }),
                new TableCell({
                  children: [this.createParagraph(c.recommendations || '-')],
                }),
              ],
            }),
          );
        }
      }
      out.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: this.createTableBorders(),
          rows,
        }),
      );
    };

    build('Construction Info', section.constructionInfo);
    build(
      'Implementation of Environmental Impact Control Strategies',
      section.implementationOfEnvironmentalImpactControlStrategies,
    );
    if (section.overallComplianceAssessment)
      out.push(
        this.createParagraph(
          `Overall Compliance Assessment: ${section.overallComplianceAssessment}`,
        ),
      );
    return out;
  }

  private createAirQualitySection(
    air: NonNullable<CMVRGeneralInfo['airQualityImpactAssessment']>,
  ): (Paragraph | Table)[] {
    const out: (Paragraph | Table)[] = [];
    const notes: string[] = [];
    if (air.quarry) notes.push(`Quarry: ${air.quarry}`);
    if (air.quarryPlant) notes.push(`Quarry Plant: ${air.quarryPlant}`);
    if (air.plant) notes.push(`Plant: ${air.plant}`);
    if (air.port) notes.push(`Port: ${air.port}`);
    if (notes.length) out.push(this.createParagraph(notes.join(' | ')));

    const rows: TableRow[] = [];
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [this.createParagraph('Parameter', true)],
          }),
          new TableCell({
            children: [this.createParagraph('In SMR (Current)', true)],
          }),
          new TableCell({
            children: [this.createParagraph('In SMR (Previous)', true)],
          }),
          new TableCell({
            children: [this.createParagraph('Confirmatory (Current)', true)],
          }),
          new TableCell({
            children: [this.createParagraph('Confirmatory (Previous)', true)],
          }),
          new TableCell({ children: [this.createParagraph('Red Flag', true)] }),
          new TableCell({ children: [this.createParagraph('Action', true)] }),
          new TableCell({ children: [this.createParagraph('Limit', true)] }),
          new TableCell({ children: [this.createParagraph('Remarks', true)] }),
        ],
      }),
    );
    air.parameters?.forEach((p) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [this.createParagraph(p.name || '-')] }),
            new TableCell({
              children: [
                this.createParagraph(p.results?.inSMR?.current || '-'),
              ],
            }),
            new TableCell({
              children: [
                this.createParagraph(p.results?.inSMR?.previous || '-'),
              ],
            }),
            new TableCell({
              children: [
                this.createParagraph(
                  p.results?.mmtConfirmatorySampling?.current || '-',
                ),
              ],
            }),
            new TableCell({
              children: [
                this.createParagraph(
                  p.results?.mmtConfirmatorySampling?.previous || '-',
                ),
              ],
            }),
            new TableCell({
              children: [this.createParagraph(p.eqpl?.redFlag || '-')],
            }),
            new TableCell({
              children: [this.createParagraph(p.eqpl?.action || '-')],
            }),
            new TableCell({
              children: [this.createParagraph(p.eqpl?.limit || '-')],
            }),
            new TableCell({
              children: [this.createParagraph(p.remarks || '-')],
            }),
          ],
        }),
      );
    });
    out.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: this.createTableBorders(),
        rows,
      }),
    );

    if (air.samplingDate) out.push(this.createParagraph(air.samplingDate));
    if (air.weatherAndWind) out.push(this.createParagraph(air.weatherAndWind));
    if (air.explanationForConfirmatorySampling)
      out.push(
        this.createParagraph(
          `Explanation for Confirmatory Sampling: ${air.explanationForConfirmatorySampling}`,
        ),
      );
    if (air.overallAssessment)
      out.push(
        this.createParagraph(`Overall Assessment: ${air.overallAssessment}`),
      );
    return out;
  }

  private createWaterQualitySection(
    wq: NonNullable<CMVRGeneralInfo['waterQualityImpactAssessment']>,
  ): (Paragraph | Table)[] {
    const out: (Paragraph | Table)[] = [];
    const notes: string[] = [];
    if (wq.quarry) notes.push(`Quarry: ${wq.quarry}`);
    if (wq.quarryPlant) notes.push(`Quarry Plant: ${wq.quarryPlant}`);
    if (wq.plant) notes.push(`Plant: ${wq.plant}`);
    if (wq.port) notes.push(`Port: ${wq.port}`);
    if (notes.length) out.push(this.createParagraph(notes.join(' | ')));

    const buildTable = (
      params?: NonNullable<
        CMVRGeneralInfo['waterQualityImpactAssessment']
      >['parameters'],
    ) => {
      if (!params || params.length === 0) return undefined as unknown as Table;
      const rows: TableRow[] = [];
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [this.createParagraph('Parameter', true)],
            }),
            new TableCell({
              children: [this.createParagraph('Internal Monitoring', true)],
            }),
            new TableCell({
              children: [
                this.createParagraph('Confirmatory (Current/Prev)', true),
              ],
            }),
            new TableCell({
              children: [this.createParagraph('DENR Red Flag', true)],
            }),
            new TableCell({
              children: [this.createParagraph('DENR Action', true)],
            }),
            new TableCell({
              children: [this.createParagraph('DENR Limit (mg/L)', true)],
            }),
            new TableCell({ children: [this.createParagraph('Remark', true)] }),
          ],
        }),
      );
      params.forEach((p) => {
        const im = p.result?.internalMonitoring;
        const imText = im
          ? `${im.month || ''} ${(im.readings || [])
              .map(
                (r) =>
                  `${r.label}: ${r.current_mgL ?? '-'} / ${r.previous_mgL ?? '-'}`,
              )
              .join(', ')}`
          : '-';
        const confirm = `${p.result?.mmtConfirmatorySampling?.current || '-'} / ${p.result?.mmtConfirmatorySampling?.previous || '-'}`;
        rows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [this.createParagraph(p.name || '-')],
              }),
              new TableCell({ children: [this.createParagraph(imText)] }),
              new TableCell({ children: [this.createParagraph(confirm)] }),
              new TableCell({
                children: [
                  this.createParagraph(p.denrStandard?.redFlag || '-'),
                ],
              }),
              new TableCell({
                children: [this.createParagraph(p.denrStandard?.action || '-')],
              }),
              new TableCell({
                children: [
                  this.createParagraph(
                    p.denrStandard?.limit_mgL != null
                      ? String(p.denrStandard.limit_mgL)
                      : '-',
                  ),
                ],
              }),
              new TableCell({
                children: [this.createParagraph(p.remark || '-')],
              }),
            ],
          }),
        );
      });
      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: this.createTableBorders(),
        rows,
      });
    };

    const t1 = buildTable(wq.parameters);
    if (t1) out.push(t1);
    const t2 = buildTable(wq.parametersTable2);
    if (t2) out.push(t2);

    if (wq.samplingDate)
      out.push(this.createParagraph(`Sampling Date: ${wq.samplingDate}`));
    if (wq.weatherAndWind)
      out.push(this.createParagraph(`Weather & Wind: ${wq.weatherAndWind}`));
    if (wq.explanationForConfirmatorySampling)
      out.push(
        this.createParagraph(
          `Explanation for Confirmatory Sampling: ${wq.explanationForConfirmatorySampling}`,
        ),
      );
    if (wq.overallAssessment)
      out.push(
        this.createParagraph(`Overall Assessment: ${wq.overallAssessment}`),
      );
    return out;
  }

  private createNoiseQualityTable(
    nq: NonNullable<CMVRGeneralInfo['noiseQualityImpactAssessment']>,
  ): Table {
    const rows: TableRow[] = [];
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [this.createParagraph('Parameter', true)],
          }),
          new TableCell({
            children: [this.createParagraph('In SMR (Current)', true)],
          }),
          new TableCell({
            children: [this.createParagraph('In SMR (Previous)', true)],
          }),
          new TableCell({
            children: [this.createParagraph('Confirmatory (Current)', true)],
          }),
          new TableCell({
            children: [this.createParagraph('Confirmatory (Previous)', true)],
          }),
          new TableCell({ children: [this.createParagraph('Red Flag', true)] }),
          new TableCell({ children: [this.createParagraph('Action', true)] }),
          new TableCell({
            children: [this.createParagraph('DENR Standard', true)],
          }),
          new TableCell({ children: [this.createParagraph('Remarks', true)] }),
        ],
      }),
    );
    nq.parameters?.forEach((p) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [this.createParagraph(p.name || '-')] }),
            new TableCell({
              children: [
                this.createParagraph(p.results?.inSMR?.current || '-'),
              ],
            }),
            new TableCell({
              children: [
                this.createParagraph(p.results?.inSMR?.previous || '-'),
              ],
            }),
            new TableCell({
              children: [
                this.createParagraph(
                  p.results?.mmtConfirmatorySampling?.current || '-',
                ),
              ],
            }),
            new TableCell({
              children: [
                this.createParagraph(
                  p.results?.mmtConfirmatorySampling?.previous || '-',
                ),
              ],
            }),
            new TableCell({
              children: [this.createParagraph(p.eqpl?.redFlag || '-')],
            }),
            new TableCell({
              children: [this.createParagraph(p.eqpl?.action || '-')],
            }),
            new TableCell({
              children: [this.createParagraph(p.eqpl?.denrStandard || '-')],
            }),
            new TableCell({
              children: [this.createParagraph(p.remarks || '-')],
            }),
          ],
        }),
      );
    });
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: this.createTableBorders(),
      rows,
    });
  }

  private createSolidAndHazardousWasteSection(
    section: NonNullable<
      CMVRGeneralInfo['complianceWithGoodPracticeInSolidAndHazardousWasteManagement']
    >,
  ): (Paragraph | Table)[] {
    const out: (Paragraph | Table)[] = [];
    type WasteRow = {
      typeOfWaste?: string;
      eccEpepCommitments?: {
        handling?: string;
        storage?: string;
        disposal?: boolean;
      };
      adequate?: { y?: boolean; n?: boolean };
      previousRecord?: unknown;
      q2_2025_Generated_HW?: unknown;
      total?: unknown;
    };
    const toStr = (v: unknown) => {
      if (typeof v === 'string') return v;
      if (v && typeof v === 'object') {
        try {
          return Object.entries(v as Record<string, unknown>)
            .map(
              ([k, val]) =>
                `${k}: ${
                  val == null
                    ? '-'
                    : typeof val === 'object'
                      ? JSON.stringify(val)
                      : `${val as string | number | boolean}`
                }`,
            )
            .join('\n');
        } catch {
          return JSON.stringify(v);
        }
      }
      return '-';
    };
    const build = (label: string, data?: string | WasteRow[]) => {
      if (!data) return;
      out.push(
        new Paragraph({
          children: [this.createText(label, true)],
          spacing: { before: 100, after: 100 },
        }),
      );
      if (typeof data === 'string') {
        out.push(this.createParagraph(data));
        return;
      }
      const rows: TableRow[] = [];
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [this.createParagraph('Type of Waste', true)],
            }),
            new TableCell({
              children: [this.createParagraph('ECC/EPEP Handling', true)],
            }),
            new TableCell({
              children: [this.createParagraph('ECC/EPEP Storage', true)],
            }),
            new TableCell({
              children: [this.createParagraph('ECC/EPEP Disposal', true)],
            }),
            new TableCell({
              children: [this.createParagraph('Adequate (Y/N)', true)],
            }),
            new TableCell({
              children: [this.createParagraph('Previous Record', true)],
            }),
            new TableCell({
              children: [this.createParagraph('Q2 2025 Generated HW', true)],
            }),
            new TableCell({ children: [this.createParagraph('Total', true)] }),
          ],
        }),
      );
      data.forEach((row) => {
        rows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [this.createParagraph(row.typeOfWaste || '-')],
              }),
              new TableCell({
                children: [
                  this.createParagraph(row.eccEpepCommitments?.handling || '-'),
                ],
              }),
              new TableCell({
                children: [
                  this.createParagraph(row.eccEpepCommitments?.storage || '-'),
                ],
              }),
              new TableCell({
                children: [
                  this.createParagraph(
                    row.eccEpepCommitments?.disposal ? 'Yes' : 'No',
                  ),
                ],
              }),
              new TableCell({
                children: [
                  this.createParagraph(
                    row.adequate?.y ? 'Y' : row.adequate?.n ? 'N' : '-',
                  ),
                ],
              }),
              new TableCell({
                children: [this.createParagraph(toStr(row.previousRecord))],
              }),
              new TableCell({
                children: [
                  this.createParagraph(toStr(row.q2_2025_Generated_HW)),
                ],
              }),
              new TableCell({
                children: [this.createParagraph(toStr(row.total))],
              }),
            ],
          }),
        );
      });
      out.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: this.createTableBorders(),
          rows,
        }),
      );
    };

    build('Quarry', section.quarry);
    build('Plant', section.plant);
    build('Port', section.port);
    return out;
  }

  /**
   * Create fund status sections (RCF, MTF, FMRDF)
   */
  private createFundStatusSections(
    generalInfo: CMVRGeneralInfo,
  ): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];

    // Rehabilitation Cash Fund
    if (
      generalInfo.rehabilitationCashFund &&
      generalInfo.rehabilitationCashFund.length > 0
    ) {
      elements.push(
        new Paragraph({ text: '', spacing: { after: 100 } }), // Spacing
      );
      elements.push(
        this.createFundTable(
          'REHABILITATION CASH FUND',
          generalInfo.rehabilitationCashFund,
        ),
      );
    }

    // Monitoring Trust Fund (Unified)
    if (
      generalInfo.monitoringTrustFundUnified &&
      generalInfo.monitoringTrustFundUnified.length > 0
    ) {
      elements.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      elements.push(
        this.createFundTable(
          'MONITORING TRUST FUND (UNIFIED)',
          generalInfo.monitoringTrustFundUnified,
        ),
      );
    }

    // Final Mine Rehabilitation and Decommissioning Fund
    if (
      generalInfo.finalMineRehabilitationAndDecommissioningFund &&
      generalInfo.finalMineRehabilitationAndDecommissioningFund.length > 0
    ) {
      elements.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      elements.push(
        this.createFundTable(
          'FINAL MINE REHABILITATION AND DECOMMISSIONING FUND',
          generalInfo.finalMineRehabilitationAndDecommissioningFund,
        ),
      );
    }

    return elements;
  }

  /**
   * Create a fund table (generic for all fund types)
   * Font: Arial 11pt, all black
   */
  private createFundTable(
    title: string,
    fundList: Array<{
      permitHolderName?: string;
      savingsAccountNumber?: string;
      amountDeposited?: string;
      dateUpdated?: string;
    }>,
  ): Table {
    const rows: TableRow[] = [];

    // Header row with merged label
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [this.createParagraph(title, true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: fundList.length + 1,
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              this.createParagraph(
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
              this.createParagraph(
                'Savings Account Number',
                true,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              this.createParagraph(
                'Amount Deposited',
                true,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              this.createParagraph('Date Updated', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    );

    // Data rows
    fundList.forEach((fund) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [this.createParagraph(fund.permitHolderName || 'N/A')],
            }),
            new TableCell({
              children: [
                this.createParagraph(fund.savingsAccountNumber || 'N/A'),
              ],
            }),
            new TableCell({
              children: [this.createParagraph(fund.amountDeposited || 'N/A')],
            }),
            new TableCell({
              children: [this.createParagraph(fund.dateUpdated || 'N/A')],
            }),
          ],
        }),
      );
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: this.createTableBorders(),
      rows,
    });
  }

  /**
   * Create additional information section (Coordinates, Proponent, MMT)
   */
  private createAdditionalInfo(
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
      elements.push(this.createKeyValueTable(rows));
    }

    return elements;
  }

  /**
   * Helper to create consistent table borders
   */
  private createTableBorders() {
    return {
      top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    };
  }

  /**
   * Helper to create text with Arial 11pt font
   */
  private createText(text: string, bold = false, size = 22): TextRun {
    return new TextRun({
      text,
      font: 'Arial',
      size, // Default 22 = 11pt
      color: '000000',
      bold,
    });
  }

  /**
   * Helper to create a paragraph with Arial 11pt text
   */
  private createParagraph(
    text: string,
    bold = false,
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType],
  ): Paragraph {
    return new Paragraph({
      children: [this.createText(text, bold)],
      alignment,
    });
  }
}
