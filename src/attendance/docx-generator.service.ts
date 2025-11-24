import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(AttendanceDocxGeneratorService.name);

  /**
   * Generate a DOCX buffer from attendance record data
   */
  async generateAttendanceDocx(
    attendanceRecord: AttendanceRecord,
  ): Promise<Buffer> {
    try {
      const sections: any[] = [];

      // Create header paragraphs
      const headerParagraphs = this.createHeader(attendanceRecord);

      // Create meeting info paragraphs
      const meetingInfoParagraphs = this.createMeetingInfo(attendanceRecord);

      // Create attendees table
      const attendeesTable = await this.createAttendeesTable(
        attendanceRecord.attendees,
      );

      // Create footer paragraphs
      const footerParagraphs = this.createFooter();

      // Combine all content
      const children = [
        ...headerParagraphs,
        ...meetingInfoParagraphs,
        attendeesTable,
        ...footerParagraphs,
      ];

      sections.push({
        properties: {},
        children,
      });

      const doc = new Document({
        sections: sections.map((section) => ({
          ...section,
          properties: {
            ...(section as any).properties,
            page: {
              margin: {
                top: 720, // 0.5"
                bottom: 720,
                left: 720,
                right: 720,
              },
            },
          },
        })),
      });

      const buffer = await Packer.toBuffer(doc);
      return buffer;
    } catch (error) {
      this.logger.error('Error generating attendance DOCX', error);
      throw error;
    }
  }

  /**
   * Create header paragraphs
   */
  private createHeader(record: AttendanceRecord): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Main title
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'ATTENDANCE RECORD',
            bold: true,
            font: 'Arial',
            size: 30, // 20pt
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
    );

    // Subtitle (title)
    if (record.title) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: record.title,
              bold: true,
              font: 'Arial',
              size: 28, // 14pt
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
      );
    } else {
      paragraphs.push(
        new Paragraph({
          text: '',
          spacing: { after: 200 },
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
              font: 'Arial',
              size: 22, // 11pt
            }),
            new TextRun({
              text: new Date(record.meetingDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              font: 'Arial',
              size: 22,
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
              font: 'Arial',
              size: 22,
            }),
            new TextRun({
              text: record.location,
              font: 'Arial',
              size: 22,
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
              font: 'Arial',
              size: 22,
            }),
            new TextRun({
              text: record.description,
              font: 'Arial',
              size: 22,
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
        spacing: { after: 150 },
      }),
    );

    return paragraphs;
  }

  /**
   * Create attendees table
   */
  private async createAttendeesTable(attendeesJson: any): Promise<Table> {
    const attendees: AttendeeDto[] = Array.isArray(attendeesJson)
      ? (attendeesJson as AttendeeDto[])
      : [];

    const rows: TableRow[] = [];

    // Header row
    rows.push(
      new TableRow({
        tableHeader: true,
        height: { value: 600, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'NAME',
                    bold: true,
                    font: 'Arial',
                    size: 22, // 11pt
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { fill: 'FFFFFF' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'AGENCY/ OFFICE',
                    bold: true,
                    font: 'Arial',
                    size: 22,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 23, type: WidthType.PERCENTAGE },
            shading: { fill: 'FFFFFF' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'POSITION',
                    bold: true,
                    font: 'Arial',
                    size: 22,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 12, type: WidthType.PERCENTAGE },
            shading: { fill: 'FFFFFF' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'SIGNATURE',
                    bold: true,
                    font: 'Arial',
                    size: 22,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: 'FFFFFF' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'PHOTO',
                    bold: true,
                    font: 'Arial',
                    size: 22,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: 'FFFFFF' },
          }),
        ],
      }),
    );

    // Data rows
    for (let index = 0; index < attendees.length; index++) {
      const attendee = attendees[index];
      const rowNumber = index + 1;

      // Name cell - format: "1. NAME (Rep. by...)" or "1. NAME"
      const nameChildren: any[] = [];
      const name = attendee.name ?? '';
      const parenthesisMatch = name.match(/^(.+?)(\s*\(.+?\)\s*)$/);

      nameChildren.push(
        new TextRun({
          text: `${rowNumber}. `,
          font: 'Arial',
          size: 22, // 11pt
        }),
      );

      if (parenthesisMatch) {
        const mainName = parenthesisMatch[1].trim();
        const parenthesisPart = parenthesisMatch[2].trim();
        nameChildren.push(
          new TextRun({
            text: `${mainName.toUpperCase()} `,
            bold: true,
            font: 'Arial',
            size: 22,
          }),
          new TextRun({
            text: parenthesisPart,
            font: 'Arial',
            size: 22,
          }),
        );
      } else {
        nameChildren.push(
          new TextRun({
            text: name.toUpperCase(),
            bold: true,
            font: 'Arial',
            size: 22,
          }),
        );
      }

      // Agency/Office cell
      const agency = attendee.agency ?? '';
      const office = attendee.office ?? '';
      let agencyOfficeText = '';
      if (agency && office) {
        agencyOfficeText = `${agency}`;
      } else if (agency) {
        agencyOfficeText = agency;
      } else if (office) {
        agencyOfficeText = office;
      } else {
        agencyOfficeText = '';
      }

      // Position cell
      const positionText = attendee.position || 'Member';

      // Signature cell - embed image or show ABSENT text
      const signatureChildren: any[] = [];
      const isAbsent =
        attendee.attendanceStatus &&
        attendee.attendanceStatus.toUpperCase() === 'ABSENT';

      if (isAbsent) {
        signatureChildren.push(
          new TextRun({
            text: 'ABSENT',
            bold: true,
            font: 'Arial',
            size: 22,
          }),
        );
      } else if (attendee.signatureUrl && attendee.signatureUrl.trim() !== '') {
        try {
          const imageBuffer = await this.fetchImageBuffer(
            attendee.signatureUrl,
          );
          if (imageBuffer) {
            signatureChildren.push(
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 120,
                  height: 50,
                },
                type: 'png',
              } as any),
            );
          }
        } catch (error) {
          this.logger.warn(
            `Failed to fetch signature for ${attendee.name}`,
            error,
          );
        }
      }

      // Photo cell - embed image if available
      const photoChildren: any[] = [];
      if (isAbsent) {
        photoChildren.push(
          new TextRun({
            text: 'ABSENT',
            font: 'Arial',
            bold: true,
            size: 22,
          }),
        );
      } else if (attendee.photoUrl && attendee.photoUrl.trim() !== '') {
        try {
          const imageBuffer = await this.fetchImageBuffer(attendee.photoUrl);
          if (imageBuffer) {
            photoChildren.push(
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 100,
                  height: 100,
                },
                type: 'jpeg',
              } as any),
            );
          }
        } catch (error) {
          this.logger.warn(`Failed to fetch photo for ${attendee.name}`, error);
        }
      }

      rows.push(
        new TableRow({
          height: { value: 800, rule: 'atLeast' },
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: nameChildren,
                  alignment: AlignmentType.LEFT,
                  spacing: { before: 100, after: 100 },
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 25, type: WidthType.PERCENTAGE },
              margins: {
                left: 100,
                right: 100,
                top: 100,
                bottom: 100,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: agencyOfficeText,
                      font: 'Arial',
                      size: 22,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 23, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: positionText,
                      font: 'Arial',
                      size: 22,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 12, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: signatureChildren,
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: photoChildren,
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      );
    }

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        insideHorizontal: {
          style: BorderStyle.SINGLE,
          size: 1,
          color: '000000',
        },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      },
    });
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
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        this.logger.warn(`Image not found (404): ${url}`);
      } else {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to fetch image from ${url}: ${errorMsg}`);
      }
      return null;
    }
  }

  /**
   * Create footer paragraphs
   */
  private createFooter(): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        text: '',
        spacing: { before: 400 },
      }),
    );

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated on ${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}`,
            font: 'Arial',
            size: 16, // 8pt
            color: '666666',
          }),
        ],
        alignment: AlignmentType.LEFT,
      }),
    );

    return paragraphs;
  }
}
