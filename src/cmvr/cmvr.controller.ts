import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CmvrService } from './cmvr.service';
import { CMVRPdfGeneratorService } from './cmvr-pdf-generator.service';

@ApiTags('CMVR')
@Controller('cmvr')
export class CmvrController {
  constructor(
    private readonly cmvrService: CmvrService,
    private readonly pdfGenerator: CMVRPdfGeneratorService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all CMVR reports' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all CMVR reports',
  })
  async findAll() {
    return this.cmvrService.findAll();
  }

  @Get('preview/general-info')
  @ApiOperation({
    summary: 'Preview PDF with mock data (Development only)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PDF preview generated with mock data',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async previewGeneralInfoPdf(@Res() res: Response) {
    try {
      // Mock data for quick preview
      const mockGeneralInfo = {
        companyName: 'Acme Mining Corporation',
        location:
          'PORT OPERATIONS, BRGY. 20-A – GABUT NORTE, MUNICIPALITY OF BADOC, ILOCOS NORTE',
        quarter: '3rd',
        year: 2025,
        dateOfComplianceMonitoringAndValidation: '2025-09-30',
        monitoringPeriodCovered: '2025-07-01 to 2025-09-30',
        dateOfCmrSubmission: '2025-10-10',
        ecc: [
          {
            permitHolderName: 'Flor T. Lagang',
            eccNumber: 'ECC No. 010607050100-1103',
            dateOfIssuance: 'Jul. 05, 2006',
          },
          {
            permitHolderName: 'Joseph L. Chua',
            eccNumber: 'ECC No. 010607060102-1103',
            dateOfIssuance: 'Jul. 06, 2006',
          },
          {
            permitHolderName: 'Aireen Carriedo',
            eccNumber: 'ECC No. 010607050099-1103',
            dateOfIssuance: 'Jul. 05, 2006',
          },
          {
            permitHolderName: 'Efren Pungtilan',
            eccNumber: 'ECC No. 010611200186-1103',
            dateOfIssuance: 'Nov. 20, 2006',
          },
          {
            permitHolderName: 'Mae Ann C. Aurelio',
            eccNumber: 'ECC No. 010607060102-1103 (2nd amendment)',
            dateOfIssuance: 'Aug. 25, 2022',
          },
          {
            permitHolderName: 'Erna C. Tiu',
            eccNumber: 'ECC No. 010609190135-1103',
            dateOfIssuance: 'Apr. 30, 2012',
          },
          {
            permitHolderName: 'Edison C. Tiu',
            eccNumber: 'ECC No. 010609190133-1103',
            dateOfIssuance: 'Apr. 30, 2012',
          },
          {
            permitHolderName: 'Maechellenie C.Cabanilla',
            eccNumber: 'ECC No. 010609190137-1103 (1st amendment)',
            dateOfIssuance: 'Aug. 26, 2022',
          },
          {
            permitHolderName: 'Judy C. Tan',
            eccNumber: 'ECC No. RO11404-0076',
            dateOfIssuance: 'Apr. 15, 2014',
          },
          {
            permitHolderName: 'Joan P. Suriaga',
            eccNumber: 'ECC No. 010609190138-1103 (1st amendment)',
            dateOfIssuance: 'Aug. 23, 2022',
          },
          {
            permitHolderName: 'Edmundo Mendones',
            eccNumber: 'ECC No. RO11404-0075',
            dateOfIssuance: 'Apr. 15, 2014',
          },
          {
            permitHolderName: 'Betty N. Chua',
            eccNumber: 'ECC No. 010609150132-1103',
            dateOfIssuance: 'Apr. 30, 2012',
          },
          {
            permitHolderName: 'Alice L. Chua',
            eccNumber: 'ECC No. 010609150131-1103',
            dateOfIssuance: 'Apr. 30, 2012',
          },
          {
            permitHolderName: 'Antonio L. Kho',
            eccNumber: 'ECC No. 010611200185-1103',
            dateOfIssuance: 'Apr. 30, 2012',
          },
          {
            permitHolderName: 'Omnico Natural Resources, Inc. (Plant)',
            eccNumber: 'ECC No. R1-0940070-3722',
            dateOfIssuance: 'Jun. 09, 2025',
          },
        ],
        isagMpp: [
          {
            permitHolderName: 'Flor T. Lagang',
            isagPermitNumber: '06-004',
            dateOfIssuance: 'Sep. 06, 2022 (3rd renewal)',
          },
          {
            permitHolderName: 'Joseph L. Chua',
            isagPermitNumber: '06-005',
            dateOfIssuance: 'Sep. 06, 2022 (3rd renewal)',
          },
          {
            permitHolderName: 'Aireen Carriedo',
            isagPermitNumber: '06-007',
            dateOfIssuance: 'Sep. 06, 2022 (3rd renewal)',
          },
          {
            permitHolderName: 'Efren Pungtilan',
            isagPermitNumber: '06-025',
            dateOfIssuance: 'Sep. 06, 2022 (3rd renewal)',
          },
          {
            permitHolderName: 'Mae Ann C. Aurelio',
            isagPermitNumber: '06-008',
            dateOfIssuance: 'Sep. 06, 2022 (3rd renewal)',
          },
          {
            permitHolderName: 'Erna C. Tiu',
            isagPermitNumber: '06-010',
            dateOfIssuance: 'Sep. 06, 2022 (3rd renewal)',
          },
          {
            permitHolderName: 'Edison C. Tiu',
            isagPermitNumber: '06-011',
            dateOfIssuance: 'Sep. 06, 2022 (3rd renewal)',
          },
          {
            permitHolderName: 'Maechellenie C. Cabanilla',
            isagPermitNumber: '06-012',
            dateOfIssuance: 'Sep. 06, 2022 (3rd renewal)',
          },
          {
            permitHolderName: 'Judy C. Tan',
            isagPermitNumber: '017-002',
            dateOfIssuance: 'Sep. 06, 2022 (1st renewal)',
          },
          {
            permitHolderName: 'Joan P. Suriaga',
            isagPermitNumber: '06-013',
            dateOfIssuance: 'Sep. 06, 2022 (3rd renewal)',
          },
          {
            permitHolderName: 'Edmundo Mendones',
            isagPermitNumber: '017-001',
            dateOfIssuance: 'Sep. 06, 2022 (1st renewal)',
          },
          {
            permitHolderName: 'Betty N. Chua',
            isagPermitNumber: '06-015',
            dateOfIssuance: 'Sep. 06, 2022 (3rd renewal)',
          },
          {
            permitHolderName: 'Alice L. Chua',
            isagPermitNumber: '06-017',
            dateOfIssuance: 'Sep. 06, 2022 (3rd renewal)',
          },
          {
            permitHolderName: 'Antonio L. Kho',
            isagPermitNumber: '06-023',
            dateOfIssuance: 'Sep. 06, 2022 (3rd renewal)',
          },
          {
            permitHolderName: 'Omnico Natural Resources, Inc. (MPP)',
            isagPermitNumber: '03-2023-I',
            dateOfIssuance: 'Jun. 29, 2023',
          },
        ],
        projectCurrentName: 'OMNICO NATURAL RESOURCES, INC. (ONRI)',
        projectNameInEcc: 'OMNICO NATURAL RESOURCES, INC. ',
        projectStatus: 'Active',
        projectGeographicalCoordinates:
          'Refer to attached ONRI Quarry Tenement Map',
        proponent: {
          contactPersonAndPosition: 'ALMA L. KHO, SVP & General Manager',
          mailingAddress: 'Brgy. 18 – San Isidro, Sarrat, Ilocos Norte',
          telephoneFax: '(077) 676-0014, (077) 676-0410',
          emailAddress: 'onri.admdivision@gmail.com',
        },
        mmt: {
          contactPersonAndPosition: 'Engr. Angelica D. De Vera, MMT Head',
          mailingAddress:
            'DENR Bldg., Brgy. Sevilla, City of San Fernando, La Union',
          telephoneFax: '0977-116-4572',
          emailAddress: 'angelicadevera815@gmail.com',
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
        rehabilitationCashFund: [
          {
            permitHolderName: 'ONRI',
            savingsAccountNumber: 'DBP 00-0-01347-545-9',
            amountDeposited: '830,328.90',
            dateUpdated: 'June 30, 2025',
          },
          {
            permitHolderName: 'Flor T. Lagang',
            savingsAccountNumber: 'LBP 4051-0027-71',
            amountDeposited: '45,115.50',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Joseph L. Chua',
            savingsAccountNumber: 'LBP 4051-0022-16',
            amountDeposited: '67,995.39',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Aireen Carriedo',
            savingsAccountNumber: 'LBP 4051-0053-63',
            amountDeposited: '35,361.58',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Efren Pungtilan',
            savingsAccountNumber: 'LBP 4051-0023-21',
            amountDeposited: '25,993.11',
            dateUpdated: 'June 30, 2025',
          },
          {
            permitHolderName: 'Mae Ann C. Aurelio',
            savingsAccountNumber: 'LBP 4051-0023-72',
            amountDeposited: '35,320.16',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Erna C. Tiu',
            savingsAccountNumber: 'LBP 4051-0022-32',
            amountDeposited: '35,420.96',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Edison C. Tiu',
            savingsAccountNumber: 'LBP 4051-0022-59',
            amountDeposited: '35,420.96',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Maechellenie C.Cabanilla',
            savingsAccountNumber: 'LBP 4051-0023-64',
            amountDeposited: '45,226.72',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Judy C. Tan',
            savingsAccountNumber: 'LBP 4051-0022-40',
            amountDeposited: '35,420.96',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Joan P. Suriaga',
            savingsAccountNumber: 'LBP 4051-0023-30',
            amountDeposited: '45,226.86',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Edmundo Mendones',
            savingsAccountNumber: 'LBP 4051-0033-28',
            amountDeposited: '45,105.30',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Betty N. Chua',
            savingsAccountNumber: 'LBP 4051-0027-63',
            amountDeposited: '35,309.04',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Alice L. Chua',
            savingsAccountNumber: 'LBP 4051-0022-75',
            amountDeposited: '35,321.04',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Antonio L. Kho',
            savingsAccountNumber: 'LBP 4051-0022-08',
            amountDeposited: '35,420.90',
            dateUpdated: 'July 11, 2025',
          },
        ],
        monitoringTrustFundUnified: [
          {
            permitHolderName: 'Omnico NaturalResources, Inc.',
            savingsAccountNumber: '0545-012835-030',
            amountDeposited: '2,250,401.06',
            dateUpdated: 'June 30, 2025',
          },
        ],
        finalMineRehabilitationAndDecommissioningFund: [
          {
            permitHolderName: 'ONRI',
            savingsAccountNumber: '4051-0020-03',
            amountDeposited: '1,110,559.91',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Flor T. Lagang',
            savingsAccountNumber: '1821-2200-73',
            amountDeposited: '10,006.59',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Joseph L. Chua',
            savingsAccountNumber: '5081-0179-40',
            amountDeposited: '10,006.58',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Aireen Carriedo',
            savingsAccountNumber: '4051-0078-46',
            amountDeposited: '10,012.31',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Efren Pungtilan',
            savingsAccountNumber: '4051-0078-54',
            amountDeposited: '10,109.27',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Mae Ann C. Aurelio',
            savingsAccountNumber: '5081-0179-31',
            amountDeposited: '10,006.58',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Erna C. Tiu',
            savingsAccountNumber: '4861-0178-56',
            amountDeposited: '10,109.19',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Edison C. Tiu',
            savingsAccountNumber: '4861-0178-21',
            amountDeposited: '10,109.19',
            dateUpdated: 'July 11, 2025',
          },
          {
            permitHolderName: 'Maechellenie C.Cabanilla',
            savingsAccountNumber: '1821-2280-65',
            amountDeposited: '-',
            dateUpdated: '-',
          },
        ],
        executiveSummaryOfCompliance: {
          complianceWithEpepCommitments: {
            safety: false,
            social: true,
            rehabilitation: true,
            remarks: 'Conducted by MGB RO1',
          },
          complianceWithSdmpCommitments: {
            complied: true,
            notComplied: false,
            remarks: 'Conducted by MGB RO1 (SDS)',
          },
          complaintsManagement: {
            naForAll: true,
            complaintReceivingSetup: false,
            caseInvestigation: false,
            implementationOfControl: false,
            communicationWithComplainantOrPublic: false,
            complaintDocumentation: false,
            remarks: 'No complaints against the proponent ',
          },
          accountability: {
            complied: false,
            notComplied: false,
            remarks:
              'Engr. Roque B. Palmes is registered as part-time MEPEO Head on Sep. 18, 2023 ',
          },
          others: {
            specify: '',
            na: true,
          },
        },
        processDocumentationOfActivitiesUndertaken: {
          dateConducted: 'September 9-10, 2025',
          mergedMethodologyOrOtherRemarks:
            'Ocular inspection of Quarry Areas, Siltation Ponds, Motorpool, Solid and Hazardous Waste Storage Area, Nursery, Port, Rehabilitation and Tree Planting Areas.',
          sameDateForAllActivities: false,
          activities: {
            complianceWithEccConditionsCommitments: {
              mmtMembersInvolved: [
                'Angelica D. De Vera - MMT Head',
                'Daryl S. Saguid - EMB Rep.',
                'Nestor G. Rosales - CENRO-CSEIN Rep.',
                'Ariel Rosario - PENRO IN Rep.',
                'Arnold Ansagay - PGIN Rep.',
              ],
            },
            complianceWithEpepAepepConditions: {
              mmtMembersInvolved: [
                'Edison D. Bolibol - Brgy. 8 – San Antonio Rep.',
                'Jorge A. Ramos - Brgy. 9 – San Lorenzo Rep.',
                'Jansen Agner - Brgy. 17 – San Felipe Rep.',
                'Leonisa S. Asuncion - Brgy. 10 – San Miguel Rep.',
              ],
            },
            siteOcularValidation: {
              na: false,
              mmtMembersInvolved: [
                'Wilfred H. Sebastian - Brgy. 19 – Sto. Tomas Rep.',
                'Reynaldo Malaqui - Brgy. 21 – San Marcos',
                'Glenda H. Tamayo - Zanjera de Masiit, NGO Rep.',
                'Julie Ann L. Cainglit - Brgy. Gabut Norte, Badoc',
                'Roque B. Palmes - Mining Engineer, ONRI',
              ],
            },
            siteValidationConfirmatorySampling: {
              dateConducted: 'September 10, 2025',
              applicable: true,
              none: false,
              mmtMembersInvolved: [
                'Julie Ann L. Cainglit - Brgy. Gabut Norte, Badoc',
                'Roque B. Palmes - Mining Engineer, ONRI',
              ],
              remarks:
                'No confirmatory sampling required based on field observations.',
            },
          },
        },
        complianceToProjectLocationAndCoverageLimits: {
          parameters: [
            {
              name: 'Project Location',
              specification:
                'Refer to attached ONRI Quarry Tenement Map and Project Location',
              remarks: '',
              withinSpecs: true,
            },
            {
              name: 'Project Area (ha)',
              specification: 'ISAG Permit – 19.99 has. per permit',
              remarks: '',
              withinSpecs: true,
            },
            {
              name: 'Capital Cost (Php)',
              specification: '750,000.00 per ISAG Permitted Area',
              remarks: '',
              withinSpecs: true,
            },
            {
              name: 'Type of Minerals',
              specification: 'Sand and Gravel',
              remarks: '',
              withinSpecs: true,
            },
            {
              name: 'Mining Method',
              specification: 'Quarrying',
              remarks: 'Open Cast Quarrying',
              withinSpecs: true,
            },
            {
              name: 'Production',
              specification: 'Refer to Annex A',
              remarks: '',
              withinSpecs: true,
            },
            {
              name: 'Mine Life',
              specification: '5 years (not including replenishment)',
              remarks: '',
              withinSpecs: true,
            },
            {
              name: 'Mineral Reserves/Resource',
              specification: '150,000 cu.m. of river aggregates each Permit',
              remarks: '',
              withinSpecs: true,
            },
            {
              name: 'Access/Transportation',
              specification: 'Laoag-Sarrat-Apayao Road',
              remarks: '',
              withinSpecs: true,
            },
            {
              name: 'Power Supply',
              specification: {
                plant:
                  'Ilocos Norte Electric Cooperative; 2 units diesel-powered generators with 850 KVA nameplate rating; 1 unit BH PC 450',
                port: '2 units 540 hp Daihatsu GPST-26D diesel-powered generator with rating of 600 KVA INEC power source.',
              },
              remarks: '',
              withinSpecs: true,
            },
            {
              name: 'Mining Equipment',
              specification: {
                plant:
                  '3 units Backhoe 0.8 cu.m. Bucket capacity; 1-unit Backhoe 0.25 cu.m. bucket capacity; Wheel Loaders – Komatsu WA500 – 1 unit; Dump Trucks (10 wheeler) – at least 10 units; Water Tanker – 2 units; Submersible Pump – 2 sets',
                port: 'Backhoe PC400 – 6 units; Payloader – 3 units; Tug Boats (1,800 hp/ 3,200 hp) – 2 units; Crane – 1 unit; Water Truck – 1 unit; Power Generator (600 KVA) – 2 units.',
              },
              remarks:
                'Backhoe PC400 – 6 units; Payloader – 3 units; Tug Boats (1,800 hp/ 3,200 hp) – 2 units; Crane – 1 unit   ',
              withinSpecs: true,
            },
            {
              name: 'Work Force',
              specification: {
                employees:
                  'Regular = 95; Probationary = 11; Casual = 1; Contractual = 0.',
              },
              remarks:
                'Contractor – Gaspar Trucking: 3 excavators; 1 front end loader; 10 dump trucks',
              withinSpecs: true,
            },
            {
              name: 'Development/Utilization Schedule',
              specification: 'Haulage/ Access roads developed',
              remarks: '',
              withinSpecs: true,
            },
          ],
          otherComponents: [
            {
              name: 'Other Components',
              specification: 'Shipment',
              remarks:
                'Shipped out1Q 2025: Sand = 43,564.10 MT Gravel = 3,259.06 MT Total = 46,823.16 MT2Q 2025: Sand = 34,794.50 MT Gravel = 7,630.00 MT Total = 46,823.16 MTOverall Total: Sand = 78,358.6 MT Gravel = 10,889.06 MT Total = 89,247.66 MT',
              withinSpecs: true,
            },
          ],
        },
      };

      const pdfBuffer =
        await this.pdfGenerator.generateGeneralInfoPdf(mockGeneralInfo);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="cmvr-preview.pdf"',
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to generate preview PDF',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a CMVR report by ID' })
  @ApiParam({ name: 'id', description: 'CMVR Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'CMVR Report found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'CMVR Report not found',
  })
  async findOne(@Param('id') id: string) {
    return this.cmvrService.findOne(id);
  }

  @Get(':id/pdf/general-info')
  @ApiOperation({
    summary: 'Generate PDF for CMVR General Information section',
  })
  @ApiParam({ name: 'id', description: 'CMVR Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PDF generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'CMVR Report not found or no generalInfo data',
  })
  async generateGeneralInfoPdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.cmvrService.generateGeneralInfoPdf(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cmvr-general-info-${id}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to generate PDF',
        });
      }
    }
  }
}
