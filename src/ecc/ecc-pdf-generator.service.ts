import { Injectable } from '@nestjs/common';
import PDFDocument, { font } from 'pdfkit';
import { toConditionRows } from './ecc-pdf.helpers';
import { func } from 'joi';

// Shape for the normalized generalInfo JSON we agreed on
export interface ECCConditionInfo {
  conditions?: Array<{
    condition_number?: string;
    condition?: string;
    status?: string; // ISO or human readable
    remarks?: string;
    remark_list?: string[];
    section?: number;
  }>;
  permit_holders?: string[];
}
/**
 * Calculate tally counts from conditions
 */
function calculateTally(conditions: any[]) {
  const tally = {
    complied: 0,
    notComplied: 0,
    partiallyComplied: 0,
    na: 0,
    total: conditions.length,
  };

  conditions.forEach((cond) => {
    const status = (cond.status || '').toLowerCase();
    
    if (status.includes('complied') && !status.includes('not') && !status.includes('partial')) {
      tally.complied++;
    } else if (status.includes('not') && status.includes('complied')) {
      tally.notComplied++;
    } else if (status.includes('partial')) {
      tally.partiallyComplied++;
    } else if (status.includes('n/a') || status === 'na') {
      tally.na++;
    }
  });

  return tally;
}

@Injectable()
export class ECCPdfGeneratorService {
  /**
   * Generate a PDF Buffer for the General Information section of a ECC report
   */
  async generateECCreportPDF(eccReport, eCCConditions): Promise<Buffer> {
    const ONE_INCH = 72;
    const doc = new PDFDocument({
      size: [612, 936],
      margins: {
        top: ONE_INCH,
        bottom: ONE_INCH,
        left: ONE_INCH,
        right: ONE_INCH,
      },
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));
    });

    try {
      doc.moveDown(1);

      eccReport.conditions = eCCConditions;
      const hasConditions = eccReport.conditions.length > 0;

      if (hasConditions) {
        doc.moveDown(0.5);

    const result = toConditionRows(eccReport.conditions);
    const conditionsBySection = result.rows;        for (const [
          index,
          conditionlistRows,
        ] of conditionsBySection.entries()) {
          doc.font('Times-Roman', 12);
          doc.table({
            defaultStyle: { border: 0.5, borderColor: 'gray' },

            data: [[eccReport.permit_holders[index]]],
          });
          doc.table({
            defaultStyle: { border: 0.5, borderColor: 'gray' },

            columnStyles: [45, 178, 22, 22, 22, 179],

            data: conditionlistRows,
          });

          // ✅ NEW: Add tally table after conditions
          const sectionConditions = eccReport.conditions.filter(
            (c) => c.section === index + 1
          );
          const tally = calculateTally(sectionConditions);
          
          doc.moveDown(0.5);
          doc.fontSize(11).font('Times-Bold');
          doc.text(`Compliance Summary - ${eccReport.permit_holders[index]}`, {
            align: 'left',
          });
          doc.moveDown(0.3);
          
          doc.fontSize(10).font('Times-Roman');
          doc.table({
            defaultStyle: { border: 0.5, borderColor: 'gray' },
            columnStyles: [200, 80, 100],
            data: [
              ['Status', 'Count', 'Percentage'],
              ['Complied', tally.complied.toString(), `${((tally.complied / tally.total) * 100).toFixed(1)}%`],
              ['Not Complied', tally.notComplied.toString(), `${((tally.notComplied / tally.total) * 100).toFixed(1)}%`],
              ['Partially Complied', tally.partiallyComplied.toString(), `${((tally.partiallyComplied / tally.total) * 100).toFixed(1)}%`],
              ['N/A', tally.na.toString(), `${((tally.na / tally.total) * 100).toFixed(1)}%`],
              ['Total Conditions', tally.total.toString(), '100%'],
            ],
          });

          doc.moveDown(1);
        }
      }

      // 🎯 FIX 4: Ensure doc.end() and return await pdfPromise are outside the try/catch
      // if they are not correctly handled in the provided snippet. (They are,
      // but often the doc.end() is misplaced).
    } catch (error) {
      console.error('Error generating ECC PDF:', error);
      doc.end(); // End document on error to prevent resource leak
      throw error;
    }

    doc.end();
    return pdfPromise;
  }
}
