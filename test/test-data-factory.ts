import { CreateCMVRDto } from '../src/cmvr/dto/create-cmvr.dto';

/**
 * Creates valid CMVR test data that passes all DTO validation rules.
 * This factory provides minimal valid data with all required fields populated.
 * @param overrides Optional partial data to override defaults
 * @returns Complete CMVR data structure that satisfies CreateCMVRDto validation
 */
export function createValidCMVRData(
  overrides?: any,
): any {
  const defaultData: any = {
    companyName: 'Test Mining Corporation',
    location: 'PORT OPERATIONS, BRGY. 20-A – GABUT NORTE, MUNICIPALITY OF BADOC, ILOCOS NORTE',
    quarter: '1st',
    year: 2025,
    dateOfComplianceMonitoringAndValidation: '2025-03-31',
    monitoringPeriodCovered: '2025-01-01 to 2025-03-31',
    dateOfCmrSubmission: '2025-04-10',

    ecc: [
      {
        permitHolderName: 'Test Permit Holder 1',
        eccNumber: 'ECC-TEST-001',
        dateOfIssuance: '2024-01-15',
      },
    ],

    isagMpp: [
      {
        permitHolderName: 'Test Permit Holder 1',
        isagPermitNumber: 'ISAG-TEST-001',
        dateOfIssuance: '2024-01-20',
      },
    ],

    projectCurrentName: 'Test Mining Project',
    projectNameInEcc: 'Test Mining Project (ECC Name)',
    projectStatus: 'Operational',
    projectGeographicalCoordinates: '17.8583° N, 120.6333° E (WGS84 Datum)',

    proponent: {
      contactPersonAndPosition: 'John Doe, President',
      mailingAddress: '123 Test Street, Test City, Test Province',
      telephoneFax: '(02) 1234-5678',
      emailAddress: 'john.doe@testmining.com',
    },

    mmt: {
      contactPersonAndPosition: 'Jane Smith, MMT Head',
      mailingAddress: '456 Mining Avenue, Test City, Test Province',
      telephoneFax: '(02) 8765-4321',
      emailAddress: 'jane.smith@testmining.com',
    },

    epepFmrdpStatus: 'Approved',

    epep: [
      {
        permitHolderName: 'Test Permit Holder 1',
        epepNumber: 'EPEP-TEST-001',
        dateOfApproval: '2024-02-01',
      },
    ],

    rehabilitationCashFund: [
      {
        permitHolderName: 'Test Permit Holder 1',
        savingsAccountNumber: '1234-5678-90',
        amountDeposited: '100,000.00',
        dateUpdated: '2025-03-01',
      },
    ],

    monitoringTrustFundUnified: [
      {
        permitHolderName: 'Test Permit Holder 1',
        savingsAccountNumber: '0987-6543-21',
        amountDeposited: '200,000.00',
        dateUpdated: '2025-03-01',
      },
    ],

    finalMineRehabilitationAndDecommissioningFund: [
      {
        permitHolderName: 'Test Permit Holder 1',
        savingsAccountNumber: '5555-4444-33',
        amountDeposited: '300,000.00',
        dateUpdated: '2025-03-01',
      },
    ],

    executiveSummaryOfCompliance: {
      complianceWithEpepCommitments: {
        safety: true,
        social: true,
        rehabilitation: true,
        remarks: 'All EPEP commitments met',
      },
      complianceWithSdmpCommitments: {
        complied: true,
        notComplied: false,
        remarks: 'SDMP commitments complied',
      },
      complaintsManagement: {
        naForAll: false,
        complaintReceivingSetup: true,
        caseInvestigation: true,
        implementationOfControl: true,
        communicationWithComplainantOrPublic: true,
        complaintDocumentation: true,
        remarks: 'No complaints received',
      },
      accountability: {
        complied: true,
        notComplied: false,
        remarks: 'Accountability maintained',
      },
      others: {
        specify: 'N/A',
        na: true,
      },
    },

    processDocumentationOfActivitiesUndertaken: {
      dateConducted: '2025-03-15',
      mergedMethodologyOrOtherRemarks: 'Standard monitoring methodology applied',
      sameDateForAllActivities: true,
      activities: {
        complianceWithEccConditionsCommitments: {
          mmtMembersInvolved: ['MMT Member 1', 'MMT Member 2'],
        },
        complianceWithEpepAepepConditions: {
          mmtMembersInvolved: ['MMT Member 1', 'MMT Member 2'],
        },
        siteOcularValidation: {
          mmtMembersInvolved: ['MMT Member 1', 'MMT Member 2'],
        },
        siteValidationConfirmatorySampling: {
          mmtMembersInvolved: ['MMT Member 1', 'MMT Member 2'],
          dateConducted: '2025-03-15',
          applicable: true,
          none: false,
          remarks: 'Sampling completed',
        },
      },
    },

    complianceMonitoringReport: {
      complianceToProjectLocationAndCoverageLimits: {
        parameters: [],
        otherComponents: [],
      },
      complianceToImpactManagementCommitments: {
        constructionInfo: [],
        implementationOfEnvironmentalImpactControlStrategies: [],
        overallComplianceAssessment: 'Compliant with all requirements',
      },
      airQualityImpactAssessment: {},
      waterQualityImpactAssessment: {},
    },
  };

  // Deep merge helper
  function deepMerge(target: any, source: any): any {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }
    return output;
  }

  function isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  return deepMerge(defaultData, overrides || {});
}
