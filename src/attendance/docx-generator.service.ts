import { Injectable } from '@nestjs/common';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  VerticalAlign,
  BorderStyle,
  ImageRun,
} from 'docx';
import { AttendanceRecord } from '@prisma/client';
import { AttendeeDto } from './dto';
import axios from 'axios';

@Injectable()
export class AttendanceDocxGeneratorService {
  /**
   * Generate a DOCX buffer from attendance record data
   */
  async generateAttendanceDocx(
    attendanceRecord: AttendanceRecord,
  ): Promise<Buffer> {
    const attendees: AttendeeDto[] = Array.isArray(attendanceRecord.attendees)
      ? (attendanceRecord.attendees as unknown as AttendeeDto[])
      : [];

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // 0.5 inch
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: [
            // Header
            ...this.createHeader(attendanceRecord),
            // Meeting Info
            ...this.createMeetingInfo(attendanceRecord),
            // Attendees Table
            await this.createAttendeesTable(attendees),
            // Footer
            ...this.createFooter(),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * Create header paragraphs
   */
  private createHeader(record: AttendanceRecord): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Title
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'ATTENDANCE RECORD',
            bold: true,
            size: 32, // 16pt
            font: 'Arial',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    );

    // Record title if exists
    if (record.title) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: record.title,
              bold: true,
              size: 24, // 12pt
              font: 'Arial',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
      );
    } else {
      paragraphs.push(
        new Paragraph({
          text: '',
          spacing: { after: 400 },
        }),
      );
    }

    return paragraphs;
  }

  /**
   * Create meeting information paragraphs
   */
  private createMeetingInfo(record: AttendanceRecord): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Meeting Date
    if (record.meetingDate) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Meeting Date: ',
              bold: true,
              size: 22, // 11pt
              font: 'Arial',
            }),
            new TextRun({
              text: new Date(record.meetingDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              size: 22,
              font: 'Arial',
            }),
          ],
          spacing: { after: 100 },
        }),
      );
    }

    // Location
    if (record.location) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Location: ',
              bold: true,
              size: 22,
              font: 'Arial',
            }),
            new TextRun({
              text: record.location,
              size: 22,
              font: 'Arial',
            }),
          ],
          spacing: { after: 100 },
        }),
      );
    }

    // Description
    if (record.description) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Description: ',
              bold: true,
              size: 22,
              font: 'Arial',
            }),
            new TextRun({
              text: record.description,
              size: 22,
              font: 'Arial',
            }),
          ],
          spacing: { after: 100 },
        }),
      );
    }

    // Add spacing before table
    paragraphs.push(
      new Paragraph({
        text: '',
        spacing: { after: 300 },
      }),
    );

    return paragraphs;
  }

  /**
   * Create attendees table
   */
  private async createAttendeesTable(attendees: AttendeeDto[]): Promise<Table> {
    if (attendees.length === 0) {
      // Return a simple table with "No attendees" message
      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'No attendees recorded.',
                        italics: true,
                        size: 20,
                        font: 'Arial',
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    }

    const rows: TableRow[] = [];

    // Header row
    rows.push(
      new TableRow({
        tableHeader: true,
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'NAME',
                    bold: true,
                    size: 20,
                    font: 'Arial',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { fill: 'E0E0E0' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'AGENCY/OFFICE',
                    bold: true,
                    size: 20,
                    font: 'Arial',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'E0E0E0' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'POSITION',
                    bold: true,
                    size: 20,
                    font: 'Arial',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: 'E0E0E0' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'STATUS',
                    bold: true,
                    size: 20,
                    font: 'Arial',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: 'E0E0E0' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'SIGNATURE',
                    bold: true,
                    size: 20,
                    font: 'Arial',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: 'E0E0E0' },
          }),
        ],
      }),
    );

    // Data rows
    for (const attendee of attendees) {
      rows.push(await this.createAttendeeRow(attendee));
    }

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: this.createTableBorders(),
      rows,
    });
  }

  /**
   * Create a single attendee row
   */
  private async createAttendeeRow(attendee: AttendeeDto): Promise<TableRow> {
    // Fetch signature image if URL exists
    let signatureImage: ImageRun | null = null;
    if (attendee.signatureUrl) {
      try {
        const response = await axios.get(attendee.signatureUrl, {
          responseType: 'arraybuffer',
          timeout: 5000,
        });
        const imageBuffer = Buffer.from(response.data as ArrayBuffer);

        signatureImage = new ImageRun({
          data: imageBuffer,
          transformation: {
            width: 80,
            height: 40,
          },
          type: 'png',
        });
      } catch (error) {
        console.error(
          `Failed to fetch signature image: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return new TableRow({
      height: { value: 800, rule: 'atLeast' },
      children: [
        // Name
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: attendee.name || '-',
                  size: 20,
                  font: 'Arial',
                }),
              ],
              alignment: AlignmentType.LEFT,
              indent: { left: 100, right: 100 },
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        // Agency
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: attendee.agency || '-',
                  size: 20,
                  font: 'Arial',
                }),
              ],
              alignment: AlignmentType.LEFT,
              indent: { left: 100, right: 100 },
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        // Position
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: attendee.position || '-',
                  size: 20,
                  font: 'Arial',
                }),
              ],
              alignment: AlignmentType.CENTER,
              indent: { left: 100, right: 100 },
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        // Status
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: attendee.attendanceStatus || '-',
                  size: 20,
                  font: 'Arial',
                }),
              ],
              alignment: AlignmentType.CENTER,
              indent: { left: 100, right: 100 },
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        // Signature
        new TableCell({
          children: [
            new Paragraph({
              children: signatureImage
                ? [signatureImage]
                : [
                    new TextRun({
                      text: '-',
                      size: 20,
                      font: 'Arial',
                    }),
                  ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    });
  }

  /**
   * Create footer paragraphs
   */
  private createFooter(): Paragraph[] {
    return [
      new Paragraph({
        text: '',
        spacing: { before: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
            size: 18,
            font: 'Arial',
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ];
  }

  /**
   * Create table borders
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
}
