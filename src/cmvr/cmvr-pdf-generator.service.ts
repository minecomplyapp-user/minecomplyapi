import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

// Shape for the normalized generalInfo JSON we agreed on
export interface CMVRGeneralInfo {
  companyName?: string;
  location?: {
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
  projectGeographicalCoordinates?: { x?: number; y?: number };
  proponent?: {
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
      this.addHeader(doc, generalInfo);

      this.addGeneralInfoKeyValues(doc, generalInfo);

      const leftMargin = doc.page.margins.left || 50;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`I. BASIC INFORMATION`, leftMargin, doc.y, { align: 'left' });

      // ECC table with merged label column
      const hasECC = !!(generalInfo.ecc && generalInfo.ecc.length > 0);
      const hasISAG = !!(generalInfo.isagMpp && generalInfo.isagMpp.length > 0);
      if (hasECC) {
        const eccList = generalInfo.ecc ?? [];
        doc.moveDown(0.5);
        this.drawTable(doc, {
          labelColumn: 'ECC',
          headers: ['Name of Permit Holder', 'ECC Number', 'Date of Issuance'],
          columnWidths: [0.4, 0.25, 0.35], // 40% for name, 25% for ECC number, 35% for date
          rows: this.toECCRows(eccList),
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
        this.drawTable(doc, {
          labelColumn: 'ISAG/MPP',
          headers: [
            'Name of Permit Holder',
            'ISAG Permit Number',
            'Date of Issuance',
          ],
          // Match ECC column widths
          columnWidths: [0.4, 0.25, 0.35],
          connectPrevious: hasECC,
          rows: this.toISAGRows(isagList),
        });
      }

      // EPEP table with merged label column
      if (generalInfo.epep && generalInfo.epep.length > 0) {
        doc.moveDown(0.5);
        this.drawTable(doc, {
          labelColumn: 'EPEP',
          headers: ['Name of Permit Holder', 'EPEP Number', 'Date of Approval'],
          rows: this.toEPEPRows(generalInfo.epep),
        });
      }

      this.addFooter(doc);
      doc.end();

      return await pdfPromise;
    } catch (error) {
      doc.end();
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  private addHeader(doc: PDFKit.PDFDocument, generalInfo: CMVRGeneralInfo) {
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('COMPLIANCE MONITORING VERIFICATION REPORT', { align: 'center' })
      .moveDown(0.3);
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('GENERAL INFORMATION', { align: 'center' })
      .moveDown(1);

    if (generalInfo.companyName) {
      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Company: ${generalInfo.companyName}`, { align: 'center' })
        .moveDown(0.5);
    }
  }

  private addGeneralInfoKeyValues(
    doc: PDFKit.PDFDocument,
    gi: CMVRGeneralInfo,
  ) {
    // We'll render two tables:
    // 1) A headered key/value table for general fields
    // 2) A no-header key/value table for the three compliance date fields

    const summaryRows: Array<[string, string]> = [];
    const complianceRows: Array<[string, string]> = [];

    summaryRows.push(['Quarter', gi.quarter ? String(gi.quarter) : '-']);
    summaryRows.push(['Year', gi.year ? String(gi.year) : '-']);

    if (gi.location) {
      const lat = gi.location.latitude ?? '-';
      const lng = gi.location.longitude ?? '-';
      summaryRows.push(['Location (Latitude, Longitude)', `${lat}, ${lng}`]);
    }

    if (gi.dateOfComplianceMonitoringAndValidation) {
      complianceRows.push([
        'Date of Compliance Monitoring and Validation',
        this.formatDate(gi.dateOfComplianceMonitoringAndValidation),
      ]);
    }
    if (gi.monitoringPeriodCovered) {
      complianceRows.push([
        'Monitoring Period Covered',
        this.formatMaybeDateOrRange(gi.monitoringPeriodCovered),
      ]);
    }
    if (gi.dateOfCmrSubmission) {
      complianceRows.push([
        'Date of CMR Submission',
        this.formatDate(gi.dateOfCmrSubmission),
      ]);
    }

    if (gi.projectCurrentName) {
      summaryRows.push(['Project Current Name', gi.projectCurrentName]);
    }
    if (gi.projectNameInEcc) {
      summaryRows.push(['Project Name in the ECC', gi.projectNameInEcc]);
    }
    if (gi.projectStatus) {
      summaryRows.push(['Project Status', gi.projectStatus]);
    }
    if (gi.projectGeographicalCoordinates) {
      const x = gi.projectGeographicalCoordinates.x ?? '-';
      const y = gi.projectGeographicalCoordinates.y ?? '-';
      summaryRows.push([
        'Project Geographical Coordinates (x, y)',
        `${x}, ${y}`,
      ]);
    }

    if (gi.proponent) {
      if (gi.proponent.contactPersonAndPosition) {
        summaryRows.push([
          'Proponent Contact Person & Position',
          gi.proponent.contactPersonAndPosition,
        ]);
      }
      if (gi.proponent.mailingAddress) {
        summaryRows.push([
          'Proponent Mailing Address',
          gi.proponent.mailingAddress,
        ]);
      }
      if (gi.proponent.telephoneFax) {
        summaryRows.push([
          'Proponent Telephone No./ Fax No.',
          gi.proponent.telephoneFax,
        ]);
      }
      if (gi.proponent.emailAddress) {
        summaryRows.push([
          'Proponent Email Address',
          gi.proponent.emailAddress,
        ]);
      }
    }

    this.addSectionTitle(doc, 'SUMMARY');
    if (summaryRows.length > 0) {
      this.drawKeyValueTable(doc, summaryRows);
    }
    if (complianceRows.length > 0) {
      // Render the three compliance-related rows as a separate table without a header
      this.drawKeyValueTableNoHeader(doc, complianceRows);
    }
  }

  private addSectionTitle(doc: PDFKit.PDFDocument, title: string) {
    doc.moveDown(0.8);
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(title.toUpperCase())
      .moveDown(0.3);
  }

  // Draw simple two-column key/value table with borders similar to attendance table
  private drawKeyValueTable(
    doc: PDFKit.PDFDocument,
    rows: Array<[string, string]>,
  ) {
    const left = doc.page.margins.left || 50;
    const right = doc.page.width - (doc.page.margins.right || 50);
    const tableWidth = right - left;
    const colWidths = [tableWidth * 0.35, tableWidth * 0.65];
    const headerHeight = 20;
    const rowMinHeight = 14;
    let y = doc.y;

    // Header
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .strokeColor('#000000')
      .lineWidth(0.5)
      .rect(left, y, tableWidth, headerHeight)
      .stroke();

    // Column divider
    doc
      .moveTo(left + colWidths[0], y)
      .lineTo(left + colWidths[0], y + headerHeight)
      .stroke();

    // Header labels
    doc.text('FIELD', left + 5, y + 5, {
      width: colWidths[0] - 10,
      align: 'center',
    });
    doc.text('VALUE', left + colWidths[0] + 5, y + 5, {
      width: colWidths[1] - 10,
      align: 'center',
    });
    y += headerHeight;

    doc.font('Helvetica').fontSize(11);

    for (const [key, value] of rows) {
      const textHeightLeft = doc.heightOfString(key, {
        width: colWidths[0] - 10,
        align: 'left',
      });
      const textHeightRight = doc.heightOfString(value, {
        width: colWidths[1] - 10,
        align: 'left',
      });
      const rowHeight =
        Math.max(rowMinHeight, textHeightLeft, textHeightRight) + 3; // padding

      // Page break if needed
      const bottomLimit =
        doc.page.height - (doc.page.margins.bottom || 50) - 30;
      if (y + rowHeight > bottomLimit) {
        doc.addPage();
        y = doc.page.margins.top || 50;
        // redraw header on new page
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .strokeColor('#000000')
          .lineWidth(0.5)
          .rect(left, y, tableWidth, headerHeight)
          .stroke();
        doc
          .moveTo(left + colWidths[0], y)
          .lineTo(left + colWidths[0], y + headerHeight)
          .stroke();
        doc.text('FIELD', left + 5, y + 5, {
          width: colWidths[0] - 10,
          align: 'center',
        });
        doc.text('VALUE', left + colWidths[0] + 5, y + 5, {
          width: colWidths[1] - 10,
          align: 'center',
        });
        y += headerHeight;
        doc.font('Helvetica').fontSize(11);
      }

      // Row borders (no double lines): draw left/right edges and the bottom line only
      doc.strokeColor('#000000').lineWidth(0.5);
      // Left outer edge
      doc
        .moveTo(left, y)
        .lineTo(left, y + rowHeight)
        .stroke();
      // Right outer edge
      doc
        .moveTo(left + tableWidth, y)
        .lineTo(left + tableWidth, y + rowHeight)
        .stroke();
      // Column divider
      doc
        .moveTo(left + colWidths[0], y)
        .lineTo(left + colWidths[0], y + rowHeight)
        .stroke();
      // Bottom horizontal line
      doc
        .moveTo(left, y + rowHeight)
        .lineTo(left + tableWidth, y + rowHeight)
        .stroke();

      // Cell text
      doc.font('Helvetica-Bold').text(key.toUpperCase(), left + 5, y + 4, {
        width: colWidths[0] - 10,
        align: 'left',
      });
      doc.font('Helvetica').text(value, left + colWidths[0] + 5, y + 4, {
        width: colWidths[1] - 10,
        align: 'left',
      });

      y += rowHeight;
    }
    doc.moveDown(1);
  }

  // Draw a two-column key/value table WITHOUT a header row
  private drawKeyValueTableNoHeader(
    doc: PDFKit.PDFDocument,
    rows: Array<[string, string]>,
  ) {
    if (!rows || rows.length === 0) return;

    const left = doc.page.margins.left || 50;
    const right = doc.page.width - (doc.page.margins.right || 50);
    const tableWidth = right - left;
    const colWidths = [tableWidth * 0.5, tableWidth * 0.5];
    const rowMinHeight = 14;
    let y = doc.y;

    doc.font('Helvetica').fontSize(11).strokeColor('#000000').lineWidth(0.5);

    // Draw the top border of the table (since there's no header)
    doc
      .moveTo(left, y)
      .lineTo(left + tableWidth, y)
      .stroke();

    for (const [key, value] of rows) {
      const textHeightLeft = doc.heightOfString(key, {
        width: colWidths[0] - 10,
        align: 'center',
      });
      const textHeightRight = doc.heightOfString(value, {
        width: colWidths[1] - 10,
        align: 'center',
      });
      const rowHeight =
        Math.max(rowMinHeight, textHeightLeft, textHeightRight) + 3; // padding

      // Page break if needed
      const bottomLimit =
        doc.page.height - (doc.page.margins.bottom || 50) - 30;
      if (y + rowHeight > bottomLimit) {
        doc.addPage();
        y = doc.page.margins.top || 50;
        // draw top border for the new page segment
        doc
          .moveTo(left, y)
          .lineTo(left + tableWidth, y)
          .stroke();
      }

      // Row borders: left/right edges, internal divider, bottom line
      // Left outer edge
      doc
        .moveTo(left, y)
        .lineTo(left, y + rowHeight)
        .stroke();
      // Right outer edge
      doc
        .moveTo(left + tableWidth, y)
        .lineTo(left + tableWidth, y + rowHeight)
        .stroke();
      // Column divider
      doc
        .moveTo(left + colWidths[0], y)
        .lineTo(left + colWidths[0], y + rowHeight)
        .stroke();
      // Bottom horizontal line
      doc
        .moveTo(left, y + rowHeight)
        .lineTo(left + tableWidth, y + rowHeight)
        .stroke();

      // Cell text (centered vertically)
      const keyTextHeight = doc.heightOfString(key, {
        width: colWidths[0] - 10,
        align: 'center',
      });
      const valueTextHeight = doc.heightOfString(value, {
        width: colWidths[1] - 10,
        align: 'center',
      });
      const keyTextY = y + (rowHeight - keyTextHeight) / 2;
      const valueTextY = y + (rowHeight - valueTextHeight) / 2;

      doc.font('Helvetica').text(key, left + 5, keyTextY, {
        width: colWidths[0] - 10,
        align: 'center',
      });
      doc
        .font('Helvetica-Bold')
        .text(value, left + colWidths[0] + 5, valueTextY, {
          width: colWidths[1] - 10,
          align: 'center',
        });

      y += rowHeight;
    }
    doc.moveDown(1);
  }

  private drawTable(
    doc: PDFKit.PDFDocument,
    opts: {
      headers: string[];
      rows: string[][];
      labelColumn?: string;
      columnWidths?: number[]; // Optional: array of percentages (0-1) for each column
      connectPrevious?: boolean; // If true, visually connect this table to the previous one on the same page
      suppressBottomSpacing?: boolean; // If true, don't add extra spacing after the table
    },
  ) {
    const left = doc.page.margins.left || 50;
    const right = doc.page.width - (doc.page.margins.right || 50);
    const tableWidth = right - left;

    // If labelColumn is provided, reserve space for label column + colon column on the left
    const labelColWidth = opts.labelColumn ? 70 : 0;
    const colonColWidth = opts.labelColumn ? 15 : 0;
    const dataTableWidth = tableWidth - labelColWidth - colonColWidth;

    // Calculate column widths - either custom or equal distribution
    let colWidths: number[];
    if (opts.columnWidths && opts.columnWidths.length === opts.headers.length) {
      // Use custom widths (percentages that should sum to 1.0)
      colWidths = opts.columnWidths.map((pct) => dataTableWidth * pct);
    } else {
      // Equal distribution
      const colWidth = dataTableWidth / opts.headers.length;
      colWidths = Array(opts.headers.length).fill(colWidth) as number[];
    }

    // Compute dynamic header height based on header text wrapping
    const rowMinHeight = 14;
    // Ensure header font is set before measuring
    doc.font('Helvetica-Bold').fontSize(11);
    const headerTextHeights = opts.headers.map((h, idx) =>
      doc.heightOfString(h, {
        width: colWidths[idx] - 10,
        align: 'center',
      }),
    );
    const headerPadding = 10; // vertical padding within header
    const headerHeight = Math.max(25, ...headerTextHeights) + headerPadding;
    let y = doc.y;

    // Pre-calculate all row heights (use center align to match final rendering)
    const rowHeights: number[] = [];
    for (const row of opts.rows) {
      const heights = row.map((txt, idx) =>
        doc.heightOfString(txt, {
          width: colWidths[idx] - 10,
          align: 'center',
        }),
      );
      rowHeights.push(Math.max(rowMinHeight, ...heights) + 3);
    }

    // Determine if we should actually connect on this page (only if not at top of a new page)
    const topMargin = doc.page.margins.top || 50;
    const connectPrevHere = !!(opts.connectPrevious && doc.y > topMargin + 2);
    // Track whether to draw the section's top line (skip if connected to previous on same page)
    let shouldDrawSectionTop = !connectPrevHere;

    // Helper function to draw label and colon columns for a section
    const drawLabelSection = (
      startY: number,
      sectionHeight: number,
      drawTop: boolean,
    ) => {
      if (!opts.labelColumn) return;

      // Draw label column vertical edge (left outer edge)
      doc.strokeColor('#000000').lineWidth(0.5);
      doc
        .moveTo(left, startY)
        .lineTo(left, startY + sectionHeight)
        .stroke();

      // Draw top horizontal line spanning label + colon + data for this section (optional)
      if (drawTop) {
        doc
          .moveTo(left, startY)
          .lineTo(left + tableWidth, startY)
          .stroke();
      }
      doc
        .moveTo(left, startY + sectionHeight)
        .lineTo(left + tableWidth, startY + sectionHeight)
        .stroke();

      // Vertically center the label text
      const labelY = startY + sectionHeight / 2 - 5;
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(opts.labelColumn.toUpperCase(), left + 5, labelY, {
          width: labelColWidth - 10,
          align: 'center',
        });

      // Draw colon column: only the divider between label and colon (no right edge to avoid double with dataLeft)
      const colonLeft = left + labelColWidth;
      doc
        .moveTo(colonLeft, startY)
        .lineTo(colonLeft, startY + sectionHeight)
        .stroke();

      // Vertically center the colon
      const colonY = startY + sectionHeight / 2 - 5;
      doc.font('Helvetica-Bold').fontSize(12).text(':', colonLeft, colonY, {
        width: colonColWidth,
        align: 'center',
      });
    };

    // Offset data columns to the right if label column exists
    const dataLeft = left + labelColWidth + colonColWidth;

    // Helper to get X position for a column (cumulative width up to that column)
    const getColX = (colIndex: number): number => {
      return (
        dataLeft + colWidths.slice(0, colIndex).reduce((sum, w) => sum + w, 0)
      );
    };

    // Track section start for merged label column
    let sectionStartY = y;
    let sectionRowsHeight = headerHeight; // Start with header height

    // Header for data columns - draw borders without double lines
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .strokeColor('#000000')
      .lineWidth(0.5);

    // Header outer edges
    doc
      .moveTo(dataLeft, y)
      .lineTo(dataLeft, y + headerHeight)
      .stroke(); // Left
    doc
      .moveTo(dataLeft + dataTableWidth, y)
      .lineTo(dataLeft + dataTableWidth, y + headerHeight)
      .stroke(); // Right
    // Top border is drawn by drawLabelSection to avoid double lines; skip drawing top here
    doc
      .moveTo(dataLeft, y + headerHeight)
      .lineTo(dataLeft + dataTableWidth, y + headerHeight)
      .stroke(); // Bottom

    // Header column dividers
    for (let i = 1; i < opts.headers.length; i++) {
      const colX = getColX(i);
      doc
        .moveTo(colX, y)
        .lineTo(colX, y + headerHeight)
        .stroke();
    }

    opts.headers.forEach((h, idx) => {
      const colX = getColX(idx);
      const textHeight = doc.heightOfString(h, {
        width: colWidths[idx] - 10,
        align: 'center',
      });
      const textY = y + (headerHeight - textHeight) / 2; // vertical center
      doc.text(h, colX + 5, textY, {
        width: colWidths[idx] - 10,
        align: 'center',
      });
    });
    y += headerHeight;
    doc.font('Helvetica').fontSize(11);

    opts.rows.forEach((row, rowIndex) => {
      const rowHeight = rowHeights[rowIndex];

      // Page break if needed
      const bottomLimit =
        doc.page.height - (doc.page.margins.bottom || 50) - 30;
      if (y + rowHeight > bottomLimit) {
        // Draw label section for rows on current page before page break
        drawLabelSection(
          sectionStartY,
          sectionRowsHeight,
          shouldDrawSectionTop,
        );
        // After first segment, always draw top for subsequent segments
        shouldDrawSectionTop = true;

        doc.addPage();
        y = doc.page.margins.top || 50;

        // Reset section tracking for new page
        sectionStartY = y;
        sectionRowsHeight = headerHeight;

        // redraw header
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .strokeColor('#000000')
          .lineWidth(0.5);

        // Header outer edges
        doc
          .moveTo(dataLeft, y)
          .lineTo(dataLeft, y + headerHeight)
          .stroke(); // Left
        doc
          .moveTo(dataLeft + dataTableWidth, y)
          .lineTo(dataLeft + dataTableWidth, y + headerHeight)
          .stroke(); // Right
        // Top border is handled by drawLabelSection later to avoid double lines; skip drawing top here
        doc
          .moveTo(dataLeft, y + headerHeight)
          .lineTo(dataLeft + dataTableWidth, y + headerHeight)
          .stroke(); // Bottom

        // Header column dividers
        for (let i = 1; i < opts.headers.length; i++) {
          const colX = getColX(i);
          doc
            .moveTo(colX, y)
            .lineTo(colX, y + headerHeight)
            .stroke();
        }
        opts.headers.forEach((h, idx) => {
          const colX = getColX(idx);
          const textHeight = doc.heightOfString(h, {
            width: colWidths[idx] - 10,
            align: 'center',
          });
          const textY = y + (headerHeight - textHeight) / 2; // vertical center
          doc.text(h, colX + 5, textY, {
            width: colWidths[idx] - 10,
            align: 'center',
          });
        });
        y += headerHeight;
        doc.font('Helvetica').fontSize(11);
      }

      // Row borders (no double lines): draw left/right edges and the bottom line only
      // Left outer edge
      doc
        .moveTo(dataLeft, y)
        .lineTo(dataLeft, y + rowHeight)
        .stroke();
      // Right outer edge
      doc
        .moveTo(dataLeft + dataTableWidth, y)
        .lineTo(dataLeft + dataTableWidth, y + rowHeight)
        .stroke();
      // Internal column dividers
      for (let i = 1; i < opts.headers.length; i++) {
        const colX = getColX(i);
        doc
          .moveTo(colX, y)
          .lineTo(colX, y + rowHeight)
          .stroke();
      }
      // Bottom horizontal line only under data area (preserve merged label/colon appearance)
      doc
        .moveTo(dataLeft, y + rowHeight)
        .lineTo(dataLeft + dataTableWidth, y + rowHeight)
        .stroke();

      // Row cells (centered horizontally and vertically)
      row.forEach((txt, idx) => {
        const colX = getColX(idx);
        const textHeight = doc.heightOfString(txt, {
          width: colWidths[idx] - 10,
          align: 'center',
        });
        const textY = y + (rowHeight - textHeight) / 2; // vertical center
        doc.text(txt, colX + 5, textY, {
          width: colWidths[idx] - 10,
          align: 'center',
        });
      });

      y += rowHeight;
      sectionRowsHeight += rowHeight; // Accumulate height for label section
    });

    // Draw final label section for last page
    drawLabelSection(sectionStartY, sectionRowsHeight, shouldDrawSectionTop);

    // Update document cursor position to end of table
    doc.y = y;
    if (!opts.suppressBottomSpacing) {
      doc.moveDown(0.5);
    }
  }

  private addFooter(doc: PDFKit.PDFDocument) {
    const text = 'Generated by MineComply';
    const y = doc.page.height - (doc.page.margins.bottom || 50) + 20;
    doc
      .font('Helvetica-Oblique')
      .fontSize(8)
      .fillColor('#666666')
      .text(text, doc.page.margins.left || 50, y, {
        width:
          doc.page.width -
          (doc.page.margins.left || 50) -
          (doc.page.margins.right || 50),
        align: 'center',
      })
      .fillColor('#000000');
  }

  // Helpers to map domain rows to display rows (all strings)
  private toECCRows(
    list: NonNullable<CMVRGeneralInfo['ecc']>,
  ): [string, string, string][] {
    return list.map((e) => [
      e.permitHolderName || '-',
      e.eccNumber || '-',
      this.formatDate(e.dateOfIssuance),
    ]);
  }

  private toISAGRows(
    list: NonNullable<CMVRGeneralInfo['isagMpp']>,
  ): [string, string, string][] {
    return list.map((i) => [
      i.permitHolderName || '-',
      i.isagPermitNumber || '-',
      this.formatDate(i.dateOfIssuance),
    ]);
  }

  private toEPEPRows(
    list: NonNullable<CMVRGeneralInfo['epep']>,
  ): [string, string, string][] {
    return list.map((e) => [
      e.permitHolderName || '-',
      e.epepNumber || '-',
      this.formatDate(e.dateOfApproval),
    ]);
  }

  // Format a date-like input into 'Mon. DD, YYYY' e.g., 'Sep. 06, 2025'.
  // Returns '-' if empty/undefined, or the original string if unparsable.
  private formatDate(input?: string | Date | null): string {
    if (!input) return '-';
    let d: Date;
    if (input instanceof Date) {
      d = input;
    } else {
      // Accept ISO or human-readable strings
      const parsed = new Date(input);
      if (isNaN(parsed.getTime())) {
        // Not a parseable date; return as-is
        return String(input);
      }
      d = parsed;
    }
    const months = [
      'Jan.',
      'Feb.',
      'Mar.',
      'Apr.',
      'May',
      'Jun.',
      'Jul.',
      'Aug.',
      'Sep.',
      'Oct.',
      'Nov.',
      'Dec.',
    ];
    const mon = months[d.getMonth()];
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${mon} ${day}, ${year}`;
  }

  // Attempt to format a single date or a simple date range string.
  // Examples accepted: '2025-09-01 to 2025-09-05', '2025-09-01 - 2025-09-05'.
  private formatMaybeDateOrRange(input?: string | null): string {
    if (!input) return '-';
    const raw = String(input).trim();
    // Try splitting by common range delimiters: 'to', '-', en dash, em dash
    // Only treat as range when delimiter is surrounded by spaces (avoids hyphens inside ISO dates)
    const rangeDelimiter = /\s+(?:to|[-–—])\s+/;
    const parts = raw.split(rangeDelimiter);
    if (parts.length === 2 && parts[0] && parts[1]) {
      const startDate = this.parseFlexibleDate(parts[0]);
      const endDate = this.parseFlexibleDate(parts[1], startDate || undefined);
      if (startDate && endDate) {
        return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
      }
      // Fallback to individual formatting if parsing failed
      return `${this.formatDate(parts[0])} - ${this.formatDate(parts[1])}`;
    }
    // Not a range; format as a single date
    return this.formatDate(raw);
  }

  // Parse a date string flexibly, inferring missing month/year from fallback when possible.
  private parseFlexibleDate(input: string, fallback?: Date): Date | null {
    const s = input.trim();
    // 1) Native Date parse
    const direct = new Date(s);
    if (!isNaN(direct.getTime())) return direct;

    // 2) ISO-like: YYYY-MM-DD or YYYY/MM/DD
    let m = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    if (m) {
      const y = parseInt(m[1], 10);
      const mo = parseInt(m[2], 10) - 1;
      const d = parseInt(m[3], 10);
      const dt = new Date(y, mo, d);
      return isNaN(dt.getTime()) ? null : dt;
    }

    // 3) US-like: MM/DD/YYYY or MM-DD-YYYY
    m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (m) {
      const mo = parseInt(m[1], 10) - 1;
      const d = parseInt(m[2], 10);
      const y = parseInt(m[3], 10);
      const dt = new Date(y, mo, d);
      return isNaN(dt.getTime()) ? null : dt;
    }

    // 4) MonthName DD, YYYY
    m = s.match(
      /^(January|February|March|April|May|June|July|August|September|October|November|December|Jan\.?|Feb\.?|Mar\.?|Apr\.?|Jun\.?|Jul\.?|Aug\.?|Sep\.?|Oct\.?|Nov\.?|Dec\.?)\s+(\d{1,2}),\s*(\d{4})$/i,
    );
    if (m) {
      const mo = this.monthNameToIndex(m[1]);
      const d = parseInt(m[2], 10);
      const y = parseInt(m[3], 10);
      const dt = new Date(y, mo, d);
      return isNaN(dt.getTime()) ? null : dt;
    }

    // 5) MonthName DD (infer year from fallback)
    m = s.match(
      /^(January|February|March|April|May|June|July|August|September|October|November|December|Jan\.?|Feb\.?|Mar\.?|Apr\.?|Jun\.?|Jul\.?|Aug\.?|Sep\.?|Oct\.?|Nov\.?|Dec\.?)\s+(\d{1,2})$/i,
    );
    if (m && fallback) {
      const mo = this.monthNameToIndex(m[1]);
      const d = parseInt(m[2], 10);
      const y = fallback.getFullYear();
      const dt = new Date(y, mo, d);
      return isNaN(dt.getTime()) ? null : dt;
    }

    // 6) DD, YYYY (infer month from fallback)
    m = s.match(/^(\d{1,2}),\s*(\d{4})$/);
    if (m && fallback) {
      const d = parseInt(m[1], 10);
      const y = parseInt(m[2], 10);
      const mo = fallback.getMonth();
      const dt = new Date(y, mo, d);
      return isNaN(dt.getTime()) ? null : dt;
    }

    // 7) DD (infer month and year from fallback)
    m = s.match(/^(\d{1,2})$/);
    if (m && fallback) {
      const d = parseInt(m[1], 10);
      const mo = fallback.getMonth();
      const y = fallback.getFullYear();
      const dt = new Date(y, mo, d);
      return isNaN(dt.getTime()) ? null : dt;
    }

    return null;
  }

  private monthNameToIndex(name: string): number {
    const map: Record<string, number> = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11,
      'jan.': 0,
      jan: 0,
      'feb.': 1,
      feb: 1,
      'mar.': 2,
      mar: 2,
      'apr.': 3,
      apr: 3,
      jun: 5,
      'jun.': 5,
      jul: 6,
      'jul.': 6,
      'aug.': 7,
      aug: 7,
      'sep.': 8,
      sep: 8,
      'oct.': 9,
      oct: 9,
      'nov.': 10,
      nov: 10,
      'dec.': 11,
      dec: 11,
    };
    return map[name.toLowerCase()] ?? 0;
  }
}
