import { Injectable } from '@nestjs/common';
import PDFDocument, { font } from 'pdfkit';
import {
  toConditionRows,

} from './ecc-pdf.helpers';


// Shape for the normalized generalInfo JSON we agreed on
export interface ECCConditionInfo {
  conditions?: Array<{  
    condition_number?: string;
    condition?: string;
    status?: string; // ISO or human readable
    remarks?: string;
  }>;
  permitHolder?: string;

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
        margins: { top: ONE_INCH, bottom: ONE_INCH, left: ONE_INCH, right: ONE_INCH },
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
        const leftMargin = doc.page.margins.left; // Use the correct margin (72)


        
        eccReport.conditions = eCCConditions;        
        const hasConditions = eccReport.conditions.length > 0;

        if (hasConditions) {
            
            doc.moveDown(0.5);
      

    const conditionlist = toConditionRows(eccReport.conditions);
    console.log('Condition Rows:',conditionlist); // Debug log to verify rows
    // Get the full width of the table area
    const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
          
            // Draw the Permit Holder name spanning the full width
          doc.font('Times-Roman', 12);
            doc.table(
              {
                defaultStyle: { border: 0.5, borderColor: "gray" },
         
                data: [[eccReport.permitHolder]],
              
})
            doc.table(
              {defaultStyle: { border: 0.5, borderColor: "gray" },

                columnStyles: [ 45, 178,  22, 22, 22,179],
                          
              data: conditionlist
              
})
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