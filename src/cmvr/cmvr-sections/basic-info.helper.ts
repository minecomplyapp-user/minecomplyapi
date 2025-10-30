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
import { createFundTable, createTableBorders, createText, createParagraph,createKeyValueTable } from './general-use.helper';

export function createGeneralInfoKeyValues(
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


  
  export function  createECCTable(
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
            children: [createParagraph('ECC', true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: eccList.length + 1, // +1 for header row
            width: { size: 15, type: WidthType.PERCENTAGE },
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
            children: [
              createParagraph('ECC Number', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(
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
              children: [createParagraph(ecc.permitHolderName || 'N/A')],
            }),
            new TableCell({
              children: [createParagraph(ecc.eccNumber || 'N/A')],
            }),
            new TableCell({
              children: [createParagraph(ecc.dateOfIssuance || 'N/A')],
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
        children: [
          new TableCell({
            children: [
              createParagraph('ISAG/MPP', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: isagList.length + 1,
            width: { size: 15, type: WidthType.PERCENTAGE },
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
              createParagraph(
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
              createParagraph(
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
              children: [createParagraph(isag.permitHolderName || 'N/A')],
            }),
            new TableCell({
              children: [createParagraph(isag.isagPermitNumber || 'N/A')],
            }),
            new TableCell({
              children: [createParagraph(isag.dateOfIssuance || 'N/A')],
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

    // Header row
    rows.push(
      new TableRow({
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
              createParagraph(
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
              children: [createParagraph(epep.permitHolderName || 'N/A')],
            }),
            new TableCell({
              children: [createParagraph(epep.epepNumber || 'N/A')],
            }),
            new TableCell({
              children: [createParagraph(epep.dateOfApproval || 'N/A')],
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

    // Rehabilitation Cash Fund
    if (
      generalInfo.rehabilitationCashFund &&
      generalInfo.rehabilitationCashFund.length > 0
    ) {
      elements.push(
        new Paragraph({ text: '', spacing: { after: 100 } }), // Spacing
      );
      elements.push(
        createFundTable(
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
        createFundTable(
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
        createFundTable(
          'FINAL MINE REHABILITATION AND DECOMMISSIONING FUND',
          generalInfo.finalMineRehabilitationAndDecommissioningFund,
        ),
      );
    }

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


