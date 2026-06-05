import { Document, Packer, Paragraph } from 'docx';
// docx-merger has no bundled TS types
// eslint-disable-next-line @typescript-eslint/no-require-imports
const DocxMerger = require('docx-merger');
import JSZip from 'jszip';

describe('docx-merger', () => {
  it('merges two docx buffers and preserves text markers', async () => {
    const mainDoc = new Document({
      sections: [
        {
          children: [new Paragraph({ text: 'MAIN_DOC_MARKER' })],
        },
      ],
    });

    const eccDoc = new Document({
      sections: [
        {
          children: [new Paragraph({ text: 'ECC_DOC_MARKER' })],
        },
      ],
    });

    const mainBuf = await Packer.toBuffer(mainDoc);
    const eccBuf = await Packer.toBuffer(eccDoc);

    const merged: Buffer = await new Promise((resolve, reject) => {
      try {
        const merger = new DocxMerger(
          { pageBreak: true },
          [mainBuf.toString('binary'), eccBuf.toString('binary')],
        );
        merger.save('nodebuffer', (data: Buffer) => resolve(data));
      } catch (error) {
        reject(error);
      }
    });

    const zip = await JSZip.loadAsync(merged);
    const documentXml = await zip.file('word/document.xml')?.async('text');

    expect(documentXml).toBeTruthy();
    expect(documentXml).toContain('MAIN_DOC_MARKER');
    expect(documentXml).toContain('ECC_DOC_MARKER');
  });
});
