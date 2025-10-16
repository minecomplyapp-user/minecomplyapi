import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { AttendanceRecord } from '@prisma/client';
import { AttendeeDto } from './dto';
import axios from 'axios';

interface TableColumn {
  header: string;
  key: keyof AttendeeDto;
  width: number;
}

@Injectable()
export class PdfGeneratorService {
  /**
   * Generate a PDF buffer from attendance record data
   */
  async generateAttendancePdf(
    attendanceRecord: AttendanceRecord,
  ): Promise<Buffer> {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true,
    });

    const chunks: Buffer[] = [];

    // Set up promise to collect PDF data
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (error: Error) => reject(error));
    });

    try {
      // Add header
      this.addHeader(doc, attendanceRecord);

      // Add meeting information
      this.addMeetingInfo(doc, attendanceRecord);

      // Add attendees table (now async to support image fetching)
      await this.addAttendeesTable(doc, attendanceRecord.attendees);

      // Add footer
      this.addFooter(doc);

      doc.end();

      return await pdfPromise;
    } catch (error) {
      doc.end();
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Add header to the PDF
   */
  private addHeader(doc: PDFKit.PDFDocument, record: AttendanceRecord) {
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('ATTENDANCE RECORD', { align: 'center' })
      .moveDown(0.5);

    if (record.title) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(record.title, { align: 'center' })
        .moveDown(1);
    } else {
      doc.moveDown(1);
    }
  }

  /**
   * Add meeting information section
   */
  private addMeetingInfo(doc: PDFKit.PDFDocument, record: AttendanceRecord) {
    doc.fontSize(11).font('Helvetica');

    // Meeting Date
    if (record.meetingDate) {
      doc
        .font('Helvetica-Bold')
        .text('Meeting Date: ', { continued: true })
        .font('Helvetica')
        .text(
          new Date(record.meetingDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        );
    }

    // Location
    if (record.location) {
      doc
        .font('Helvetica-Bold')
        .text('Location: ', { continued: true })
        .font('Helvetica')
        .text(record.location);
    }

    // Description
    if (record.description) {
      doc
        .font('Helvetica-Bold')
        .text('Description: ', { continued: true })
        .font('Helvetica')
        .text(record.description);
    }

    doc.moveDown(1.5);
  }

  /**
   * Add attendees table to the PDF
   */
  private async addAttendeesTable(doc: PDFKit.PDFDocument, attendeesJson: any) {
    const attendees: AttendeeDto[] = Array.isArray(attendeesJson)
      ? (attendeesJson as AttendeeDto[])
      : [];

    if (attendees.length === 0) {
      doc
        .fontSize(10)
        .font('Helvetica-Oblique')
        .text('No attendees recorded.', { align: 'center' });
      return;
    }

    // Define table columns
    const columns: TableColumn[] = [
      { header: 'Name', key: 'name', width: 145 }, // Merged No. + Name column
      { header: 'Agency/Office', key: 'agency', width: 150 },
      { header: 'Position', key: 'position', width: 70 },
      { header: 'Status', key: 'attendanceStatus', width: 70 },
      { header: 'Signature', key: 'signatureUrl', width: 75 },
    ];

    const headerHeight = 17;
    const tableTop = doc.y;
    const tableLeft = 50;
    let currentY = tableTop;

    // Draw table header
    this.drawTableHeader(doc, columns, tableLeft, currentY);
    currentY += headerHeight; // Header height (no extra gap)

    // Draw table rows
    for (let index = 0; index < attendees.length; index++) {
      const attendee: AttendeeDto = attendees[index];

      // Calculate the height needed for this row
      const rowHeight = this.calculateRowHeight(
        doc,
        columns,
        attendee,
        index + 1,
      );

      // Check if we need a new page
      // Reserve space for footer (bottom margin + footer height + extra padding)
      const footerSpace = 30; // Space needed for footer text
      const bottomLimit =
        doc.page.height - (doc.page.margins.bottom || 50) - footerSpace;
      if (currentY + rowHeight > bottomLimit) {
        doc.addPage();
        currentY = doc.page.margins.top || 50;
        this.drawTableHeader(doc, columns, tableLeft, currentY);
        currentY += headerHeight; // Header height (no extra gap)
      }

      await this.drawTableRow(
        doc,
        columns,
        attendee,
        index + 1,
        tableLeft,
        currentY,
        rowHeight,
      );
      currentY += rowHeight;
    }

    // Draw bottom border
    doc
      .strokeColor('#000000')
      .lineWidth(0.5)
      .moveTo(tableLeft, currentY)
      .lineTo(tableLeft + this.getTableWidth(columns), currentY)
      .stroke();
  }

  /**
   * Draw table header
   */
  private drawTableHeader(
    doc: PDFKit.PDFDocument,
    columns: TableColumn[],
    x: number,
    y: number,
  ) {
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');

    const tableWidth = this.getTableWidth(columns);

    // Draw outer border of header
    doc
      .strokeColor('#000000')
      .lineWidth(0.5)
      .rect(x, y, tableWidth, 17)
      .stroke();

    // Draw vertical lines between columns
    let currentX = x;
    for (let i = 0; i < columns.length - 1; i++) {
      currentX += columns[i].width;
      doc
        .moveTo(currentX, y)
        .lineTo(currentX, y + 17)
        .stroke();
    }

    // Draw header text (ALL CAPS)
    currentX = x;
    columns.forEach((column) => {
      doc.text(column.header.toUpperCase(), currentX + 5, y + 5, {
        width: column.width - 10,
        align: 'center',
      });
      currentX += column.width;
    });
  }

  /**
   * Draw a single table row
   */
  private async drawTableRow(
    doc: PDFKit.PDFDocument,
    columns: TableColumn[],
    attendee: AttendeeDto,
    rowNumber: number,
    x: number,
    y: number,
    rowHeight: number,
  ) {
    doc.fontSize(9).font('Helvetica').fillColor('#000000');

    const tableWidth = this.getTableWidth(columns);

    // Draw left, right, and bottom borders of the row (top is shared with previous row)
    doc.strokeColor('#000000').lineWidth(0.5);

    // Left border
    doc
      .moveTo(x, y)
      .lineTo(x, y + rowHeight)
      .stroke();

    // Right border
    doc
      .moveTo(x + tableWidth, y)
      .lineTo(x + tableWidth, y + rowHeight)
      .stroke();

    // Bottom border
    doc
      .moveTo(x, y + rowHeight)
      .lineTo(x + tableWidth, y + rowHeight)
      .stroke();

    // Draw vertical lines between columns
    let currentX = x;
    for (let i = 0; i < columns.length - 1; i++) {
      currentX += columns[i].width;
      doc
        .moveTo(currentX, y)
        .lineTo(currentX, y + rowHeight)
        .stroke();
    }

    // Draw cell content
    currentX = x; // Reset currentX for content drawing
    doc.fillColor('#000000');

    for (let index = 0; index < columns.length; index++) {
      const column = columns[index];
      let text = '';
      let font = 'Helvetica';
      const fontSize = 9;
      let contentHeight = 0;

      if (index === 0) {
        // Name column
        const name = attendee.name ?? '';
        const parenthesisMatch = name.match(/^(.+?)(\s*\(.+?\)\s*)$/);
        if (parenthesisMatch) {
          const mainName = parenthesisMatch[1].trim();
          const parenthesisPart = parenthesisMatch[2].trim();
          // Calculate content height for vertical centering
          doc.font('Helvetica-Bold').fontSize(fontSize);
          const mainNameHeight = doc.heightOfString(
            `${rowNumber}.  ${mainName.toUpperCase()} `,
            {
              width: column.width - 10,
              align: 'left',
              continued: true,
            },
          );
          doc.font('Helvetica').fontSize(fontSize);
          const parenthesisHeight = doc.heightOfString(parenthesisPart, {
            width: column.width - 10,
            align: 'left',
          });
          const totalHeight = mainNameHeight + parenthesisHeight;
          const verticalOffset = y + (rowHeight - totalHeight) / 2;
          // Draw main name bold/caps, parenthesis normal
          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize)
            .text(
              `${rowNumber}.  ${mainName.toUpperCase()} `,
              currentX + 5,
              verticalOffset,
              {
                width: column.width - 10,
                align: 'left',
                continued: true,
              },
            );
          doc
            .font('Helvetica')
            .fontSize(fontSize)
            .text(parenthesisPart, {
              width: column.width - 10,
              align: 'left',
            });
          doc.font('Helvetica').fontSize(9);
          currentX += column.width;
          continue;
        } else {
          text = `${rowNumber}.  ${name.toUpperCase()}`;
          font = 'Helvetica-Bold';
        }
      } else if (column.key === 'signatureUrl') {
        // Signature image
        const signatureUrl = attendee.signatureUrl;
        if (signatureUrl && signatureUrl.trim() !== '') {
          try {
            const imageBuffer = await this.fetchImageBuffer(signatureUrl);
            if (imageBuffer) {
              const imageHeight = 19;
              const imageY = y + (rowHeight - imageHeight) / 2;
              doc.image(imageBuffer, currentX + 5, imageY, {
                width: column.width - 10,
                height: imageHeight,
                fit: [column.width - 10, imageHeight],
                align: 'center',
              });
            } else {
              const textY = y + (rowHeight - 7) / 2;
              doc.fontSize(7).text('ERROR URL', currentX + 5, textY, {
                width: column.width - 10,
                align: 'center',
              });
              doc.fontSize(9);
            }
          } catch {
            // If image fetch fails, leave cell blank
          }
        }
        currentX += column.width;
        continue;
      } else {
        // Other columns
        const value = attendee[column.key];
        if (column.key === 'agency') {
          const agency = attendee.agency ?? '';
          const office = attendee.office ?? '';
          if (agency && office) {
            text = `${agency}/${office}`;
          } else if (agency) {
            text = agency;
          } else if (office) {
            text = office;
          } else {
            text = '-';
          }
        } else if (column.key === 'attendanceStatus') {
          text = this.formatAttendanceStatus(value || '').toUpperCase();
          font = 'Helvetica-Bold';
        } else if (column.key === 'position') {
          text = (value || '-').toUpperCase();
        } else {
          text = value || '-';
        }
      }

      // Calculate content height for vertical centering
      doc.font(font).fontSize(fontSize);
      contentHeight = doc.heightOfString(text, {
        width: column.width - 10,
        align: 'center',
      });
      const verticalOffset = y + (rowHeight - contentHeight) / 2;

      // Draw text centered vertically, but name column left-aligned
      doc
        .font(font)
        .fontSize(fontSize)
        .text(text, currentX + 5, verticalOffset, {
          width: column.width - 10,
          align: index === 0 ? 'left' : 'center',
        });

      // Reset font for next cell
      doc.font('Helvetica').fontSize(9);
      currentX += column.width;
    }
  }

  /**
   * Format attendance status for display
   */
  private formatAttendanceStatus(status: string): string {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'IN_PERSON':
        return 'In Person';
      case 'ONLINE':
        return 'Online';
      case 'ABSENT':
        return 'Absent';
      default:
        return status || '-';
    }
  }

  /**
   * Calculate total table width
   */
  private getTableWidth(columns: TableColumn[]): number {
    return columns.reduce((sum, col) => sum + col.width, 0);
  }

  /**
   * Calculate the height needed for text in a cell
   */
  private calculateTextHeight(
    doc: PDFKit.PDFDocument,
    text: string,
    width: number,
    fontSize: number,
    font: string,
  ): number {
    // Save current state
    doc.save();

    doc.font(font).fontSize(fontSize);
    const height = doc.heightOfString(text, {
      width: width,
      align: 'left',
    });

    // Restore state
    doc.restore();

    return height;
  }

  /**
   * Calculate the required row height based on content
   */
  private calculateRowHeight(
    doc: PDFKit.PDFDocument,
    columns: TableColumn[],
    attendee: AttendeeDto,
    rowNumber: number,
  ): number {
    const minHeight = 25; // Minimum row height (fits image + padding)
    const padding = 6; // Top + bottom padding (3px each)
    let maxContentHeight = 0;

    for (let index = 0; index < columns.length; index++) {
      const column = columns[index];
      let contentHeight = 0;

      if (index === 0) {
        // Name column
        const name = attendee.name ?? '';
        const parenthesisMatch = name.match(/^(.+?)(\s*\(.+?\)\s*)$/);

        let textToMeasure = '';
        if (parenthesisMatch) {
          const mainName = parenthesisMatch[1].trim();
          const parenthesisPart = parenthesisMatch[2].trim();
          textToMeasure = `${rowNumber}.  ${mainName.toUpperCase()} ${parenthesisPart}`;
        } else {
          textToMeasure = `${rowNumber}.  ${name.toUpperCase()}`;
        }

        contentHeight = this.calculateTextHeight(
          doc,
          textToMeasure,
          column.width - 10,
          9,
          'Helvetica-Bold',
        );
      } else if (column.key === 'signatureUrl') {
        // Signature image has fixed height
        contentHeight = 19;
      } else {
        // Other text columns
        let text = '';
        const value = attendee[column.key];

        if (column.key === 'agency') {
          const agency = attendee.agency ?? '';
          const office = attendee.office ?? '';
          if (agency && office) {
            text = `${agency}/${office}`;
          } else if (agency) {
            text = agency;
          } else if (office) {
            text = office;
          } else {
            text = '-';
          }
        } else if (column.key === 'attendanceStatus') {
          text = this.formatAttendanceStatus(value || '').toUpperCase();
        } else if (column.key === 'position') {
          text = (value || '-').toUpperCase();
        } else {
          text = value || '-';
        }

        const font =
          column.key === 'attendanceStatus' ? 'Helvetica-Bold' : 'Helvetica';
        contentHeight = this.calculateTextHeight(
          doc,
          text,
          column.width - 10,
          9,
          font,
        );
      }

      maxContentHeight = Math.max(maxContentHeight, contentHeight);
    }

    // Return the max content height + padding, with a minimum
    const rowHeight = Math.max(
      minHeight,
      Math.ceil(maxContentHeight + padding),
    );
    // Debug log for diagnosis
    console.log(`Row ${rowNumber} height:`, rowHeight);
    return rowHeight;
  }

  /**
   * Fetch image from URL and return as buffer
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

  /**
   * Add footer to the PDF
   */
  private addFooter(doc: PDFKit.PDFDocument) {
    const pageRange = doc.bufferedPageRange();
    const pageCount = pageRange.count;

    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);

      const left = doc.page.margins.left || 50;
      const right = doc.page.margins.right || 50;
      // Draw slightly above the bottom margin to avoid overflow triggering a new page
      const bottomY = doc.page.height - (doc.page.margins.bottom || 50) - 8; // 8px padding
      const contentWidth = doc.page.width - left - right;

      doc.fontSize(8).font('Helvetica').fillColor('#666666');

      // Preserve current cursor
      const prevX = doc.x;
      const prevY = doc.y;

      // Footer strings
      const genText = `Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`;
      const pageText = `Page ${i + 1} of ${pageCount}`;

      // Measure right text width to right-align manually
      const pageTextWidth = doc.widthOfString(pageText);

      // Draw left footer text
      doc.text(genText, left, bottomY, { lineBreak: false });
      // Draw right footer text on the same baseline
      doc.text(pageText, left + contentWidth - pageTextWidth, bottomY, {
        lineBreak: false,
      });

      // Restore cursor so footer drawing doesn't affect layout
      doc.x = prevX;
      doc.y = prevY;
    }
  }
}
