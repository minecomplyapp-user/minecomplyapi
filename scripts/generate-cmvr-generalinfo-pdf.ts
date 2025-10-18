import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import {
  CMVRPdfGeneratorService,
  CMVRGeneralInfo,
} from '../src/cmvr/cmvr-pdf-generator.service';

async function main() {
  const generator = new CMVRPdfGeneratorService();

  // Normalized generalInfo JSON (camelCase keys)
  const generalInfo: CMVRGeneralInfo = {
    companyName: 'Acme Mining Corporation',
    location: { latitude: 14.6123, longitude: 121.0567 },
    quarter: '3rd',
    year: 2025,
    dateOfComplianceMonitoringAndValidation: '2025-09-30',
    monitoringPeriodCovered: '2025-07-01 to 2025-09-30',
    dateOfCmrSubmission: '2025-10-10',

    ecc: [
      {
        permitHolderName: 'Acme Mining Corporation',
        eccNumber: 'ECC-2020-1234-5678',
        dateOfIssuance: '2020-08-15',
      },
      {
        permitHolderName: 'Acme Mining Corporation',
        eccNumber: 'ECC-2021-9876-5432',
        dateOfIssuance: '2021-04-01',
      },
    ],

    isagMpp: [
      {
        permitHolderName: 'Acme Mining Corporation',
        isagPermitNumber: 'ISAG-2020-ACME-01',
        dateOfIssuance: '2020-05-20',
      },
      {
        permitHolderName: 'Acme Mining Corporation',
        isagPermitNumber: 'ISAG-2022-ACME-02',
        dateOfIssuance: '2022-03-11',
      },
    ],

    projectCurrentName: 'Acme Nickel Project',
    projectNameInEcc: 'Acme Nickel Mining Project',
    projectStatus: 'Operating',
    projectGeographicalCoordinates: { x: 121.0567, y: 14.6123 },
    proponent: {
      contactPersonAndPosition: 'Juan Dela Cruz - Compliance Officer',
      mailingAddress: '123 Mine Road, Cityville, Region IV-A, Philippines',
      telephoneFax: '+63 912 345 6789 / +63 2 8123 4567',
      emailAddress: 'compliance@acmemining.ph',
    },
    epepFmrdpStatus: 'Approved',
    epep: [
      {
        permitHolderName: 'Acme Mining Corporation',
        epepNumber: 'EPEP-2019-0001',
        dateOfApproval: '2019-12-01',
      },
      {
        permitHolderName: 'Acme Mining Corporation',
        epepNumber: 'EPEP-2023-0003',
        dateOfApproval: '2023-06-15',
      },
    ],
  };

  const pdfBuffer = await generator.generateGeneralInfoPdf(generalInfo);

  const outDir = resolve(process.cwd(), 'tmp');
  try {
    mkdirSync(outDir);
  } catch {}

  const outPath = resolve(outDir, 'cmvr-general-info.sample.pdf');
  writeFileSync(outPath, pdfBuffer);
  console.log('PDF generated at:', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
