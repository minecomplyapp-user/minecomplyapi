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
import { SupabaseStorageService } from '../storage/supabase-storage.service';
import axios from 'axios';

@Injectable()
export class AttendanceDocxGeneratorService {
  constructor(private readonly storageService: SupabaseStorageService) {}
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
            // Attachments
            ...(await this.createAttachments(attendanceRecord)),
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
  private createMeetingInfo(record: AttendanceRecord): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const rows: Array<[string, string]> = [];

    // Meeting Date
    if (record.meetingDate) {
      rows.push([
        'Meeting Date',
        new Date(record.meetingDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      ]);
    }

    // Location
    if (record.location) {
      rows.push(['LOCATION', record.location]);
    }

    // Description
    if (record.description) {
      rows.push(['DESCRIPTION', record.description]);
    }

    // Create table if there are rows
    if (rows.length > 0) {
      const tableRows: TableRow[] = rows.map(
        ([label, value]) =>
          new TableRow({
            height: { value: 400, rule: 'atLeast' },
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: label,
                        bold: true,
                        size: 22,
                        font: 'Arial',
                      }),
                    ],
                    alignment: AlignmentType.LEFT,
                    indent: { left: 100, right: 100 },
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 25, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: ':',
                        bold: true,
                        size: 22,
                        font: 'Arial',
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 3, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: value,
                        size: 22,
                        font: 'Arial',
                      }),
                    ],
                    alignment: AlignmentType.LEFT,
                    indent: { left: 100, right: 100 },
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 72, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
      );

      elements.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: this.createTableBorders(),
          rows: tableRows,
        }),
      );
    }

    // Add spacing before attendance table
    elements.push(
      new Paragraph({
        text: '',
        spacing: { after: 300 },
      }),
    );

    // Add "ATTENDANCE:" label
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'ATTENDANCE:',
            bold: true,
            size: 22,
            font: 'Arial',
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 200 },
      }),
    );

    return elements;
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
                        size: 22,
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
                    size: 22,
                    font: 'Arial',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 40, type: WidthType.PERCENTAGE },
            shading: { fill: 'FFFFFF' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'AGENCY/ OFFICE',
                    bold: true,
                    size: 22,
                    font: 'Arial',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'FFFFFF' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'POSITION',
                    bold: true,
                    size: 22,
                    font: 'Arial',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: 'FFFFFF' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'SIGNATURE',
                    bold: true,
                    size: 22,
                    font: 'Arial',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: 'FFFFFF' },
          }),
        ],
      }),
    );

    // Data rows
    for (let i = 0; i < attendees.length; i++) {
      rows.push(await this.createAttendeeRow(attendees[i], i + 1));
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
  private async createAttendeeRow(
    attendee: AttendeeDto,
    rowNumber: number,
  ): Promise<TableRow> {
    // Fetch signature image if URL exists
    let signatureImage: ImageRun | null = null;
    if (attendee.signatureUrl) {
      try {
        // Get signed URL from Supabase storage
        const signedUrl = await this.storageService.createSignedDownloadUrl(
          attendee.signatureUrl,
          3600, // 1 hour expiry
        );

        const response = await axios.get(signedUrl, {
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

    // Check if attendance status is ABSENT
    const isAbsent = attendee.attendanceStatus === 'ABSENT';

    return new TableRow({
      height: { value: 500, rule: 'atLeast' },
      children: [
        // Name with number
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${rowNumber}. ${attendee.name.toUpperCase() || '-'}`,
                  size: 22,
                  font: 'Arial',
                  bold: true,
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
                  size: 22,
                  font: 'Arial',
                }),
              ],
              alignment: AlignmentType.CENTER,
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
                  size: 22,
                  font: 'Arial',
                }),
              ],
              alignment: AlignmentType.CENTER,
              indent: { left: 100, right: 100 },
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        // Signature (or ABSENT)
        new TableCell({
          children: [
            new Paragraph({
              children: isAbsent
                ? [
                    new TextRun({
                      text: 'ABSENT',
                      size: 22,
                      font: 'Arial',
                      bold: true,
                    }),
                  ]
                : signatureImage
                  ? [signatureImage]
                  : [
                      new TextRun({
                        text: '',
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
   * Create attachments section with images
   */
  private async createAttachments(
    record: AttendanceRecord,
  ): Promise<(Paragraph | Table)[]> {
    const elements: (Paragraph | Table)[] = [];

    if (!record.attachments || !Array.isArray(record.attachments)) {
      return elements;
    }

    const attachments = record.attachments as unknown as Array<{
      path?: string;
      caption?: string;
    }>;

    if (attachments.length === 0) {
      return elements;
    }

    // Add spacing before attachments
    elements.push(
      new Paragraph({
        text: '',
        spacing: { before: 400 },
      }),
    );

    // Add "PHOTO DOCUMENTATION" label
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PHOTO DOCUMENTATION',
            bold: true,
            size: 22,
            font: 'Arial',
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 200 },
      }),
    );

    // Process attachments in pairs (2 columns per row)
    for (let i = 0; i < attachments.length; i += 2) {
      const attachment1 = attachments[i];
      const attachment2 = attachments[i + 1] || null;

      const tableRows: TableRow[] = [];

      // Fetch images
      let imageCell1: TableCell;
      let imageCell2: TableCell;

      // First image
      if (attachment1?.path) {
        try {
          const signedUrl1 = await this.storageService.createSignedDownloadUrl(
            attachment1.path,
            3600,
          );
          const response1 = await axios.get(signedUrl1, {
            responseType: 'arraybuffer',
            timeout: 10000,
          });
          const imageBuffer1 = Buffer.from(response1.data as ArrayBuffer);

          imageCell1 = new TableCell({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageBuffer1,
                    transformation: {
                      width: 200,
                      height: 150, // 4:3 ratio
                    },
                    type: 'jpg',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            },
          });
        } catch (error) {
          console.error(
            `Failed to fetch attachment image: ${error instanceof Error ? error.message : String(error)}`,
          );
          imageCell1 = new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `PHOTO ${i + 1}`,
                    bold: true,
                    size: 22,
                    font: 'Arial',
                    color: 'FF0000',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `[Failed to load image]`,
                    size: 22,
                    font: 'Arial',
                    italics: true,
                    color: 'FF0000',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 50, type: WidthType.PERCENTAGE },
          });
        }
      } else {
        imageCell1 = new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `PHOTO ${i + 1}`,
                  bold: true,
                  size: 22,
                  font: 'Arial',
                  color: 'FF0000',
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 50, type: WidthType.PERCENTAGE },
        });
      }

      // Second image
      if (attachment2?.path) {
        try {
          const signedUrl2 = await this.storageService.createSignedDownloadUrl(
            attachment2.path,
            3600,
          );
          const response2 = await axios.get(signedUrl2, {
            responseType: 'arraybuffer',
            timeout: 10000,
          });
          const imageBuffer2 = Buffer.from(response2.data as ArrayBuffer);

          imageCell2 = new TableCell({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageBuffer2,
                    transformation: {
                      width: 200,
                      height: 150, // 4:3 ratio
                    },
                    type: 'jpg',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            },
          });
        } catch (error) {
          console.error(
            `Failed to fetch attachment image: ${error instanceof Error ? error.message : String(error)}`,
          );
          imageCell2 = new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `PHOTO ${i + 2}`,
                    bold: true,
                    size: 22,
                    font: 'Arial',
                    color: 'FF0000',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `[Failed to load image]`,
                    size: 22,
                    font: 'Arial',
                    italics: true,
                    color: 'FF0000',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 50, type: WidthType.PERCENTAGE },
          });
        }
      } else if (attachments.length % 2 === 1 && i === attachments.length - 1) {
        // Last odd cell - empty
        imageCell2 = new TableCell({
          children: [
            new Paragraph({
              text: '',
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 50, type: WidthType.PERCENTAGE },
        });
      } else {
        imageCell2 = new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `PHOTO ${i + 2}`,
                  bold: true,
                  size: 22,
                  font: 'Arial',
                  color: 'FF0000',
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 50, type: WidthType.PERCENTAGE },
        });
      }

      // Image row
      tableRows.push(
        new TableRow({
          height: { value: 3000, rule: 'atLeast' },
          children: [imageCell1, imageCell2],
        }),
      );

      // Caption row
      tableRows.push(
        new TableRow({
          height: { value: 400, rule: 'atLeast' },
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: attachment1?.caption || `Caption ${i + 1}`,
                      size: 22,
                      font: 'Arial',
                      bold: false,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text:
                        attachment2?.caption ||
                        (attachment2 ? `Caption ${i + 2}` : ''),
                      size: 22,
                      font: 'Arial',
                      bold: false,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      );

      // Create table for this pair of images
      elements.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: this.createTableBorders(),
          rows: tableRows,
        }),
      );

      // Add spacing between tables
      if (i + 2 < attachments.length) {
        elements.push(
          new Paragraph({
            text: '',
            spacing: { after: 200 },
          }),
        );
      }
    }

    return elements;
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
