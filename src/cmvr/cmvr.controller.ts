import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  NotFoundException,
  HttpStatus,
  StreamableFile,
  Delete,
  HttpCode,
  Patch,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiOkResponse,
  ApiProduces,
} from '@nestjs/swagger';
import { CmvrService } from './cmvr.service';
import { CMVRPdfGeneratorService } from './cmvr-pdf-generator.service';
import type { CMVRGeneralInfo } from './cmvr-pdf-generator.service';
import { CMVRDocxGeneratorService } from './cmvr-docx-generator.service';
import { CreateCMVRDto } from './dto/create-cmvr.dto';
import { AttendanceService } from '../attendance/attendance.service';
import { Public } from '../auth/decorators/public.decorator';
// import { stat } from 'node:fs';

// Mock data for quick preview
const cmvrReport = {
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
  complianceToImpactManagementCommitments: {
    constructionInfo: [
      {
        areaName: 'Pre-Construction',
        commitments: [
          {
            plannedMeasure: 'N/A',
            actualObservation: '',
            isEffective: false,
            recommendations: '',
          },
        ],
      },
      {
        areaName: 'Construction',
        commitments: [
          {
            plannedMeasure: 'N/A',
            actualObservation: '',
            isEffective: false,
            recommendations: '',
          },
        ],
      },
    ],
    implementationOfEnvironmentalImpactControlStrategies: [
      {
        areaName: 'Quarry Operation',
        commitments: [
          {
            plannedMeasure:
              '1. The quarrying operation shall be done in a dredging like manner so the present riverbed shall be deepened.',
            actualObservation:
              'No extraction activities during the monitoring.  However, pre stockpiled materials were observed arranged in a long pile within the permit area of Mr. Efren Pungtilan (formerly Ms. Bernardina Talan)',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '2. The depth of extraction shall be undertaken at a uniform depth and starts at the uppermost portion of the quarry area progressing downwards. The depth of extraction shall be limited to 1 meter at a time or 2 meters in two extraction levels as per EPEP.',
            actualObservation:
              'No extraction activities during the monitoring.',
            isEffective: false,
            recommendations: '',
          },
          {
            plannedMeasure:
              '3. Successive parallel cuts following the same route and direction as the initial slice shall be taken moving towards the outer bend.',
            actualObservation:
              'With parallel cuts moving towards the outer bend.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '4. The quarry is located more than 500 meters from the nearest residential area, nevertheless, the hauling trucks shall be properly maintained to avoid the generation of unnecessary sound.',
            actualObservation:
              'Hauling trucks are properly maintained by concerned service contractors.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '5. The manner of extraction (dredging) shall be retreating, from the middle portion progressing towards the outer bend.',
            actualObservation:
              'Pre-piled materials were observed arranged in a long pile within the permit area of Mr. Efren Pungtilan (formerly Ms. Bernardina Talan).',
            isEffective: true,
            recommendations:
              'The MEPEO justified that the pre-piling activity, which was initiated two (2) days prior to the monitoring, was undertaken to temporarily regulate water flow for access to the extraction area and to retain water for community consumption, particularly benefiting residents of Barangays 18, 17, 10, 9, 8, and 7, as attested by the respective Barangay Captains. The pre-pile was likewise intended to temporarily regulate water flow for the NIA Bonga Pump.  Nevertheless, the MEPEO committed to voluntarily cease the activity and remove the piles on or before September 12, 2025.',
          },
          {
            plannedMeasure:
              '6. The operation (quarrying) shall still be concentrated along the outer portion of the river.',
            actualObservation:
              'Quarrying concentrated along the outer portion of the river.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '7. The haul road from quarry to plant shall therefore be a graded road along the riverbed, which shall not constrict nor obstruct the flow of the river.',
            actualObservation: 'Graded haul road along the riverbed',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '8. Mufflers of company and service contractors’ vehicles and equipment as well as contract haulers of processed sand shall be kept in good operating condition.',
            actualObservation:
              'Hauling trucks are properly maintained by concerned service contractors.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure: '9. Regular check-up mufflers of all equipment.',
            actualObservation:
              'Hauling trucks are properly maintained by concerned service contractors.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '10. Regular water spraying of the haul roads shall be undertaken to reduce dust migration.',
            actualObservation:
              'Water sprinkling is regularly conducted to minimize dust generation.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '11. The quarrying/ clearing operation is limited to a single shift, from 7:00 AM to 6:00 PM to minimize nuisance to nearby residents.',
            actualObservation:
              'Sand and gravel extraction is restricted from 8 AM to 5 PM, Mondays to Saturdays only excluding holidays.',
            isEffective: true,
            recommendations: '',
          },
        ],
      },
      {
        areaName: 'Plant Operation',
        commitments: [
          {
            plannedMeasure:
              '1. Used washed water from the plant shall be discharged to the settling ponds where it is decanted of slimes.',
            actualObservation:
              'Continuous desilting of settling ponds.  Water consumption for the 2nd quarter 2025 = 15,652 m3 monthly',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '2. The power generating units are housed within sound proofed walls and are adequately provided with mufflers to minimize nuisance to the nearest residential area.',
            actualObservation:
              'Power house is provided with sound proofing. Only used during power failures.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '3. Planting of trees along the periphery of the plant, aside from the existing perimeter fence, shall serve as a noise barrier (that minimize noise and dampens sound mitigation), control dust mobilization and enhance aesthetic effect.',
            actualObservation:
              'Various tree species were maintained at the periphery of the plant to serve as noise barrier.  100 fruit-bearing trees (Pakak) were planted on January 10, 2025, in Barangay 22, Sarrat, Ilocos Norte',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '4. Per submitted EPEP, plant operation is limited to single shift from 7:00 AM to 6:00 PM to minimize nuisance to nearby residents.',
            actualObservation:
              'Sand processing operation is allowed until 11pm daily. However, plant operation usually stops at 7:00 PM.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '5. The generation of dust is minimized by the maintenance of vegetation.',
            actualObservation:
              'Vegetation around the plant site and dust suppression methods are being maintained and undertaken.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '6. Water sprinklers are installed at the upper decks of vibrating screens, top rotary screen and at the bed of the screw classifier.',
            actualObservation:
              'Functional water sprinklers are installed for the plant equipment.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure: '7. Quantify Plant Waste/ Silt generated.',
            actualObservation: 'Complied.',
            isEffective: true,
            recommendations:
              '1,580 cu.m. of silt were generated during the 2nd quarter CY 2025',
          },
          {
            plannedMeasure: '8. Segregate recyclable for non-recyclable waste',
            actualObservation:
              'Trash bags are maintained and solid wastes are properly segregated',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure: '9. PlastiKalikasan program',
            actualObservation:
              'Target generation: 400kg Reduced: 6 kg Recycled: 3 kg Reuse: 0 kg',
            isEffective: true,
            recommendations: '',
          },
        ],
      },
      {
        areaName: 'Port Operation',
        commitments: [
          {
            plannedMeasure: '1. Use off-site disposal of hazardous wastes.',
            actualObservation:
              'Used oil was transported and treated by Golden Pearl Enterprises on July 19, 2025.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '2. Prevent mixing of used oil with other hazardous wastes.',
            actualObservation:
              'Hazardous waste storage area is maintained with proper signages.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure: '3. Provide buffer zones and greenery.',
            actualObservation:
              'Existing tetrapods/ jackstones are observed along the periphery of the port.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '4. Regular maintenance of mobile equipment and loading facility to prevent emission of obnoxious gases.',
            actualObservation:
              'All operating equipment noted during the monitoring does not emit obnoxious gasses.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure: '5. Use of absorbents such as saw dust.',
            actualObservation: 'Saw dust are being used as oil absorbents.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '6. Inventory of used oils and other hazardous waste.',
            actualObservation:
              'Used oil was collected on drums and is contained in the used oil storage area.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '7. Adherence to equipment operation repair and maintenance SOPs.',
            actualObservation:
              'Concreted area for equipment maintenance near House A was observed.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '8. Regular maintenance of port equipment to prevent emission of obnoxious gases.',
            actualObservation:
              'Regular conduct of change oil and fuel filters. No visible emission of obnoxious gasses noted from port equipment.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '9. Segregate recyclable materials from non-recyclable wastes.',
            actualObservation:
              'Scrap metals/ materials are piled at the designated Scrap area.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '10. Properly collect and dispose residual solid wastes.',
            actualObservation: 'Solid wastes are properly segregated.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure: '11. Use dredge spoil for reclamation purposes.',
            actualObservation: 'N/A',
            isEffective: false,
            recommendations: '',
          },
          {
            plannedMeasure:
              '12. Provision of silt curtains or disposal of sediments for reclamation material.',
            actualObservation:
              'Drainage canal 1 and canal 2 surrounding the conveyor system are functional.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '13. Dispose soils at designated area at port terminal.',
            actualObservation: 'N/A',
            isEffective: false,
            recommendations: '',
          },
          {
            plannedMeasure: '14. Provide silt screen.',
            actualObservation:
              'Silt screens are noted and included on drainage canal',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '15. Regular maintenance of haul trucks to prevent generation of unnecessary engine noise.',
            actualObservation: 'Continuous maintenance of heavy equipment.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '16. Regular water spraying of road from port gate to sand stockpile.',
            actualObservation:
              'No observed dust circulation during the monitoring.',
            isEffective: true,
            recommendations: '',
          },
          {
            plannedMeasure:
              '17. Spillage sweeping within the port premises and along the roads caused by hauling of sand. Services of laborers are being contracted for the activity. The schedule of spillage sweeping is twice a week or as the need arises',
            actualObservation:
              'No spillage noted during the inspection. No spillages on hauling roads.',
            isEffective: true,
            recommendations: '',
          },
        ],
      },
    ],
    overallComplianceAssessment: 'PARTIALLY COMPLIED',
  },
  airQualityImpactAssessment: {
    quarry:
      'Water Sprinkling and imposition of quarry speed limits along haulage road',
    plant:
      'Water Sprinkling is regularly conducted to minimize dust circulation',
    port: 'Mitigating measures such as water sprinkling are conducted regularly to minimize dust circulation',
    parameters: [
      {
        name: 'TSP',
        results: {
          inSMR: {
            current: '3.56 \u00b5g/Ncm',
            previous: '10.49 \u00b5g/Ncm',
          },
          mmtConfirmatorySampling: {
            current: '-',
            previous: '-',
          },
        },
        eqpl: {
          redFlag: '-',
          action: '-',
          limit: '35 \u00b5g/Ncm',
        },
        remarks: 'ONRI - Badoc',
      },
      {
        name: 'TSP',
        results: {
          inSMR: {
            current: '3.54 \u00b5g/Ncm',
            previous: '10.51 \u00b5g/Ncm',
          },
          mmtConfirmatorySampling: {
            current: '-',
            previous: '-',
          },
        },
        eqpl: {
          redFlag: '-',
          action: '-',
          limit: '35 \u00b5g/Ncm',
        },
        remarks: 'ONRI - Sarrat',
      },
    ],
    samplingDate:
      'The ambient air quality monitoring at Badoc and Sarrat was conducted on November 18-19, 2024 (1800H-1800H) and November 19-20, 2024 (1700H-1700H) respectively.',
    weatherAndWind:
      'The weather condition during sampling was sunny and the prevailing wind directions was coming from North-Northwest (N-NW).',
    explanationForConfirmatorySampling: 'N/A',
    overallAssessment: 'Within the DENR Standard',
  },
  waterQualityImpactAssessment: {
    quarry: 'No significant impact to the environment',
    plant: 'No effluent discharge observed during the monitoring period',
    parameters: [
      {
        name: 'TSS',
        result: {
          internalMonitoring: {
            month: 'June',
            // A nested array for the multiple readings
            readings: [
              {
                label: 'TSS 01',
                current_mgL: 18,
                previous_mgL: 6.2,
              },
              {
                label: 'TSS 02',
                current_mgL: 15,
                previous_mgL: 14,
              },
              {
                label: 'TSS 03',
                current_mgL: 67,
                previous_mgL: 11,
              },
            ],
          },
          mmtConfirmatorySampling: {
            current: '-',
            previous: '-',
          },
        },
        denrStandard: {
          redFlag: '-',
          action: '-',
          limit_mgL: 150,
        },
        remark: 'Passed',
      },
      {
        name: 'TSS',
        result: {
          internalMonitoring: {
            month: 'June',
            // A nested array for the multiple readings
            readings: [
              {
                label: 'TSS 01',
                current_mgL: 18,
                previous_mgL: 6.2,
              },
              {
                label: 'TSS 02',
                current_mgL: 15,
                previous_mgL: 14,
              },
              {
                label: 'TSS 03',
                current_mgL: 67,
                previous_mgL: 11,
              },
            ],
          },
          mmtConfirmatorySampling: {
            current: '-',
            previous: '-',
          },
        },
        denrStandard: {
          redFlag: '-',
          action: '-',
          limit_mgL: 150,
        },
        remark: 'Passed',
      },
    ],

    // Footer information
    samplingDate: 'June 27, 2025',
    weatherAndWind: 'Sunny',
    explanationForConfirmatorySampling: 'N/A',
    overallAssessment: 'Within the DENR Standard',
  },
  noiseQualityImpactAssessment: {
    parameters: [
      {
        name: 'Noise Level at Boundary (dB)',
        results: {
          inSMR: {
            current: '65 dB',
            previous: '62 dB',
          },
          mmtConfirmatorySampling: {
            current: '64 dB',
            previous: '63 dB',
          },
        },
        eqpl: {
          redFlag: 'None',
          action: 'Continue regular monitoring',
          denrStandard: '75 dB (Daytime)',
        },
        remarks: 'Within permissible limits.',
      },
      {
        name: 'Noise Level at Residential Area (dB)',
        results: {
          inSMR: {
            current: '55 dB',
            previous: '53 dB',
          },
          mmtConfirmatorySampling: {
            current: '54 dB',
            previous: '52 dB',
          },
        },
        eqpl: {
          redFlag: 'Slight increase observed',
          action: 'Recommend noise source identification',
          denrStandard: '65 dB (Daytime)',
        },
        remarks: 'Slightly higher but still within standards.',
      },
    ],
    samplingDate: '2025-09-15',
    weatherAndWind: 'Sunny, light breeze (NNE, 5 km/h)',
    explanationForConfirmatorySampling:
      'Confirmatory sampling was conducted due to observed increase in residential area noise levels.',
    overallAssessment: {
      firstQuarter: {
        year: '2025',
        assessment: 'Noise levels within DENR limits.',
      },
      secondQuarter: {
        year: '2025',
        assessment: 'Minor fluctuations, still compliant.',
      },
      thirdQuarter: {
        year: '2025',
        assessment: 'Stable readings, no significant changes.',
      },
      fourthQuarter: {
        year: '2025',
        assessment: 'Compliant throughout the year.',
      },
    },
  },
  complianceWithGoodPracticeInSolidAndHazardousWasteManagement: {
    quarry: [
      {
        typeOfWaste: 'Waste Oil (H501)',
        eccEpepCommitments: {
          handling: 'Properly labeled and placed in leak-proof drums.',
          storage: 'Stored in dedicated, covered, and bunded area.',
          disposal: true,
        },
        adequate: {
          y: true,
          n: false,
        },
        // *** FIXED: Now using strings for compatibility ***
        previousRecord: '150.5 Liters',
        q2_2025_Generated_HW: '25.0 Liters',
        total: '175.5 Liters',
      },
      {
        typeOfWaste: 'Used Lead-Acid Batteries (I101)',
        eccEpepCommitments: {
          handling: 'Insulated and kept upright; no stacking.',
          storage: 'Stored on non-permeable floor, covered.',
          disposal: true,
        },
        adequate: {
          y: true,
          n: false,
        },
        // *** FIXED: Now using strings for compatibility ***
        previousRecord: '15 pieces',
        q2_2025_Generated_HW: '5 pieces',
        total: '20 pieces',
      },
    ],
    plant: [
      {
        typeOfWaste: 'Infectious Waste (A101)',
        eccEpepCommitments: {
          handling: 'Segregated and placed in yellow bags/containers.',
          storage: 'Stored in cold room for less than 48 hours.',
          disposal: true,
        },
        adequate: {
          y: false, // Indicates a non-compliance issue
          n: true,
        },
        // *** FIXED: Now using strings for compatibility ***
        previousRecord: '25 kg (3 bags)',
        q2_2025_Generated_HW: '8.5 kg (1 bag)',
        total: '33.5 kg (4 bags)',
      },
    ],
    port: [
      {
        typeOfWaste: 'Used Lead-Acid Batteries (I101)',
        eccEpepCommitments: {
          handling: 'Insulated and kept upright; no stacking.',
          storage: 'Stored on non-permeable floor, covered.',
          disposal: true,
        },
        adequate: {
          y: true,
          n: false,
        },
        // *** FIXED: Now using strings for compatibility ***
        previousRecord: '15 pieces',
        q2_2025_Generated_HW: '5 pieces',
        total: '20 pieces',
      },
    ],
  },

  // --- SECTION I: Compliance Monitoring Report and Discussions (Partial) ---
  complianceWithGoodPracticeInChemicalSafetyManagement: {
    chemicalSafety: {
      // The old boolean fields are now nested under 'chemicalSafety'.
      // They are stored as strings in the DTO, so 'true' is used to indicate compliance/existence.
      riskManagement: 'true',
      training: 'true',
      handling: 'true',
      emergencyPreparedness: 'true',
      remarks:
        'All operational chemicals are properly inventoried and covered by a comprehensive risk management plan. Quarterly training sessions were conducted for all personnel involved in chemical handling and emergency response drills were executed successfully.',
      // Adding empty strings for other DTO fields not provided in the original data
      chemicalCategory: '',
      othersSpecify: '',
    },
  },

  // --- Complaints Verification and Management ---
  complaintsVerificationAndManagement: [
    {
      dateFiled: '2025-07-05',
      // Old boolean flags (denr, company, mmt) are mapped to the single 'filedLocation' string.
      filedLocation: 'company',
      othersSpecify: '',
      nature:
        "Dust emission from the crushing area affecting nearby residential community 'Phase 2'.", // Renamed from 'natureOfComplaint'
      resolutions:
        'Immediately increased water spraying frequency on crushers and haul roads from twice hourly to every 15 minutes. Installed a temporary dust screen netting along the boundary. Resolution confirmed satisfactory by complainant on 2025-07-08.', // Renamed from 'resulotionMade'
    },
    {
      dateFiled: '2025-08-10',
      filedLocation: 'denr',
      othersSpecify: '',
      nature:
        'Report of potential hydrocarbon spill near the equipment fueling station affecting a drainage culvert.',
      resolutions:
        'DENR inspection conducted on 2025-08-11. No evidence of a fresh spill found. The source was identified as residual staining from prior operations. Fueling protocols were re-reviewed with staff, and containment booms were placed as a preventative measure. Complaint closed.',
    },
    {
      dateFiled: '2025-09-01',
      filedLocation: 'mmt',
      othersSpecify: 'Local NGO, Green Watch',
      nature:
        'Noise pollution exceeding nighttime limits at the South Boundary Monitoring Station (MMT site B).',
      resolutions:
        'Operations audit confirmed that heavy equipment was running past the 10:00 PM cutoff time. Corrective Action: All heavy equipment is now grounded at 9:45 PM, and night shift security patrols are authorized to enforce this cutoff. MMT verified compliance during the follow-up meeting on 2025-09-15.',
    },
  ],

  // --- Recommendations (Structure is correct) ---
  recommendationFromPrevQuarter: {
    quarter: 2,
    year: 2025,
    plant: [
      {
        recommendation:
          'Continue regular maintenance of water sprinkling system to ensure optimal performance.',
        commitment:
          'Maintenance team to conduct weekly checks and immediate repairs as needed.',
        status: 'Ongoing',
      },
      {
        recommendation: 'dasdasdnce.',
        commitment:
          'Maintenance dsdsdsteam to conduct weekly checks and immediate repairs as needed.',
        status: 'Ongdsdsdsdoing',
      },
    ],
    quarry: [
      {
        recommendation:
          'Continue regular maintenance of water sprinkling system to ensure optimal performance.',
        commitment:
          'Maintenance team to conduct weekly checks and immediate repairs as needed.',
        status: 'Ongoing',
      },
    ],
    port: [
      {
        recommendation:
          'Continue regular maintenance of water sprinkling system to ensure optimal performance.',
        commitment:
          'Maintenance team to conduct weekly checks and immediate repairs as needed.',
        status: 'Ongoing',
      },
    ],
  },
  recommendationForNextQuarter: {
    quarter: 3,
    year: 2025,
    plant: [
      {
        recommendation:
          'Continue regular maintenance of water sprinkling system to ensure optimal performance.',
        commitment:
          'Maintenance team to conduct weekly checks and immediate repairs as needed.',
        status: 'Ongoing',
      },
      {
        recommendation: 'dasdasdnce.',
        commitment:
          'Maintenance dsdsdsteam to conduct weekly checks and immediate repairs as needed.',
        status: 'Ongdsdsdsdoing',
      },
    ],
    quarry: [
      {
        recommendation:
          'Continue regular maintenance of water sprinkling system to ensure optimal performance.',
        commitment:
          'Maintenance team to conduct weekly checks and immediate repairs as needed.',
        status: 'Ongoing',
      },
    ],
    port: [
      {
        recommendation:
          'Continue regular maintenance of water sprinkling system to ensure optimal performance.',
        commitment:
          'Maintenance team to conduct weekly checks and immediate repairs as needed.',
        status: 'Ongoing',
      },
    ],
  },

  attendanceUrl: '',
};

export { cmvrReport };

@ApiTags('CMVR')
@Controller('cmvr')
export class CmvrController {
  constructor(
    private readonly cmvrService: CmvrService,
    private readonly pdfGenerator: CMVRPdfGeneratorService,
    private readonly docxGenerator: CMVRDocxGeneratorService,
    private readonly attendanceService: AttendanceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new CMVR report' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'CMVR report created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  async create(
    @Body() createCmvrDto: CreateCMVRDto,
    @Query('fileName') fileName?: string,
  ) {
    return this.cmvrService.create(createCmvrDto, fileName);
  }

  @Get()
  @ApiOperation({ summary: 'Get all CMVR reports' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all CMVR reports',
  })
  async findAll() {
    return this.cmvrService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all CMVR reports created by a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of CMVR reports created by the user',
  })
  async findByUserId(@Param('userId') userId: string) {
    return this.cmvrService.findByUserId(userId);
  }

  @Get('preview/general-info')
  @ApiOperation({
    summary: 'Preview PDF with mock data (Development only)',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'PDF preview generated with mock data',
    content: {
      'application/pdf': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  async previewGeneralInfoPdf(
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | void> {
    try {
      const pdfBuffer =
        await this.pdfGenerator.generateGeneralInfoPdf(cmvrReport);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cmvr-preview.pdf"',
        'Content-Length': pdfBuffer.length,
      });
      return new StreamableFile(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to generate preview PDF',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Get('preview/general-info-docx')
  @ApiOperation({
    summary: 'Download DOCX with mock data (Development only)',
  })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  @ApiOkResponse({
    description: 'DOCX preview generated with mock data',
    content: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        {
          schema: { type: 'string', format: 'binary' },
        },
    },
  })
  async previewCmvrReportDocx(
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | void> {
    try {
      const docxBuffer =
        await this.docxGenerator.generateFullReportDocx(cmvrReport);

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="cmvr-preview.docx"',
        'Content-Length': docxBuffer.length,
      });
      return new StreamableFile(docxBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to generate preview DOCX',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Public()
  @Get(':id/docx')
  @ApiOperation({ summary: 'Generate DOCX for full CMVR report by ID' })
  @ApiParam({ name: 'id', description: 'CMVR Report ID' })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  @ApiOkResponse({
    description: 'DOCX generated successfully',
    content: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        {
          schema: { type: 'string', format: 'binary' },
        },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'CMVR Report not found or has no data',
  })
  async generateFullReportDocx(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | void> {
    try {
      const record = await this.cmvrService.findOne(id);
      if (!record?.cmvrData) {
        throw new NotFoundException(
          `CMVR Report with ID ${id} has no cmvrData`,
        );
      }

      // Fetch attendance data if attendanceId is present in cmvrData
      let attendanceData: any = null;
      const cmvrDataObj = record.cmvrData as any;
      if (cmvrDataObj?.attendanceId) {
        try {
          attendanceData = await this.attendanceService.findOne(
            cmvrDataObj.attendanceId,
          );
        } catch (error) {
          console.warn(
            `Could not fetch attendance data for ID ${cmvrDataObj.attendanceId}:`,
            error,
          );
        }
      }

      const docxBuffer = await this.docxGenerator.generateFullReportDocx(
        record.cmvrData as unknown as CMVRGeneralInfo,
        attendanceData,
      );

      // Use the fileName from the record, fallback to cmvr-{id} if not available
      const fileName = record.fileName
        ? `${record.fileName.replace(/[^a-zA-Z0-9-_\.]/g, '_')}.docx`
        : `cmvr-${id}.docx`;

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': docxBuffer.length,
      });
      return new StreamableFile(docxBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to generate DOCX',
          error: error instanceof Error ? error.message : String(error),
        });
      }
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
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'PDF generated successfully',
    content: {
      'application/pdf': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'CMVR Report not found or no generalInfo data',
  })
  async generateGeneralInfoPdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | void> {
    try {
      const pdfBuffer = await this.cmvrService.generateGeneralInfoPdf(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cmvr-general-info-${id}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      return new StreamableFile(pdfBuffer);
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a CMVR report by ID' })
  @ApiParam({ name: 'id', description: 'CMVR Report ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Deleted' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'CMVR Report not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.cmvrService.remove(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a CMVR report by ID (replace cmvrData)' })
  @ApiParam({ name: 'id', description: 'CMVR Report ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Updated successfully' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'CMVR Report not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: CreateCMVRDto,
    @Query('fileName') fileName?: string,
  ) {
    return this.cmvrService.update(id, updateDto, fileName);
  }
}
