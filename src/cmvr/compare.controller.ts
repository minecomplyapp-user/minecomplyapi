const cmvrReport = {
  companyName: 'Test Mining Company',
  location: '123 Mining Street, Test Municipality, Test Province, Region 1',
  quarter: '1st',
  year: 2025,
  dateOfComplianceMonitoringAndValidation: '2025-03-31',
  dateOfCmrSubmission: '2025-04-15',
  ecc: [
    {
      eccNumber: 'ECC-2025-001',
      dateOfIssuance: '2025-01-15',
      permitHolderName: 'First ECC Permit Holder',
    },
    {
      eccNumber: 'ECC-2025-002',
      dateOfIssuance: '2025-01-20',
      permitHolderName: 'Second ECC Permit Holder',
    },
    {
      eccNumber: 'ECC-2025-003',
      dateOfIssuance: '2025-01-25',
      permitHolderName: 'Third ECC Permit Holder',
    },
  ],
  isagMpp: [
    {
      dateOfIssuance: '2025-01-20',
      isagPermitNumber: 'ISAG-2025-001',
      permitHolderName: 'First ISAG Holder',
    },
    {
      dateOfIssuance: '2025-01-25',
      isagPermitNumber: 'ISAG-2025-002',
      permitHolderName: 'Second ISAG Holder',
    },
    {
      dateOfIssuance: '2025-01-30',
      isagPermitNumber: 'ISAG-2025-003',
      permitHolderName: 'Third ISAG Holder',
    },
  ],
  projectCurrentName: 'Current Test Project',
  projectNameInEcc: 'Test Project in ECC',
  projectStatus: 'Active',
  projectGeographicalCoordinates: 'X: 120.5678, Y: 14.1234',
  proponent: {
    emailAddress: 'test@mining.com',
    telephoneFax: '+63-912-345-6789',
    mailingAddress: '456 Business Ave',
    contactPersonAndPosition: 'John Doe, CEO',
  },
  mmt: {
    emailAddress: 'mmt@denr.gov',
    telephoneFax: '+63-912-987-6543',
    mailingAddress: '789 Government St',
    contactPersonAndPosition: 'Jane Smith, MMT Head',
  },
  epepFmrdpStatus: 'Approved',
  epep: [
    {
      epepNumber: 'EPEP-2025-001',
      dateOfApproval: '2025-02-01',
      permitHolderName: 'First EPEP Holder',
    },
    {
      epepNumber: 'EPEP-2025-002',
      dateOfApproval: '2025-02-05',
      permitHolderName: 'Second EPEP Holder',
    },
    {
      epepNumber: 'EPEP-2025-003',
      dateOfApproval: '2025-02-10',
      permitHolderName: 'Third EPEP Holder',
    },
  ],
  rehabilitationCashFund: [
    {
      dateUpdated: '2025-03-01',
      amountDeposited: '500,000.00',
      permitHolderName: 'First RCF Holder',
      savingsAccountNumber: 'RCF-1234-5678-90',
    },
    {
      dateUpdated: '2025-03-05',
      amountDeposited: '750,000.00',
      permitHolderName: 'Second RCF Holder',
      savingsAccountNumber: 'RCF-2345-6789-01',
    },
    {
      dateUpdated: '2025-03-10',
      amountDeposited: '1,000,000.00',
      permitHolderName: 'Third RCF Holder',
      savingsAccountNumber: 'RCF-3456-7890-12',
    },
  ],
  monitoringTrustFundUnified: [
    {
      dateUpdated: '2025-03-01',
      amountDeposited: '2,500,000.00',
      permitHolderName: 'First MTF Holder',
      savingsAccountNumber: 'MTF-1234-5678-90',
    },
    {
      dateUpdated: '2025-03-05',
      amountDeposited: '3,000,000.00',
      permitHolderName: 'Second MTF Holder',
      savingsAccountNumber: 'MTF-2345-6789-01',
    },
    {
      dateUpdated: '2025-03-10',
      amountDeposited: '3,500,000.00',
      permitHolderName: 'Third MTF Holder',
      savingsAccountNumber: 'MTF-3456-7890-12',
    },
  ],
  finalMineRehabilitationAndDecommissioningFund: [
    {
      dateUpdated: '2025-03-01',
      amountDeposited: '1,500,000.00',
      permitHolderName: 'First FMRDF Holder',
      savingsAccountNumber: 'FMRDF-1234-5678-90',
    },
    {
      dateUpdated: '2025-03-05',
      amountDeposited: '2,000,000.00',
      permitHolderName: 'Second FMRDF Holder',
      savingsAccountNumber: 'FMRDF-2345-6789-01',
    },
    {
      dateUpdated: '2025-03-10',
      amountDeposited: '2,500,000.00',
      permitHolderName: 'Third FMRDF Holder',
      savingsAccountNumber: 'FMRDF-3456-7890-12',
    },
  ],
  executiveSummaryOfCompliance: {
    others: { na: true, specify: '' },
    accountability: {
      remarks: 'Mining engineer is properly registered and active.',
      complied: true,
      notComplied: false,
    },
    complaintsManagement: {
      remarks:
        'Comprehensive complaints management system is in place and functioning well.',
      naForAll: false,
      caseInvestigation: true,
      complaintDocumentation: true,
      complaintReceivingSetup: true,
      implementationOfControl: true,
      communicationWithComplainantOrPublic: true,
    },
    complianceWithEpepCommitments: {
      safety: true,
      social: true,
      remarks:
        'Safety and social commitments are being followed. Rehabilitation needs improvement.',
      rehabilitation: false,
    },
    complianceWithSdmpCommitments: {
      remarks: 'SDMP requirements are being met according to schedule.',
      complied: true,
      notComplied: false,
    },
  },
  processDocumentationOfActivitiesUndertaken: {
    activities: {
      siteOcularValidation: {
        mmtMembersInvolved: [
          'Carlos Rodriguez - Site Inspector',
          'Lisa Chen - Environmental Officer',
          'Thomas White - Mining Engineer',
          'Elizabeth Harris - Geologist',
          'Christopher Martin - Environmental Scientist',
        ],
      },
      complianceWithEpepAepepConditions: {
        mmtMembersInvolved: [
          'Robert Johnson - EPEP Specialist',
          'Maria Garcia - Community Rep',
          'Patricia Martinez - Safety Inspector',
          'James Anderson - Social Development Officer',
          'Jennifer Lee - Rehabilitation Specialist',
        ],
      },
      siteValidationConfirmatorySampling: {
        none: false,
        remarks:
          'Environmental sampling conducted per DENR standards. Water, soil, and air quality samples collected at designated monitoring points. Chain of custody protocols strictly followed.',
        applicable: false,
        dateConducted: '2025-03-16',
        mmtMembersInvolved: [
          'Dr. Thomas Anderson - Laboratory Lead',
          'Lisa Martinez - Sample Coordinator',
        ],
      },
      complianceWithEccConditionsCommitments: {
        mmtMembersInvolved: [
          'John Smith - MMT Lead',
          'Jane Doe - EMB Representative',
          'David Wilson - Regional Director',
          'Sarah Thompson - Compliance Officer',
          'Michael Brown - Technical Advisor',
        ],
      },
    },
    dateConducted: '2025-03-15',
    sameDateForAllActivities: true,
    mergedMethodologyOrOtherRemarks:
      'Comprehensive site inspection conducted including all operational areas, waste management facilities, and rehabilitation sites. Weather conditions were favorable.',
  },
  complianceToProjectLocationAndCoverageLimits: {
    parameters: [
      {
        name: 'Project Location',
        remarks: 'Within permitted boundaries',
        withinSpecs: true,
        specification: { main: 'Sitio Sta. Rosa, Brgy. San Miguel' },
      },
      {
        name: 'Project Area (ha)',
        remarks: 'As per approved ECC',
        withinSpecs: true,
        specification: { main: '125.4' },
      },
      {
        name: 'Capital Cost (Php)',
        remarks: 'Updated estimate',
        withinSpecs: true,
        specification: { main: '150000000' },
      },
      {
        name: 'Type of Minerals',
        remarks: 'Primary commodity',
        withinSpecs: false,
        specification: { main: 'Nickel' },
      },
      {
        name: 'Mining Method',
        remarks: 'Conforms to EPEP',
        withinSpecs: true,
        specification: { main: 'Open pit with staged rehabilitation' },
      },
      {
        name: 'Production',
        remarks: 'Stable production',
        withinSpecs: false,
        specification: { main: '120000 tons/month' },
      },
      {
        name: 'Mine Life',
        remarks: 'Estimated remaining life',
        withinSpecs: false,
        specification: { main: '15 years' },
      },
      {
        name: 'Mineral Reserves/ Resources',
        remarks: 'Geological update 2024',
        withinSpecs: false,
        specification: { main: 'Measured: 2.5M tons' },
      },
      {
        name: 'Access/ Transportation',
        remarks: 'No encroachment',
        withinSpecs: true,
        specification: { main: 'Existing access road maintained' },
      },
      {
        name: 'Power Supply',
        remarks: 'Verified via plant inspection',
        withinSpecs: true,
        specification: {
          Port: 'Shared power line',
          main: 'On-grid with backup genset',
          Plant: '2x 1MW genset',
        },
      },
      {
        name: 'Mining Equipment',
        remarks: 'Maintained per SOP',
        withinSpecs: true,
        specification: {
          Port: 'Conveyor system',
          main: '2x excavator, 3x haul trucks',
          'Quarry/Plant': '1 crusher',
        },
      },
      {
        name: 'Work Force',
        remarks: 'Includes contractors',
        withinSpecs: false,
        specification: { main: '450 employees', Employees: '450' },
      },
      {
        name: 'Development/ Utilization Schedule',
        remarks: 'On schedule',
        withinSpecs: false,
        specification: { main: 'Phase 2 development Q3 2025' },
      },
    ],
    otherComponents: [
      {
        name: 'Waste Management Facility - Cell A',
        remarks: 'Operational',
        withinSpecs: true,
        specification: 'Waste Management Facility - Cell A',
      },
      {
        name: 'Sediment Pond - SP1',
        remarks: 'Maintenance required',
        withinSpecs: false,
        specification: 'Sediment Pond - SP1',
      },
      {
        name: 'Rehabilitation Plot - R1',
        remarks: 'Planted with native species',
        withinSpecs: true,
        specification: 'Rehabilitation Plot - R1',
      },
    ],
  },
  complianceToImpactManagementCommitments: {
    constructionInfo: [
      {
        areaName: 'Pre-Construction',
        commitments: [
          {
            isEffective: true,
            plannedMeasure: 'Pre-construction compliance',
            recommendations: '',
            actualObservation: 'yes',
          },
        ],
      },
      {
        areaName: 'Construction',
        commitments: [
          {
            isEffective: true,
            plannedMeasure: 'Construction compliance',
            recommendations: '',
            actualObservation: 'yes',
          },
        ],
      },
    ],
    overallComplianceAssessment:
      'The mining operation demonstrates strong compliance with EIA commitments and EPEP requirements. All environmental impact control strategies are being effectively implemented across quarry, plant, and port operations. Recommended areas for improvement include expanding marine monitoring coverage and continuing progressive rehabilitation efforts.',
    implementationOfEnvironmentalImpactControlStrategies: [
      {
        areaName: 'Quarry Operation',
        commitments: [
          {
            isEffective: true,
            plannedMeasure: 'Dust suppression through water spraying',
            recommendations:
              'Maintain current practices, consider additional coverage during dry season',
            actualObservation:
              'Water spraying system operational, regular application observed',
          },
          {
            isEffective: true,
            plannedMeasure: 'Progressive rehabilitation of mined-out areas',
            recommendations:
              'Continue monitoring survival rates, expand to Phase 2',
            actualObservation:
              'Rehabilitation ongoing in Phase 1 area, native species planted',
          },
          {
            isEffective: true,
            plannedMeasure: 'Noise control through equipment maintenance',
            recommendations: 'No changes required, continue monitoring',
            actualObservation:
              'Regular maintenance schedule followed, noise levels within limits',
          },
        ],
      },
      {
        areaName: 'Plant Operation',
        commitments: [
          {
            isEffective: true,
            plannedMeasure: 'Air quality monitoring and emission controls',
            recommendations:
              'Replace filters as scheduled, continue quarterly monitoring',
            actualObservation:
              'Baghouse filters operational, emissions below standards',
          },
          {
            isEffective: true,
            plannedMeasure: 'Wastewater treatment before discharge',
            recommendations: 'Maintain current treatment processes',
            actualObservation:
              'Treatment facility functioning, effluent meets DENR standards',
          },
          {
            isEffective: true,
            plannedMeasure: 'Solid waste segregation and disposal',
            recommendations: 'Continue waste audit program',
            actualObservation:
              'Segregation protocols followed, disposal records complete',
          },
        ],
      },
      {
        areaName: 'Port Operation',
        commitments: [
          {
            isEffective: true,
            plannedMeasure: 'Marine water quality monitoring',
            recommendations: 'Expand monitoring points near coral reef areas',
            actualObservation:
              'Monthly monitoring conducted, parameters within limits',
          },
          {
            isEffective: true,
            plannedMeasure: 'Spill prevention and response procedures',
            recommendations:
              'Conduct quarterly drills, update emergency contacts',
            actualObservation:
              'Spill kits positioned strategically, staff trained on response',
          },
          {
            isEffective: true,
            plannedMeasure: 'Dust control during loading operations',
            recommendations: 'Inspect enclosures monthly for wear and tear',
            actualObservation:
              'Conveyor enclosures installed, minimal dust generation observed',
          },
        ],
      },
    ],
  },
  airQualityImpactAssessment: {
    port: '',
    plant: 'Crushing and screening plant with dust suppression',
    quarry: 'Open pit mining with progressive rehabilitation',
    parameters: [
      {
        name: 'TSP (Total Suspended Particulates)',
        remarks: 'Within acceptable limits',
      },
      {
        name: 'PM2.5 (Fine Particulate Matter)',
        remarks: 'Consistently below limits',
      },
      { name: 'SO2 (Sulfur Dioxide)', remarks: 'Well within standards' },
      { name: 'NO2 (Nitrogen Dioxide)', remarks: 'Compliant' },
    ],
    samplingDate: 'March 15, 2025, 10:00 AM',
    weatherAndWind: 'Sunny, Wind speed 3-5 m/s from Northeast',
    overallAssessment:
      'Compliant - All air quality parameters are within acceptable limits as per ECC conditions and DAO 2016-08.',
    explanationForConfirmatorySampling:
      'Air quality monitoring conducted at designated stations around quarry and plant areas. All parameters measured are within DENR standards.',
  },
  waterQualityImpactAssessment: {
    port: 'Port Loading Area - North Pier',
    plant: 'Station WQ-02 (Plant wastewater treatment outlet)',
    quarry: 'Station WQ-01 (Quarry settling pond effluent)',
    parameters: [
      {
        name: 'pH',
        remark: 'Compliant',
        result: {
          internalMonitoring: {
            month: 'Month',
            readings: [{ label: 'pH', current_mgL: 7.2, previous_mgL: 7.1 }],
          },
          mmtConfirmatorySampling: { current: '7.3', previous: '7.2' },
        },
        denrStandard: {
          action: 'Within acceptable range, continue monitoring',
          redFlag: 'No',
          limit_mgL: 6,
        },
      },
      {
        name: 'TSS (Total Suspended Solids)',
        remark: 'Below threshold',
        result: {
          internalMonitoring: {
            month: 'Month',
            readings: [
              {
                label: 'TSS (Total Suspended Solids)',
                current_mgL: 42,
                previous_mgL: 45,
              },
            ],
          },
          mmtConfirmatorySampling: { current: '43 mg/L', previous: '46 mg/L' },
        },
        denrStandard: {
          action: 'Maintain sediment pond efficiency',
          redFlag: 'No',
          limit_mgL: 50,
        },
      },
      {
        name: 'BOD (Biochemical Oxygen Demand)',
        remark: 'Compliant',
        result: {
          internalMonitoring: {
            month: 'Month',
            readings: [
              {
                label: 'BOD (Biochemical Oxygen Demand)',
                current_mgL: 18,
                previous_mgL: 20,
              },
            ],
          },
          mmtConfirmatorySampling: { current: '19 mg/L', previous: '21 mg/L' },
        },
        denrStandard: {
          action: 'No action required',
          redFlag: 'No',
          limit_mgL: 30,
        },
      },
      {
        name: 'Oil and Grease',
        remark: 'Well below limit',
        result: {
          internalMonitoring: {
            month: 'Month',
            readings: [
              { label: 'Oil and Grease', current_mgL: 3.2, previous_mgL: 3.5 },
            ],
          },
          mmtConfirmatorySampling: {
            current: '3.3 mg/L',
            previous: '3.6 mg/L',
          },
        },
        denrStandard: {
          action: 'Continue oil-water separator maintenance',
          redFlag: 'No',
          limit_mgL: 5,
        },
      },
    ],
    samplingDate: 'March 15, 2025, 09:00 AM',
    weatherAndWind: 'Partly cloudy, Wind 2-4 m/s',
    parametersTable2: [
      {
        name: 'Port Loading Area - North Pier - pH',
        remark: 'Within marine water standards',
        result: {
          internalMonitoring: {
            month: 'Month',
            readings: [{ label: 'pH', current_mgL: 8.1, previous_mgL: 8 }],
          },
          mmtConfirmatorySampling: { current: '8.2', previous: '8.1' },
        },
        denrStandard: {
          action: 'Continue monitoring',
          redFlag: 'No',
          limit_mgL: 6.5,
        },
      },
      {
        name: 'Port Loading Area - North Pier - Dissolved Oxygen',
        remark: 'Adequate oxygen levels',
        result: {
          internalMonitoring: {
            month: 'Month',
            readings: [
              {
                label: 'Dissolved Oxygen',
                current_mgL: 6.8,
                previous_mgL: 6.5,
              },
            ],
          },
          mmtConfirmatorySampling: {
            current: '6.7 mg/L',
            previous: '6.6 mg/L',
          },
        },
        denrStandard: {
          action: 'No action needed',
          redFlag: 'No',
          limit_mgL: 5,
        },
      },
      {
        name: 'Port Loading Area - South Pier - Turbidity',
        remark: 'Below threshold',
        result: {
          internalMonitoring: {
            month: 'Month',
            readings: [
              { label: 'Turbidity', current_mgL: 12, previous_mgL: 14 },
            ],
          },
          mmtConfirmatorySampling: { current: '13 NTU', previous: '15 NTU' },
        },
        denrStandard: {
          action: 'Maintain dust suppression during loading',
          redFlag: 'No',
          limit_mgL: 20,
        },
      },
    ],
    overallAssessment:
      'All water quality parameters are within DENR Class C standards for industrial discharge',
    explanationForConfirmatorySampling:
      'Water sampling conducted at designated monitoring stations using standard protocols',
  },
  noiseQualityImpactAssessment: {
    parameters: [
      {
        eqpl: {
          action: 'Continue noise monitoring near residential areas',
          redFlag: 'No',
          denrStandard: '85 dB(A)',
        },
        name: 'Quarry Blasting Operations',
        results: {
          inSMR: { current: '78 dB(A)', previous: '80 dB(A)' },
          mmtConfirmatorySampling: {
            current: '77 dB(A)',
            previous: '79 dB(A)',
          },
        },
      },
      {
        eqpl: {
          action: 'Maintain acoustic barriers',
          redFlag: 'No',
          denrStandard: '85 dB(A)',
        },
        name: 'Crushing Plant Operations',
        results: {
          inSMR: { current: '72 dB(A)', previous: '74 dB(A)' },
          mmtConfirmatorySampling: {
            current: '71 dB(A)',
            previous: '73 dB(A)',
          },
        },
      },
      {
        eqpl: {
          action: 'Continue speed limits on haul roads',
          redFlag: 'No',
          denrStandard: '75 dB(A)',
        },
        name: 'Haul Truck Traffic',
        results: {
          inSMR: { current: '65 dB(A)', previous: '67 dB(A)' },
          mmtConfirmatorySampling: {
            current: '64 dB(A)',
            previous: '66 dB(A)',
          },
        },
      },
    ],
    samplingDate: 'March 15, 2025, 11:00 AM - 3:00 PM',
    weatherAndWind: 'Sunny, Wind speed 3-5 m/s from East',
    overallAssessment: {
      firstQuarter: { assessment: 'Average: 68 dB(A)' },
      thirdQuarter: { assessment: 'Average: 69 dB(A)' },
      secondQuarter: { assessment: 'Average: 70 dB(A)' },
    },
    explanationForConfirmatorySampling:
      'Noise monitoring conducted at boundary and sensitive receptor locations',
  },
  complianceWithGoodPracticeInSolidAndHazardousWasteManagement: {
    port: [
      {
        adequate: { n: false, y: true },
        typeOfWaste: 'Bilge water, Oily rags, Packaging materials',
        previousRecord: '180 liters (bilge), 0.5 tons (packaging)',
        eccEpepCommitments: {
          storage: 'Sealed drums in designated area',
          disposal: true,
          handling: 'Spill containment protocols',
        },
        q2_2025_Generated_HW: '165 liters (bilge), 0.6 tons (packaging)',
      },
      {
        adequate: { n: false, y: true },
        typeOfWaste: 'Bilge water, Oily rags, Packaging materials',
        previousRecord: '180 liters (bilge), 0.5 tons (packaging)',
        eccEpepCommitments: {
          storage: 'Secured hazmat storage',
          disposal: true,
          handling: 'Immediate bagging and labeling',
        },
        q2_2025_Generated_HW: '165 liters (bilge), 0.6 tons (packaging)',
      },
      {
        adequate: { n: false, y: true },
        typeOfWaste: 'Bilge water, Oily rags, Packaging materials',
        previousRecord: '180 liters (bilge), 0.5 tons (packaging)',
        eccEpepCommitments: {
          storage: 'Covered waste bins',
          disposal: true,
          handling: 'Segregation and compaction',
        },
        q2_2025_Generated_HW: '165 liters (bilge), 0.6 tons (packaging)',
      },
    ],
    plant: [
      {
        adequate: { n: false, y: true },
        typeOfWaste: 'Used oil, Filters, Scrap metal, Office waste',
        previousRecord: '850 liters (used oil), 12 tons (scrap)',
        eccEpepCommitments: {
          storage: 'Designated waste storage shed',
          disposal: true,
          handling: 'Segregation at source',
        },
        q2_2025_Generated_HW: '920 liters (used oil), 14 tons (scrap)',
      },
      {
        adequate: { n: false, y: true },
        typeOfWaste: 'Used oil, Filters, Scrap metal, Office waste',
        previousRecord: '850 liters (used oil), 12 tons (scrap)',
        eccEpepCommitments: {
          storage: 'Roofed and secured area',
          disposal: true,
          handling: 'Containerized collection',
        },
        q2_2025_Generated_HW: '920 liters (used oil), 14 tons (scrap)',
      },
      {
        adequate: { n: false, y: true },
        typeOfWaste: 'Used oil, Filters, Scrap metal, Office waste',
        previousRecord: '850 liters (used oil), 12 tons (scrap)',
        eccEpepCommitments: {
          storage: 'Separate biodegradable and non-biodegradable bins',
          disposal: true,
          handling: 'Regular collection schedule',
        },
        q2_2025_Generated_HW: '920 liters (used oil), 14 tons (scrap)',
      },
    ],
    quarry: [
      {
        adequate: { n: false, y: true },
        typeOfWaste: 'Overburden, Topsoil, Mine Tailings',
        previousRecord: '2,450 tons',
        eccEpepCommitments: {
          storage: 'Designated stockpile areas with erosion control',
          disposal: true,
          handling: 'Segregated handling by type',
        },
        q2_2025_Generated_HW: '2,680 tons',
      },
      {
        adequate: { n: false, y: true },
        typeOfWaste: 'Overburden, Topsoil, Mine Tailings',
        previousRecord: '2,450 tons',
        eccEpepCommitments: {
          storage: 'Temporary storage in lined containment',
          disposal: true,
          handling: 'Use of covered trucks for transport',
        },
        q2_2025_Generated_HW: '2,680 tons',
      },
      {
        adequate: { n: false, y: true },
        typeOfWaste: 'Overburden, Topsoil, Mine Tailings',
        previousRecord: '2,450 tons',
        eccEpepCommitments: {
          storage: 'Bunded storage areas',
          disposal: true,
          handling: 'Immediate containment of spills',
        },
        q2_2025_Generated_HW: '2,680 tons',
      },
    ],
  },
  complianceWithGoodPracticeInChemicalSafetyManagement: {
    chemicalSafety: {
      isNA: false,
      remarks:
        'All chemical safety protocols are in place and being followed. Regular training conducted quarterly.',
      handling: 'true',
      training: 'true',
      othersSpecify: '',
      riskManagement: 'true',
      emergencyPreparedness: 'true',
    },
    socialDevChecked: true,
    healthSafetyChecked: true,
  },
  complaintsVerificationAndManagement: [
    {
      id: '1',
      isNA: false,
      nature:
        'Noise complaint from nearby residents during blasting operations',
      dateFiled: 'January 15, 2025',
      resolutions:
        'Adjusted blasting schedule to avoid early morning hours. Provided advance notice to community. Issue resolved.',
      filedLocation: 'DENR',
    },
    {
      id: '2',
      isNA: false,
      nature: 'Dust accumulation on crops near haul road reported by farmer',
      dateFiled: 'February 20, 2025',
      resolutions:
        'Increased frequency of water spraying on haul road. Installed additional dust suppressors. Compensated affected farmer.',
      filedLocation: 'Others',
      othersSpecify: 'LGU',
    },
    {
      id: '3',
      isNA: false,
      nature:
        'Request for road maintenance on access road used by mining trucks',
      dateFiled: 'March 5, 2025',
      resolutions:
        'Agreed to co-fund road repair with LGU. Work scheduled for April 2025. Regular maintenance plan established.',
      filedLocation: 'Others',
      othersSpecify: 'Barangay',
    },
  ],
  recommendationFromPrevQuarter: {
    port: [
      {
        status: 'Completed - Repairs finished December 2024',
        commitment: 'Repairs by Q4 2024',
        recommendation: 'Repair damaged sections of pier decking',
      },
      {
        status: 'Completed - New boom deployed January 2025',
        commitment: 'Purchase and deploy new boom by Q1 2025',
        recommendation: 'Upgrade oil spill containment boom',
      },
      {
        status: 'In Progress - 50% installation complete',
        commitment: 'Install by Q1 2025',
        recommendation: 'Install CCTV cameras for security monitoring',
      },
    ],
    year: 2024,
    plant: [
      {
        status: 'Completed - Repairs finished January 2025',
        commitment: 'Complete repairs by Q1 2025',
        recommendation: 'Repair cracks in wastewater treatment pond liner',
      },
      {
        status: 'Completed - MSDS updated December 2024',
        commitment: 'Review and update by Q4 2024',
        recommendation: 'Update MSDS for all chemicals in use',
      },
      {
        status: 'In Progress - Installation ongoing',
        commitment: 'Install by Q1 2025',
        recommendation: 'Install flow meters on effluent discharge lines',
      },
    ],
    quarry: [
      {
        status: 'Completed - Slopes reinforced November 2024',
        commitment: 'Stabilization works by Q4 2024',
        recommendation: 'Stabilize haul road slopes to prevent erosion',
      },
      {
        status: 'Completed - System replaced February 2025',
        commitment: 'New system operational by Q1 2025',
        recommendation: 'Replace aging water spraying system',
      },
      {
        status: 'Ongoing - First survey completed March 2025',
        commitment: 'Quarterly monitoring starting Q1 2025',
        recommendation:
          'Conduct biodiversity monitoring in rehabilitation areas',
      },
    ],
    quarter: 4,
  },
  recommendationForNextQuarter: {
    port: [
      {
        status: '',
        commitment: 'Increase from monthly to bi-weekly sampling',
        recommendation: 'Upgrade marine water quality monitoring frequency',
      },
      {
        status: '',
        commitment: 'Project completion by Q4 2025',
        recommendation: 'Install covered conveyor system to reduce dust',
      },
      {
        status: '',
        commitment: 'Quarterly drills starting Q2 2025',
        recommendation: 'Conduct spill response drill with coast guard',
      },
    ],
    year: 2025,
    plant: [
      {
        status: '',
        commitment: 'Install new filters by end of Q3 2025',
        recommendation:
          'Upgrade baghouse filters to improve emission control efficiency',
      },
      {
        status: '',
        commitment: 'Deploy monitoring equipment by Q2 2025',
        recommendation: 'Implement real-time air quality monitoring system',
      },
      {
        status: '',
        commitment: 'Training sessions scheduled for all quarters',
        recommendation:
          'Conduct quarterly training on waste segregation protocols',
      },
    ],
    quarry: [
      {
        status: '',
        commitment: 'Begin planting native species by June 2025',
        recommendation: 'Expand progressive rehabilitation to Phase 2 area',
      },
      {
        status: '',
        commitment: 'Complete installation by May 2025',
        recommendation:
          'Install additional dust suppression misters at loading zones',
      },
      {
        status: '',
        commitment: 'Construct additional drainage channels by August 2025',
        recommendation: 'Improve drainage system to prevent siltation',
      },
    ],
    quarter: 1,
  },
  monitoringPeriodCovered: '2025-01-01 to 2025-03-31',
};
