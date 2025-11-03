import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import {
  toECCRows,
  toISAGRows,
  toEPEPRows,
  toFundRows,
} from './cmvr-pdf.helpers';
import {
  addFooter,
  drawTable,
  drawKeyValueTableWithColon,
  addGeneralInfoKeyValues,
  drawExecutiveSummaryOfCompliance,
  drawProcessDocumentationOfActivitiesUndertaken,
  drawComplianceToProjectLocationTable,
  drawComplianceToImpactManagementCommitmentsTable,
  drawAirQualityImpactAssessmentTable,
  drawWaterQualityImpactAssessmentTable,
  drawSolidAndHazardousWasteManagementTable,
  drawNoiseQualityImpactAssessmentTable,
} from './cmvr-pdf-rendering.helpers';

// Shape for the normalized generalInfo JSON we agreed on
export interface CMVRGeneralInfo {
  companyName?: string;
  location?:
    | string
    | {
        latitude?: number;
        longitude?: number;
      };
  quarter?: string;
  year?: number | string;
  dateOfComplianceMonitoringAndValidation?: string; // ISO or human readable
  monitoringPeriodCovered?: string;
  dateOfCmrSubmission?: string;

  ecc?: Array<{
    permitHolderName?: string;
    eccNumber?: string;
    dateOfIssuance?: string;
  }>;

  isagMpp?: Array<{
    permitHolderName?: string;
    isagPermitNumber?: string;
    dateOfIssuance?: string;
  }>;

  projectCurrentName?: string;
  projectNameInEcc?: string;
  projectStatus?: string;
  projectGeographicalCoordinates?: string | { x?: number; y?: number };
  proponent?: {
    contactPersonAndPosition?: string;
    mailingAddress?: string;
    telephoneFax?: string;
    emailAddress?: string;
  };
  mmt?: {
    contactPersonAndPosition?: string;
    mailingAddress?: string;
    telephoneFax?: string;
    emailAddress?: string;
  };
  epepFmrdpStatus?: string;
  epep?: Array<{
    permitHolderName?: string;
    epepNumber?: string;
    dateOfApproval?: string;
  }>;
  // New fund sections
  rehabilitationCashFund?: Array<{
    permitHolderName?: string;
    savingsAccountNumber?: string;
    amountDeposited?: string;
    dateUpdated?: string;
  }>;
  monitoringTrustFundUnified?: Array<{
    permitHolderName?: string;
    savingsAccountNumber?: string;
    amountDeposited?: string;
    dateUpdated?: string;
  }>;
  finalMineRehabilitationAndDecommissioningFund?: Array<{
    permitHolderName?: string;
    savingsAccountNumber?: string;
    amountDeposited?: string;
    dateUpdated?: string;
  }>;

  // Section II: Executive Summary of Compliance
  executiveSummaryOfCompliance?: {
    complianceWithEpepCommitments?: {
      safety?: boolean;
      social?: boolean;
      rehabilitation?: boolean;
      remarks?: string;
    };
    complianceWithSdmpCommitments?: {
      complied?: boolean;
      notComplied?: boolean;
      remarks?: string;
    };
    complaintsManagement?: {
      naForAll?: boolean;
      complaintReceivingSetup?: boolean;
      caseInvestigation?: boolean;
      implementationOfControl?: boolean;
      communicationWithComplainantOrPublic?: boolean;
      complaintDocumentation?: boolean;
      remarks?: string;
    };
    accountability?: {
      complied?: boolean;
      notComplied?: boolean;
      remarks?: string;
    };
    others?: {
      specify?: string;
      na?: boolean;
    };
  };

  // Section III: Process Documentation of Activities Undertaken
  processDocumentationOfActivitiesUndertaken?: {
    dateConducted?: string;
    sameDateForAllActivities?: boolean;
    mergedMethodologyOrOtherRemarks?: string;
    activities?: {
      complianceWithEccConditionsCommitments?: {
        mmtMembersInvolved?: string[];
        dateConducted?: string;
        remarks?: string;
      };
      complianceWithEpepAepepConditions?: {
        mmtMembersInvolved?: string[];
        dateConducted?: string;
        remarks?: string;
      };
      siteOcularValidation?: {
        mmtMembersInvolved?: string[];
        dateConducted?: string;
        remarks?: string;
      };
      siteValidationConfirmatorySampling?: {
        applicable?: boolean;
        none?: boolean;
        mmtMembersInvolved?: string[];
        dateConducted?: string;
        remarks?: string;
      };
    };
  };

  // Section I: Compliance Monitoring Report and Discussions
  complianceToProjectLocationAndCoverageLimits?: {
    parameters?: Array<{
      name?: string;
      specification?: string | Record<string, string | undefined>;
      withinSpecs?: boolean;
      remarks?: string | Record<string, string | undefined>;
    }>;
    otherComponents?: Array<{
      name?: string;
      specification?: string;
      withinSpecs?: boolean;
      remarks?: string;
    }>;
  };

  complianceToImpactManagementCommitments?: {
    constructionInfo?: Array<{
      areaName?: string;
      commitments?: Array<{
        plannedMeasure?: string;
        actualObservation?: string;
        isEffective?: boolean | null;
        recommendations?: string;
      }>;
    }>;
    implementationOfEnvironmentalImpactControlStrategies?: Array<{
      areaName?: string;
      commitments?: Array<{
        plannedMeasure?: string;
        actualObservation?: string;
        isEffective?: boolean | null;
        recommendations?: string;
      }>;
    }>;
    overallComplianceAssessment?: string;
  };

  airQualityImpactAssessment?: {
    quarry?: string;
    quarryPlant?: string;
    plant?: string;
    port?: string;
    parameters?: Array<{
      name?: string;
      results?: {
        inSMR?: {
          current?: string;
          previous?: string;
        };
        mmtConfirmatorySampling?: {
          current?: string;
          previous?: string;
        };
      };
      eqpl?: {
        redFlag?: string;
        action?: string;
        limit?: string;
      };
      remarks?: string;
    }>;
    samplingDate?: string;
    weatherAndWind?: string;
    explanationForConfirmatorySampling?: string;
    overallAssessment?: string;
  };

  waterQualityImpactAssessment?: {
    quarry?: string;
    quarryPlant?: string;
    plant?: string;
    port?: string;
    parameters?: Array<{
      name?: string;
      result?: {
        internalMonitoring?: {
          month?: string;
          readings?: Array<{
            label?: string;
            current_mgL?: number;
            previous_mgL?: number;
          }>;
        };
        mmtConfirmatorySampling?: {
          current?: string;
          previous?: string;
        };
      };
      denrStandard?: {
        redFlag?: string;
        action?: string;
        limit_mgL?: number;
      };
      remark?: string;
    }>;
    parametersTable2?: Array<{
      name?: string;
      result?: {
        internalMonitoring?: {
          month?: string;
          readings?: Array<{
            label?: string;
            current_mgL?: number;
            previous_mgL?: number;
          }>;
        };
        mmtConfirmatorySampling?: {
          current?: string;
          previous?: string;
        };
      };
      denrStandard?: {
        redFlag?: string;
        action?: string;
        limit_mgL?: number;
      };
      remark?: string;
    }>;
    samplingDate?: string;
    weatherAndWind?: string;
    explanationForConfirmatorySampling?: string;
    overallAssessment?: string;
  };

  noiseQualityImpactAssessment?: {
    parameters?: Array<{
      name?: string;
      results?: {
        inSMR?: {
          current?: string;
          previous?: string;
        };
        mmtConfirmatorySampling?: {
          current?: string;
          previous?: string;
        };
      };
      eqpl?: {
        redFlag?: string;
        action?: string;
        denrStandard?: string;
      };
      remarks?: string;
    }>;
    samplingDate?: string;
    weatherAndWind?: string;
    explanationForConfirmatorySampling?: string;
    overallAssessment?: {
      firstQuarter?: {
        year?: string;
        assessment?: string;
      };
      secondQuarter?: {
        year?: string;
        assessment?: string;
      };
      thirdQuarter?: {
        year?: string;
        assessment?: string;
      };
      fourthQuarter?: {
        year?: string;
        assessment?: string;
      };
    };
  };

  complianceWithGoodPracticeInSolidAndHazardousWasteManagement?: {
    quarry?:
      | string
      | Array<{
          typeOfWaste?: string;
          eccEpepCommitments?: {
            handling?: string;
            storage?: string;
            disposal?: boolean;
          };
          adequate?: {
            y?: boolean;
            n?: boolean;
          };
          previousRecord?: string | Record<string, number>;
          q2_2025_Generated_HW?: string | Record<string, number>;
          total?: string | Record<string, number>;
        }>;
    plant?:
      | string
      | Array<{
          typeOfWaste?: string;
          eccEpepCommitments?: {
            handling?: string;
            storage?: string;
            disposal?: boolean;
          };
          adequate?: {
            y?: boolean;
            n?: boolean;
          };
          previousRecord?: string | Record<string, number>;
          q2_2025_Generated_HW?: string | Record<string, number>;
          total?: string | Record<string, number>;
        }>;
    port?:
      | string
      | Array<{
          typeOfWaste?: string;
          eccEpepCommitments?: {
            handling?: string;
            storage?: string;
            disposal?: boolean;
          };
          adequate?: {
            y?: boolean;
            n?: boolean;
          };
          previousRecord?: string | Record<string, number>;
          q2_2025_Generated_HW?: string | Record<string, number>;
          total?: string | Record<string, number>;
        }>;
  };


  complianceWithGoodPracticeInChemicalSafetyManagement?:{
    chemicalsInPclAndCoo?: boolean;
    riskManagement?: boolean;
    training?: boolean;
    handling?: boolean;
    emergencyPreparedness?: boolean;
    remarks?: string;

  }

  complaintsVerificationAndManagement?: Array< {

    dateFiled?: string;
    denr?: boolean;
    company?: boolean;
    mmt?: boolean;
    otherSpecify?: string;
    natureOfComplaint?: string;
    resulotionMade?: string;
  }>

recommendationFromPrevQuarter?: {
    quarter?: number;
    year?: number;
    plant?: Array<{
      recommendation: string
      commitment: string
      status:string
    }>
    quarry?: Array<{
      recommendation: string
      commitment: string
      status:string
    }>
    port?: Array<{
      recommendation: string
      commitment: string
      status:string
    }>
}
recommendationForNextQuarter?: {
    quarter?: number;
    year?: number;
    plant?: Array<{
      recommendation: string
      commitment: string
      status:string
    }>
    quarry?: Array<{
      recommendation: string
      commitment: string
      status:string
    }>
    port?: Array<{
      recommendation: string
      commitment: string
      status:string
    }>
}
  
}

@Injectable()
export class CMVRPdfGeneratorService {
  /**
   * Generate a PDF Buffer for the General Information section of a CMVR report
   */
  async generateGeneralInfoPdf(generalInfo: CMVRGeneralInfo): Promise<Buffer> {
    const doc = new PDFDocument({
      // Custom size: 21.59 cm x 33.02 cm => 8.5 in x 13 in => 612 x 936 points (72 pt/in)
      size: [612, 936],
      margins: { top: 50, bottom: 50, left: 56, right: 46 },
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));
    });

    try {
      addGeneralInfoKeyValues(doc, generalInfo);

      doc.moveDown(1);

      const leftMargin = doc.page.margins.left || 50;
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`I. BASIC INFORMATION`, leftMargin, doc.y, { align: 'left' });

      // ECC table with merged label column
      const hasECC = !!(generalInfo.ecc && generalInfo.ecc.length > 0);
      const hasISAG = !!(generalInfo.isagMpp && generalInfo.isagMpp.length > 0);
      if (hasECC) {
        const eccList = generalInfo.ecc ?? [];
        doc.moveDown(0.5);
        drawTable(doc, {
          labelColumn: 'ECC',
          headers: ['Name of Permit Holder', 'ECC Number', 'Date of Issuance'],
          columnWidths: [0.4, 0.25, 0.35], // 40% for name, 25% for ECC number, 35% for date
          rows: toECCRows(eccList),
          // If ISAG/MPP follows, suppress bottom spacing to visually connect
          suppressBottomSpacing: hasISAG,
        });
      }

      // ISAG/MPP table with merged label column
      if (hasISAG) {
        const isagList = generalInfo.isagMpp ?? [];
        // If ECC exists just before, connect this section to it (no gap and shared border)
        if (!hasECC) {
          doc.moveDown(0.5);
        }
        drawTable(doc, {
          labelColumn: 'ISAG/MPP',
          headers: [
            'Name of Permit Holder',
            'ISAG Permit Number',
            'Date of Issuance',
          ],
          // Match ECC column widths
          columnWidths: [0.4, 0.25, 0.35],
          connectPrevious: hasECC,
          rows: toISAGRows(isagList),
        });
      }

      doc.moveDown(1);

      // Project info rows (no header, with colon column) - above EPEP
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

      const hasProjectInfo = projectInfoRows.length > 0;
      const hasEPEP = !!(generalInfo.epep && generalInfo.epep.length > 0);

      if (hasProjectInfo) {
        doc.moveDown(0.5);
        drawKeyValueTableWithColon(doc, projectInfoRows, hasEPEP, 135);
      }

      // Render Grouped Fund Status Section (after EPEP)
      const rcf = generalInfo.rehabilitationCashFund ?? [];
      const mtf = generalInfo.monitoringTrustFundUnified ?? [];
      const fmrdf =
        generalInfo.finalMineRehabilitationAndDecommissioningFund ?? [];

      const hasRCF = rcf.length > 0;
      const hasMTF = mtf.length > 0;
      const hasFMRDF = fmrdf.length > 0;
      const hasFunds = hasRCF || hasMTF || hasFMRDF;

      // EPEP table with merged label column
      if (hasEPEP) {
        // Don't add spacing if project info exists (visually connect them)
        if (!hasProjectInfo) {
          doc.moveDown(0.5);
        }
        drawTable(doc, {
          labelColumn: 'EPEP/FMRDP Status',
          headers: ['Name of Permit Holder', 'EPEP Number', 'Date of Approval'],
          rows: toEPEPRows(generalInfo.epep ?? []),
          connectPrevious: hasProjectInfo,
          suppressBottomSpacing: hasFunds, // Suppress spacing if funds section follows
          suppressBottomBorder: hasFunds, // Only draw bottom border under label area if funds follow
        });
      }

      if (hasFunds) {
        // If not directly connected to EPEP, add a small gap
        const connectPrev = !!hasEPEP;
        if (!connectPrev) {
          doc.moveDown(0.5);
        }

        const groups: Array<{
          title: string;
          rows: [string, string, string, string][];
        }> = [];
        if (hasRCF) {
          groups.push({
            title: 'REHABILITATION CASH FUND',
            rows: toFundRows(rcf),
          });
        }
        if (hasMTF) {
          groups.push({
            title: 'MONITORING TRUST FUND (UNIFIED)',
            rows: toFundRows(mtf),
          });
        }
        if (hasFMRDF) {
          groups.push({
            title: 'FINAL MINE REHABILITATION AND DECOMMISSIONING FUND',
            rows: toFundRows(fmrdf),
          });
        }

        // Check if additional info rows exist to determine spacing
        const hasAdditionalInfo = !!(
          generalInfo.projectGeographicalCoordinates ||
          generalInfo.proponent ||
          generalInfo.mmt
        );

        this.drawFundStatusSection(doc, groups, connectPrev, hasAdditionalInfo);
      }

      // Additional project and contact information rows
      const additionalInfoRows: Array<[string, string]> = [];

      // Project Geographical Coordinates
      if (generalInfo.projectGeographicalCoordinates) {
        const coords = generalInfo.projectGeographicalCoordinates;
        let coordsStr: string;
        if (typeof coords === 'string') {
          coordsStr = coords;
        } else if (coords.x !== undefined && coords.y !== undefined) {
          coordsStr = `X: ${coords.x}, Y: ${coords.y}`;
        } else {
          coordsStr = '-';
        }
        additionalInfoRows.push([
          'Project Geographical Coordinates',
          coordsStr,
        ]);
      }

      // Proponent information
      if (generalInfo.proponent) {
        if (generalInfo.proponent.contactPersonAndPosition) {
          additionalInfoRows.push([
            'Proponent Contact Person & Position',
            generalInfo.proponent.contactPersonAndPosition,
          ]);
        }
        if (generalInfo.proponent.mailingAddress) {
          additionalInfoRows.push([
            'Proponent Mailing Address',
            generalInfo.proponent.mailingAddress,
          ]);
        }
        if (generalInfo.proponent.telephoneFax) {
          additionalInfoRows.push([
            'Proponent Telephone No./ Fax No.',
            generalInfo.proponent.telephoneFax,
          ]);
        }
        if (generalInfo.proponent.emailAddress) {
          additionalInfoRows.push([
            'Proponent Email Address',
            generalInfo.proponent.emailAddress,
          ]);
        }
      }

      // MMT information
      if (generalInfo.mmt) {
        if (generalInfo.mmt.contactPersonAndPosition) {
          additionalInfoRows.push([
            'MMT Contact Person & Position',
            generalInfo.mmt.contactPersonAndPosition,
          ]);
        }
        if (generalInfo.mmt.mailingAddress) {
          additionalInfoRows.push([
            'MMT Mailing Address',
            generalInfo.mmt.mailingAddress,
          ]);
        }
        if (generalInfo.mmt.telephoneFax) {
          additionalInfoRows.push([
            'MMT Telephone No./ Fax No.',
            generalInfo.mmt.telephoneFax,
          ]);
        }
        if (generalInfo.mmt.emailAddress) {
          additionalInfoRows.push([
            'MMT Email Address',
            generalInfo.mmt.emailAddress,
          ]);
        }
      }

      if (additionalInfoRows.length > 0) {
        // Don't add spacing if fund section exists (visually connect them)
        if (!hasFunds) {
          doc.moveDown(0.5);
        }
        drawKeyValueTableWithColon(
          doc,
          additionalInfoRows,
          false,
          197.5,
          undefined,
          hasFunds, // connectPrevious: true if funds exist
        );
      }

      doc.moveDown(1);

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`II. EXECUTIVE SUMMARY OF COMPLIANCE`, leftMargin, doc.y, {
          align: 'left',
        });

      if (generalInfo.executiveSummaryOfCompliance) {
        doc.moveDown(0.5);
        drawExecutiveSummaryOfCompliance(
          doc,
          generalInfo.executiveSummaryOfCompliance,
        );
      }

      doc.moveDown(1);

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(
          `III. PROCESS DOCUMENTATION OF ACTIVITIES UNDERTAKEN`,
          leftMargin,
          doc.y,
          {
            align: 'left',
          },
        );

      if (generalInfo.processDocumentationOfActivitiesUndertaken) {
        doc.moveDown(0.5);
        drawProcessDocumentationOfActivitiesUndertaken(
          doc,
          generalInfo.processDocumentationOfActivitiesUndertaken,
        );
      }

      doc.moveDown(1);

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(
          `I. COMPLIANCE MONITORING REPORT AND DISCUSSIONS`,
          leftMargin,
          doc.y,
          {
            align: 'center',
          },
        )
        .moveDown(0.3);

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(
          `1.   Compliance to Project Location and Coverage Limits (As specified in ECC and/ or EPEP) `,
          leftMargin,
          doc.y,
          {
            align: 'center',
          },
        );

      if (generalInfo.complianceToProjectLocationAndCoverageLimits) {
        doc.moveDown(0.5);
        drawComplianceToProjectLocationTable(
          doc,
          generalInfo.complianceToProjectLocationAndCoverageLimits,
        );
      }

      doc.moveDown(1);

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(
          `2.   Compliance to Impact Management Commitments in EIA report & EPEP`,
          leftMargin,
          doc.y,
          {
            align: 'center',
          },
        );

      if (generalInfo.complianceToImpactManagementCommitments) {
        doc.moveDown(0.5);
        drawComplianceToImpactManagementCommitmentsTable(
          doc,
          generalInfo.complianceToImpactManagementCommitments,
        );
      }

      doc.moveDown(1);

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(
          `B.1.  Compliance to Environmental Compliance Certificate Conditions `,
          leftMargin,
          doc.y,
          {
            align: 'center',
          },
        )
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(
          `Please see attached Annexes for ECC conditions`,
          leftMargin,
          doc.y,
          {
            align: 'center',
          },
        )
        .moveDown(2);

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`B.2.  Air Quality Impact Assessment`, leftMargin, doc.y, {
          align: 'center',
        })
        .moveDown(0.3);

      if (generalInfo.airQualityImpactAssessment) {
        doc.moveDown(0.5);
        drawAirQualityImpactAssessmentTable(
          doc,
          generalInfo.airQualityImpactAssessment,
        );
      }

      doc.moveDown(2);

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`B.3.  Water Quality Impact Assessment `, leftMargin, doc.y, {
          align: 'center',
        })
        .moveDown(0.3);

      if (generalInfo.waterQualityImpactAssessment) {
        doc.moveDown(0.5);
        drawWaterQualityImpactAssessmentTable(
          doc,
          generalInfo.waterQualityImpactAssessment,
        );
      }

      doc.moveDown(2);

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`B.4.  Noise Quality Impact Assessment`, leftMargin, doc.y, {
          align: 'center',
        })
        .moveDown(0.3);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(
          `Refer to attached internal noise level monitoring line graphs for April to June 2025 `,
          leftMargin,
          doc.y,
          {
            align: 'center',
          },
        )
        .moveDown(1);

      if (generalInfo.noiseQualityImpactAssessment) {
        doc.moveDown(0.5);
        drawNoiseQualityImpactAssessmentTable(
          doc,
          generalInfo.noiseQualityImpactAssessment,
        );
      }

      doc.moveDown(2);

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(
          `3.   Compliance with Good Practice in Solid and Hazardous Waste Management`,
          leftMargin,
          doc.y,
          {
            align: 'center',
          },
        )
        .moveDown(0.5);

      if (
        generalInfo.complianceWithGoodPracticeInSolidAndHazardousWasteManagement
      ) {
        drawSolidAndHazardousWasteManagementTable(
          doc,
          generalInfo.complianceWithGoodPracticeInSolidAndHazardousWasteManagement,
        );
      }

      addFooter(doc);
      doc.end();

      return await pdfPromise;
    } catch (error) {
      doc.end();
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  // Draw a single grouped fund status section with one merged label column
  // Label: 'RCF/ MTF and FMRDF Status'
  // For each group: a merged title row spanning all data columns, followed by a header row, then the group's data rows.
  private drawFundStatusSection(
    doc: PDFKit.PDFDocument,
    groups: Array<{
      title: string;
      rows: [string, string, string, string][];
    }>,
    connectPrevious?: boolean,
    suppressBottomSpacing?: boolean,
  ) {
    if (!groups || groups.length === 0) return;

    const left = doc.page.margins.left || 50;
    const right = doc.page.width - (doc.page.margins.right || 50);
    const tableWidth = right - left;

    // Label + colon widths
    const labelColWidth = 70;
    const colonColWidth = 15;
    const dataTableWidth = tableWidth - labelColWidth - colonColWidth;
    const dataLeft = left + labelColWidth + colonColWidth;

    // Data column widths (percentages of the data area)
    const pctWidths = [0.3, 0.3, 0.2, 0.2];
    const colWidths = pctWidths.map((p) => dataTableWidth * p);

    const rowMinHeight = 14;
    const topMargin = doc.page.margins.top || 50;
    const bottomLimit = doc.page.height - (doc.page.margins.bottom || 50) - 30;

    // Connection logic with previous section
    const connectPrevHere = !!(connectPrevious && doc.y > topMargin + 2);
    let shouldDrawSectionTop = !connectPrevHere;

    // Helper to compute X position of a column
    const getColX = (colIndex: number): number =>
      dataLeft + colWidths.slice(0, colIndex).reduce((s, w) => s + w, 0);

    // Helper to draw the label + colon columns for the section spanning from startY to startY+height
    const drawLabelSection = (
      startY: number,
      height: number,
      drawTop: boolean,
      drawBottom: boolean,
    ) => {
      // Left outer vertical edge
      doc.strokeColor('#000000').lineWidth(0.5);
      doc
        .moveTo(left, startY)
        .lineTo(left, startY + height)
        .stroke();

      // Top border for the entire section (optional if connected)
      if (drawTop) {
        doc
          .moveTo(left, startY)
          .lineTo(left + tableWidth, startY)
          .stroke();
      }

      // Bottom border handling:
      // - If drawBottom=true: draw full width (this is the final segment)
      // - If drawBottom=false: draw only under label+colon area (page break, data continues)
      if (drawBottom) {
        // Final segment - draw full width bottom border
        doc
          .moveTo(left, startY + height)
          .lineTo(left + tableWidth, startY + height)
          .stroke();
      } else {
        // Intermediate segment - draw bottom border only under label+colon columns
        const colonRight = left + labelColWidth + colonColWidth;
        doc
          .moveTo(left, startY + height)
          .lineTo(colonRight, startY + height)
          .stroke();
      }

      // Divider between label and colon
      const colonLeft = left + labelColWidth;
      doc
        .moveTo(colonLeft, startY)
        .lineTo(colonLeft, startY + height)
        .stroke();

      // Label text vertically centered
      const labelY = startY + height / 2 - 5;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('RCF/ MTF and FMRDF Status'.toUpperCase(), left + 5, labelY, {
          width: labelColWidth - 10,
          align: 'center',
        });

      // Colon centered
      const colonY = startY + height / 2 - 5;
      doc.font('Helvetica-Bold').fontSize(11).text(':', colonLeft, colonY, {
        width: colonColWidth,
        align: 'center',
      });
    };

    // Measure a fixed header height for the per-group table headers
    const headerTitles = [
      'Name of Permit\nHolder',
      'Savings Account\nNumber',
      'Amount Deposited\n(Php)',
      'Date Updated',
    ];
    doc.font('Helvetica-Bold').fontSize(11);
    const headerTextHeights = headerTitles.map((h, idx) =>
      doc.heightOfString(h, { width: colWidths[idx] - 10, align: 'center' }),
    );
    const headerPadding = 10;
    const headerHeight = Math.max(25, ...headerTextHeights) + headerPadding;

    // Iterate through groups and render
    let y = doc.y;
    let sectionStartY = y;
    let sectionHeight = 0;
    let needsDataTopBorder = false; // Track if we need to draw top border for data area

    for (const group of groups) {
      // 1) Group merged title row
      doc.font('Helvetica-Bold').fontSize(11);
      const groupTitleHeight =
        Math.max(
          rowMinHeight,
          doc.heightOfString(group.title, {
            width: dataTableWidth - 10,
            align: 'center',
          }),
        ) + 6; // small vertical padding

      if (y + groupTitleHeight > bottomLimit) {
        // Finish current page segment (not the final segment, so no bottom border)
        drawLabelSection(
          sectionStartY,
          sectionHeight,
          shouldDrawSectionTop,
          false,
        );
        shouldDrawSectionTop = true; // draw top on next segment
        doc.addPage();
        y = doc.page.margins.top || 50;
        sectionStartY = y;
        sectionHeight = 0;
        needsDataTopBorder = true; // After page break, data area needs top border
      }

      // Draw merged group title row borders (data area only)
      doc.strokeColor('#000000').lineWidth(0.5);

      // Top border for data area (only if needed - either first group or after page break)
      if (needsDataTopBorder) {
        doc
          .moveTo(dataLeft, y)
          .lineTo(dataLeft + dataTableWidth, y)
          .stroke();
        needsDataTopBorder = false; // Reset flag after drawing
      }

      // Left and right edges of data area
      doc
        .moveTo(dataLeft, y)
        .lineTo(dataLeft, y + groupTitleHeight)
        .stroke();
      doc
        .moveTo(dataLeft + dataTableWidth, y)
        .lineTo(dataLeft + dataTableWidth, y + groupTitleHeight)
        .stroke();
      // Bottom line
      doc
        .moveTo(dataLeft, y + groupTitleHeight)
        .lineTo(dataLeft + dataTableWidth, y + groupTitleHeight)
        .stroke();

      // Group title text
      const titleTextY =
        y +
        (groupTitleHeight -
          doc.heightOfString(group.title, {
            width: dataTableWidth - 10,
            align: 'center',
          })) /
          2;
      doc.text(group.title, dataLeft + 5, titleTextY, {
        width: dataTableWidth - 10,
        align: 'center',
      });
      y += groupTitleHeight;
      sectionHeight += groupTitleHeight;

      // 2) Group header row
      if (y + headerHeight > bottomLimit) {
        drawLabelSection(
          sectionStartY,
          sectionHeight,
          shouldDrawSectionTop,
          false,
        );
        shouldDrawSectionTop = true;
        doc.addPage();
        y = doc.page.margins.top || 50;
        sectionStartY = y;
        sectionHeight = 0;
        needsDataTopBorder = true; // After page break, data area needs top border
      }

      // Header borders
      // Top border for data area (only if needed - after page break)
      if (needsDataTopBorder) {
        doc
          .moveTo(dataLeft, y)
          .lineTo(dataLeft + dataTableWidth, y)
          .stroke();
        needsDataTopBorder = false;
      }

      // Outer edges
      doc
        .moveTo(dataLeft, y)
        .lineTo(dataLeft, y + headerHeight)
        .stroke();
      doc
        .moveTo(dataLeft + dataTableWidth, y)
        .lineTo(dataLeft + dataTableWidth, y + headerHeight)
        .stroke();
      // Bottom line
      doc
        .moveTo(dataLeft, y + headerHeight)
        .lineTo(dataLeft + dataTableWidth, y + headerHeight)
        .stroke();
      // Internal column dividers
      for (let i = 1; i < colWidths.length; i++) {
        const colX = getColX(i);
        doc
          .moveTo(colX, y)
          .lineTo(colX, y + headerHeight)
          .stroke();
      }
      // Header texts
      headerTitles.forEach((h, idx) => {
        const colX = getColX(idx);
        const txH = doc.heightOfString(h, {
          width: colWidths[idx] - 10,
          align: 'center',
        });
        const textY = y + (headerHeight - txH) / 2;
        doc.text(h, colX + 5, textY, {
          width: colWidths[idx] - 10,
          align: 'center',
        });
      });
      y += headerHeight;
      sectionHeight += headerHeight;

      // 3) Rows for this group
      doc.font('Helvetica').fontSize(11);
      for (const r of group.rows) {
        const cellHeights = r.map((txt, idx) =>
          doc.heightOfString(txt, {
            width: colWidths[idx] - 10,
            align: 'center',
          }),
        );
        const rowHeight = Math.max(rowMinHeight, ...cellHeights) + 3;

        if (y + rowHeight > bottomLimit) {
          drawLabelSection(
            sectionStartY,
            sectionHeight,
            shouldDrawSectionTop,
            false,
          );
          shouldDrawSectionTop = true;
          doc.addPage();
          y = doc.page.margins.top || 50;
          sectionStartY = y;
          sectionHeight = 0;
          needsDataTopBorder = true; // After page break, data area needs top border
          // Reset font for row rendering; drawLabelSection sets bold
          doc.font('Helvetica').fontSize(11);
        }

        // Row borders
        // Top border for data area (only if needed - after page break)
        if (needsDataTopBorder) {
          doc
            .moveTo(dataLeft, y)
            .lineTo(dataLeft + dataTableWidth, y)
            .stroke();
          needsDataTopBorder = false;
        }

        doc
          .moveTo(dataLeft, y)
          .lineTo(dataLeft, y + rowHeight)
          .stroke();
        doc
          .moveTo(dataLeft + dataTableWidth, y)
          .lineTo(dataLeft + dataTableWidth, y + rowHeight)
          .stroke();
        for (let i = 1; i < colWidths.length; i++) {
          const colX = getColX(i);
          doc
            .moveTo(colX, y)
            .lineTo(colX, y + rowHeight)
            .stroke();
        }
        doc
          .moveTo(dataLeft, y + rowHeight)
          .lineTo(dataLeft + dataTableWidth, y + rowHeight)
          .stroke();

        // Row texts
        r.forEach((txt, idx) => {
          const colX = getColX(idx);
          const txH = doc.heightOfString(txt, {
            width: colWidths[idx] - 10,
            align: 'center',
          });
          const textY = y + (rowHeight - txH) / 2;
          doc.text(txt, colX + 5, textY, {
            width: colWidths[idx] - 10,
            align: 'center',
          });
        });

        y += rowHeight;
        sectionHeight += rowHeight;
      }
    }

    // Draw final label section for the last page segment (with bottom border)
    drawLabelSection(sectionStartY, sectionHeight, shouldDrawSectionTop, true);

    // Move cursor and spacing
    doc.y = y;
    if (!suppressBottomSpacing) {
      doc.moveDown(0.5);
    }
  }
}
