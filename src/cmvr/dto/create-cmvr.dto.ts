import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
  IsBoolean,
  IsObject,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

class ECCDto {
  @ApiProperty()
  @IsString()
  permitHolderName: string;

  @ApiProperty()
  @IsString()
  eccNumber: string;

  @ApiProperty()
  @IsString()
  dateOfIssuance: string;
}

class ISAGMPPDto {
  @ApiProperty()
  @IsString()
  permitHolderName: string;

  @ApiProperty()
  @IsString()
  isagPermitNumber: string;

  @ApiProperty()
  @IsString()
  dateOfIssuance: string;
}

class ContactInfoDto {
  @ApiProperty()
  @IsString()
  contactPersonAndPosition: string;

  @ApiProperty()
  @IsString()
  mailingAddress: string;

  @ApiProperty()
  @IsString()
  telephoneFax: string;

  @ApiProperty()
  @IsString()
  emailAddress: string;
}

class EPEPDto {
  @ApiProperty()
  @IsString()
  permitHolderName: string;

  @ApiProperty()
  @IsString()
  epepNumber: string;

  @ApiProperty()
  @IsString()
  dateOfApproval: string;
}

class FundDto {
  @ApiProperty()
  @IsString()
  permitHolderName: string;

  @ApiProperty()
  @IsString()
  savingsAccountNumber: string;

  @ApiProperty()
  @IsString()
  amountDeposited: string;

  @ApiProperty()
  @IsString()
  dateUpdated: string;
}

class ComplianceWithEpepCommitmentsDto {
  @ApiProperty()
  @IsBoolean()
  safety: boolean;

  @ApiProperty()
  @IsBoolean()
  social: boolean;

  @ApiProperty()
  @IsBoolean()
  rehabilitation: boolean;

  @ApiProperty()
  @IsString()
  remarks: string;
}

class ComplianceWithSdmpCommitmentsDto {
  @ApiProperty()
  @IsBoolean()
  complied: boolean;

  @ApiProperty()
  @IsBoolean()
  notComplied: boolean;

  @ApiProperty()
  @IsString()
  remarks: string;
}

class ComplaintsManagementDto {
  @ApiProperty()
  @IsBoolean()
  naForAll: boolean;

  @ApiProperty()
  @IsBoolean()
  complaintReceivingSetup: boolean;

  @ApiProperty()
  @IsBoolean()
  caseInvestigation: boolean;

  @ApiProperty()
  @IsBoolean()
  implementationOfControl: boolean;

  @ApiProperty()
  @IsBoolean()
  communicationWithComplainantOrPublic: boolean;

  @ApiProperty()
  @IsBoolean()
  complaintDocumentation: boolean;

  @ApiProperty()
  @IsString()
  remarks: string;
}

class AccountabilityDto {
  @ApiProperty()
  @IsBoolean()
  complied: boolean;

  @ApiProperty()
  @IsBoolean()
  notComplied: boolean;

  @ApiProperty()
  @IsString()
  remarks: string;
}

class OthersDto {
  @ApiProperty()
  @IsString()
  specify: string;

  @ApiProperty()
  @IsBoolean()
  na: boolean;
}

class ExecutiveSummaryOfComplianceDto {
  @ApiProperty({ type: ComplianceWithEpepCommitmentsDto })
  @ValidateNested()
  @Type(() => ComplianceWithEpepCommitmentsDto)
  complianceWithEpepCommitments: ComplianceWithEpepCommitmentsDto;

  @ApiProperty({ type: ComplianceWithSdmpCommitmentsDto })
  @ValidateNested()
  @Type(() => ComplianceWithSdmpCommitmentsDto)
  complianceWithSdmpCommitments: ComplianceWithSdmpCommitmentsDto;

  @ApiProperty({ type: ComplaintsManagementDto })
  @ValidateNested()
  @Type(() => ComplaintsManagementDto)
  complaintsManagement: ComplaintsManagementDto;

  @ApiProperty({ type: AccountabilityDto })
  @ValidateNested()
  @Type(() => AccountabilityDto)
  accountability: AccountabilityDto;

  @ApiProperty({ type: OthersDto })
  @ValidateNested()
  @Type(() => OthersDto)
  others: OthersDto;
}

class ActivityDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  mmtMembersInvolved: string[];
}

class SiteValidationConfirmatorySamplingDto extends ActivityDto {
  @ApiProperty()
  @IsString()
  dateConducted: string;

  @ApiProperty()
  @IsBoolean()
  applicable: boolean;

  @ApiProperty()
  @IsBoolean()
  none: boolean;

  @ApiProperty()
  @IsString()
  remarks: string;
}

class ActivitiesDto {
  @ApiProperty({ type: ActivityDto })
  @ValidateNested()
  @Type(() => ActivityDto)
  complianceWithEccConditionsCommitments: ActivityDto;

  @ApiProperty({ type: ActivityDto })
  @ValidateNested()
  @Type(() => ActivityDto)
  complianceWithEpepAepepConditions: ActivityDto;

  @ApiProperty({ type: ActivityDto })
  @ValidateNested()
  @Type(() => ActivityDto)
  siteOcularValidation: ActivityDto;

  @ApiProperty({ type: SiteValidationConfirmatorySamplingDto })
  @ValidateNested()
  @Type(() => SiteValidationConfirmatorySamplingDto)
  siteValidationConfirmatorySampling: SiteValidationConfirmatorySamplingDto;
}

class ProcessDocumentationOfActivitiesUndertakenDto {
  @ApiProperty()
  @IsString()
  dateConducted: string;

  @ApiProperty()
  @IsString()
  mergedMethodologyOrOtherRemarks: string;

  @ApiProperty()
  @IsBoolean()
  sameDateForAllActivities: boolean;

  @ApiProperty({ type: ActivitiesDto })
  @ValidateNested()
  @Type(() => ActivitiesDto)
  activities: ActivitiesDto;
}

class ComplianceParameterDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsOptional()
  specification: any;

  @ApiProperty()
  @IsString()
  remarks: string;

  @ApiProperty()
  @IsBoolean()
  withinSpecs: boolean;
}

class OtherComponentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  specification: string;

  @ApiProperty()
  @IsString()
  remarks: string;

  @ApiProperty()
  @IsBoolean()
  withinSpecs: boolean;
}

class ComplianceToProjectLocationAndCoverageLimitsDto {
  @ApiProperty({ type: [ComplianceParameterDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComplianceParameterDto)
  parameters: ComplianceParameterDto[];

  @ApiProperty({ type: [OtherComponentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OtherComponentDto)
  otherComponents: OtherComponentDto[];

  @ApiProperty({
    required: false,
    description: 'Uploaded project location images',
  })
  @IsOptional()
  @IsObject()
  uploadedImages?: Record<string, string>;
}

class CommitmentDto {
  @ApiProperty()
  @IsString()
  plannedMeasure: string;

  @ApiProperty()
  @IsString()
  actualObservation: string;

  @ApiProperty()
  @IsBoolean()
  isEffective: boolean;

  @ApiProperty()
  @IsString()
  recommendations: string;
}

class AreaCommitmentDto {
  @ApiProperty()
  @IsString()
  areaName: string;

  @ApiProperty({ type: [CommitmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommitmentDto)
  commitments: CommitmentDto[];
}

class ComplianceToImpactManagementCommitmentsDto {
  @ApiProperty({ type: [AreaCommitmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AreaCommitmentDto)
  constructionInfo: AreaCommitmentDto[];

  @ApiProperty({ type: [AreaCommitmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AreaCommitmentDto)
  implementationOfEnvironmentalImpactControlStrategies: AreaCommitmentDto[];

  @ApiProperty()
  @IsString()
  overallComplianceAssessment: string;
}

class AirQualityResultsDto {
  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  inSMR: {
    current: string;
    previous: string;
  };

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  mmtConfirmatorySampling: {
    current: string;
    previous: string;
  };
}

class AirQualityEqplDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  redFlag?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  limit?: string;
}

class AirQualityParameterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ type: AirQualityResultsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AirQualityResultsDto)
  results?: AirQualityResultsDto;

  @ApiProperty({ type: AirQualityEqplDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AirQualityEqplDto)
  eqpl?: AirQualityEqplDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}

class AirQualityLocationDataDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  locationDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  locationInput?: string;

  @ApiProperty({ type: [AirQualityParameterDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AirQualityParameterDto)
  parameters?: AirQualityParameterDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  samplingDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  weatherAndWind?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  explanationForConfirmatorySampling?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  overallAssessment?: string;
}

class AirQualityImpactAssessmentDto {
  // New structure: location descriptions as strings (for backward compatibility with old structure as objects)
  @ApiProperty({
    required: false,
    description:
      'Quarry location description (new structure) or location data object (old structure)',
  })
  @IsOptional()
  quarry?: string | AirQualityLocationDataDto;

  @ApiProperty({
    required: false,
    description:
      'Plant location description (new structure) or location data object (old structure)',
  })
  @IsOptional()
  plant?: string | AirQualityLocationDataDto;

  @ApiProperty({
    required: false,
    description: 'Quarry / Plant location description (new structure)',
  })
  @IsOptional()
  @IsString()
  quarryPlant?: string;

  @ApiProperty({
    required: false,
    description:
      'Port location description (new structure) or location data object (old structure)',
  })
  @IsOptional()
  port?: string | AirQualityLocationDataDto;

  // Checkbox states for enabling/disabling inputs
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  quarryEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  plantEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  quarryPlantEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  portEnabled?: boolean;

  // Unified air quality monitoring data (new structure)
  @ApiProperty({ type: AirQualityLocationDataDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AirQualityLocationDataDto)
  airQuality?: AirQualityLocationDataDto;

  // For backward compatibility: keep old quarryAndPlant field
  @ApiProperty({ type: AirQualityLocationDataDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AirQualityLocationDataDto)
  quarryAndPlant?: AirQualityLocationDataDto;
}

class WaterQualityReadingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  current_mgL?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  previous_mgL?: number;
}

class InternalMonitoringDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiProperty({ type: [WaterQualityReadingDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaterQualityReadingDto)
  readings?: WaterQualityReadingDto[];
}

class MMTConfirmatorySamplingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  current?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  previous?: string;
}

class WaterQualityResultDto {
  @ApiProperty({ type: InternalMonitoringDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => InternalMonitoringDto)
  internalMonitoring?: InternalMonitoringDto;

  @ApiProperty({ type: MMTConfirmatorySamplingDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MMTConfirmatorySamplingDto)
  mmtConfirmatorySampling?: MMTConfirmatorySamplingDto;
}

class DENRStandardDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  redFlag?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  limit_mgL?: number;
}

class WaterQualityParameterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ type: WaterQualityResultDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WaterQualityResultDto)
  result?: WaterQualityResultDto;

  @ApiProperty({ type: DENRStandardDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DENRStandardDto)
  denrStandard?: DENRStandardDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

class WaterQualityLocationDataDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  locationDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  locationInput?: string;

  @ApiProperty({ type: [WaterQualityParameterDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaterQualityParameterDto)
  parameters?: WaterQualityParameterDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  samplingDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  weatherAndWind?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  explanationForConfirmatorySampling?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  overallAssessment?: string;
}

class WaterQualityImpactAssessmentDto {
  // New structure: location descriptions as strings
  @ApiProperty({
    required: false,
    description: 'Quarry location description (new structure)',
  })
  @IsOptional()
  @IsString()
  quarry?: string | WaterQualityLocationDataDto;

  @ApiProperty({
    required: false,
    description: 'Plant location description (new structure)',
  })
  @IsOptional()
  @IsString()
  plant?: string | WaterQualityLocationDataDto;

  @ApiProperty({
    required: false,
    description: 'Quarry / Plant location description (new structure)',
  })
  @IsOptional()
  @IsString()
  quarryPlant?: string;

  // Checkbox states for enabling/disabling inputs
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  quarryEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  plantEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  quarryPlantEnabled?: boolean;

  // New structure: unified water quality data
  @ApiProperty({ type: WaterQualityLocationDataDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WaterQualityLocationDataDto)
  waterQuality?: WaterQualityLocationDataDto;

  // Old structure support (deprecated)
  @ApiProperty({ type: WaterQualityLocationDataDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WaterQualityLocationDataDto)
  quarryAndPlant?: WaterQualityLocationDataDto;

  @ApiProperty({ type: WaterQualityLocationDataDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WaterQualityLocationDataDto)
  port?: WaterQualityLocationDataDto;
}

class NoiseQualityEqplDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  redFlag?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  denrStandard?: string;
}

class NoiseQualityResultsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  inSMR?: {
    current?: string;
    previous?: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  mmtConfirmatorySampling?: {
    current?: string;
    previous?: string;
  };
}

class NoiseQualityParameterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isParameterNA?: boolean;

  @ApiProperty({ type: NoiseQualityResultsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => NoiseQualityResultsDto)
  results?: NoiseQualityResultsDto;

  @ApiProperty({ type: NoiseQualityEqplDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => NoiseQualityEqplDto)
  eqpl?: NoiseQualityEqplDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}

class QuarterlyAssessmentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assessment?: string;
}

class OverallAssessmentDto {
  @ApiProperty({ type: QuarterlyAssessmentDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuarterlyAssessmentDto)
  firstQuarter?: QuarterlyAssessmentDto;

  @ApiProperty({ type: QuarterlyAssessmentDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuarterlyAssessmentDto)
  secondQuarter?: QuarterlyAssessmentDto;

  @ApiProperty({ type: QuarterlyAssessmentDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuarterlyAssessmentDto)
  thirdQuarter?: QuarterlyAssessmentDto;

  @ApiProperty({ type: QuarterlyAssessmentDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuarterlyAssessmentDto)
  fourthQuarter?: QuarterlyAssessmentDto;
}

class NoiseQualityImpactAssessmentDto {
  @ApiProperty({ type: [NoiseQualityParameterDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NoiseQualityParameterDto)
  parameters?: NoiseQualityParameterDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  samplingDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  weatherAndWind?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  explanationForConfirmatorySampling?: string;

  @ApiProperty({ type: OverallAssessmentDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => OverallAssessmentDto)
  overallAssessment?: OverallAssessmentDto;

  @ApiProperty({
    required: false,
    description: 'Uploaded noise quality monitoring files',
  })
  @IsOptional()
  @IsArray()
  uploadedFiles?: Array<{
    uri: string;
    name: string;
    size?: number;
    mimeType?: string;
    storagePath?: string;
  }>;
}

class WasteCommitmentsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  handling?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  storage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  disposal?: boolean;
}

class WasteAdequateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  y?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  n?: boolean;
}

class WasteItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  typeOfWaste?: string;

  @ApiProperty({ type: WasteCommitmentsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WasteCommitmentsDto)
  eccEpepCommitments?: WasteCommitmentsDto;

  @ApiProperty({ type: WasteAdequateDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WasteAdequateDto)
  adequate?: WasteAdequateDto;

  @ApiProperty({ required: false })
  @IsOptional()
  previousRecord?: string | Record<string, number>;

  @ApiProperty({ required: false })
  @IsOptional()
  q2_2025_Generated_HW?: string | Record<string, number>;

  @ApiProperty({ required: false })
  @IsOptional()
  total?: string | Record<string, number>;
}

class ComplianceWithGoodPracticeInSolidAndHazardousWasteManagementDto {
  @ApiProperty({ required: false })
  @IsOptional()
  quarry?: string | WasteItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  plant?: string | WasteItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  port?: string | WasteItemDto[];
}

class ChemicalSafetyDataDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isNA?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  riskManagement?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  training?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  handling?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyPreparedness?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  chemicalCategory?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  othersSpecify?: string;
}

class ComplianceWithGoodPracticeInChemicalSafetyManagementDto {
  @ApiProperty({ type: ChemicalSafetyDataDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ChemicalSafetyDataDto)
  chemicalSafety?: ChemicalSafetyDataDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  healthSafetyChecked?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  socialDevChecked?: boolean;
}

class ComplaintsVerificationAndManagementDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isNA?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateFiled?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  filedLocation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  othersSpecify?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nature?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resolutions?: string;
}

class RecommendationItemDto {
  @ApiProperty({ description: 'The recommendation text', required: false })
  @IsOptional()
  @IsString()
  recommendation?: string;

  @ApiProperty({
    description: 'The commitment or action plan',
    required: false,
  })
  @IsOptional()
  @IsString()
  commitment?: string;

  @ApiProperty({
    description:
      'Status of the recommendation (e.g., Ongoing, Completed, In Progress)',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}

class RecommendationsSectionDto {
  @ApiProperty({ description: 'Quarter number (1, 2, 3, 4)', required: false })
  @IsOptional()
  @IsNumber()
  quarter?: number;

  @ApiProperty({ description: 'Year', required: false })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({
    type: [RecommendationItemDto],
    description: 'Plant recommendations',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendationItemDto)
  plant?: RecommendationItemDto[];

  @ApiProperty({
    type: [RecommendationItemDto],
    description: 'Quarry recommendations',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendationItemDto)
  quarry?: RecommendationItemDto[];

  @ApiProperty({
    type: [RecommendationItemDto],
    description: 'Port recommendations',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendationItemDto)
  port?: RecommendationItemDto[];
}

class ComplianceMonitoringReportDto {
  @ApiProperty({ type: ComplianceToProjectLocationAndCoverageLimitsDto })
  @ValidateNested()
  @Type(() => ComplianceToProjectLocationAndCoverageLimitsDto)
  complianceToProjectLocationAndCoverageLimits: ComplianceToProjectLocationAndCoverageLimitsDto;

  @ApiProperty({ type: ComplianceToImpactManagementCommitmentsDto })
  @ValidateNested()
  @Type(() => ComplianceToImpactManagementCommitmentsDto)
  complianceToImpactManagementCommitments: ComplianceToImpactManagementCommitmentsDto;

  @ApiProperty({ type: AirQualityImpactAssessmentDto })
  @ValidateNested()
  @Type(() => AirQualityImpactAssessmentDto)
  airQualityImpactAssessment: AirQualityImpactAssessmentDto;

  @ApiProperty({ type: WaterQualityImpactAssessmentDto })
  @ValidateNested()
  @Type(() => WaterQualityImpactAssessmentDto)
  waterQualityImpactAssessment: WaterQualityImpactAssessmentDto;

  @ApiProperty({ type: NoiseQualityImpactAssessmentDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => NoiseQualityImpactAssessmentDto)
  noiseQualityImpactAssessment?: NoiseQualityImpactAssessmentDto;

  @ApiProperty({
    type: ComplianceWithGoodPracticeInSolidAndHazardousWasteManagementDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ComplianceWithGoodPracticeInSolidAndHazardousWasteManagementDto)
  complianceWithGoodPracticeInSolidAndHazardousWasteManagement?: ComplianceWithGoodPracticeInSolidAndHazardousWasteManagementDto;

  @ApiProperty({
    type: ComplianceWithGoodPracticeInChemicalSafetyManagementDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ComplianceWithGoodPracticeInChemicalSafetyManagementDto)
  complianceWithGoodPracticeInChemicalSafetyManagement?: ComplianceWithGoodPracticeInChemicalSafetyManagementDto;

  @ApiProperty({
    type: [ComplaintsVerificationAndManagementDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComplaintsVerificationAndManagementDto)
  complaintsVerificationAndManagement?: ComplaintsVerificationAndManagementDto[];

  @ApiProperty({ type: RecommendationsSectionDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecommendationsSectionDto)
  recommendationFromPrevQuarter?: RecommendationsSectionDto;

  @ApiProperty({ type: RecommendationsSectionDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecommendationsSectionDto)
  recommendationForNextQuarter?: RecommendationsSectionDto;
}

class CMVRAttachmentDto {
  @ApiProperty({ description: 'Storage path of the uploaded attachment' })
  @IsString()
  path: string;

  @ApiProperty({
    required: false,
    description: 'Optional caption or description for the attachment',
  })
  @IsOptional()
  @IsString()
  caption?: string;
}

export class CreateCMVRDto {
  // ✅ NEW: Permit holder type selection (single vs multiple)
  @ApiProperty({
    enum: ['single', 'multiple'],
    required: false,
    description: 'Type of permit holder report: single or multiple',
    default: 'single',
  })
  @IsOptional()
  @IsEnum(['single', 'multiple'])
  permitHolderType?: 'single' | 'multiple';

  @ApiProperty()
  @IsString()
  companyName: string;

  @ApiProperty({
    type: [String],
    required: false,
    description: 'List of permit holder names for dropdown options',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permitHolderList?: string[];

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsString()
  quarter: string;

  @ApiProperty()
  @IsNumber()
  year: number;

  @ApiProperty()
  @IsString()
  dateOfComplianceMonitoringAndValidation: string;

  @ApiProperty()
  @IsString()
  monitoringPeriodCovered: string;

  @ApiProperty()
  @IsString()
  dateOfCmrSubmission: string;

  @ApiProperty({ type: [ECCDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ECCDto)
  ecc: ECCDto[];

  @ApiProperty({ type: [ISAGMPPDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ISAGMPPDto)
  isagMpp: ISAGMPPDto[];

  @ApiProperty()
  @IsString()
  projectCurrentName: string;

  @ApiProperty()
  @IsString()
  projectNameInEcc: string;

  @ApiProperty()
  @IsString()
  projectStatus: string;

  @ApiProperty()
  @IsString()
  projectGeographicalCoordinates: string;

  @ApiProperty({ type: ContactInfoDto })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  proponent: ContactInfoDto;

  @ApiProperty({ type: ContactInfoDto })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  mmt: ContactInfoDto;

  @ApiProperty()
  @IsString()
  epepFmrdpStatus: string;

  @ApiProperty({ type: [EPEPDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EPEPDto)
  epep: EPEPDto[];

  @ApiProperty({ type: [FundDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FundDto)
  rehabilitationCashFund: FundDto[];

  @ApiProperty({ type: [FundDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FundDto)
  monitoringTrustFundUnified: FundDto[];

  @ApiProperty({ type: [FundDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FundDto)
  finalMineRehabilitationAndDecommissioningFund: FundDto[];

  @ApiProperty({ type: ExecutiveSummaryOfComplianceDto })
  @ValidateNested()
  @Type(() => ExecutiveSummaryOfComplianceDto)
  executiveSummaryOfCompliance: ExecutiveSummaryOfComplianceDto;

  @ApiProperty({ type: ProcessDocumentationOfActivitiesUndertakenDto })
  @ValidateNested()
  @Type(() => ProcessDocumentationOfActivitiesUndertakenDto)
  processDocumentationOfActivitiesUndertaken: ProcessDocumentationOfActivitiesUndertakenDto;

  @ApiProperty({ type: ComplianceMonitoringReportDto })
  @ValidateNested()
  @Type(() => ComplianceMonitoringReportDto)
  complianceMonitoringReport: ComplianceMonitoringReportDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  createdById?: string;

  @ApiProperty({
    required: false,
    description: 'Attendance record ID to attach',
  })
  @IsOptional()
  @IsString()
  attendanceId?: string;

  @ApiProperty({
    required: false,
    description: 'Array of attachments with path and caption',
    type: [CMVRAttachmentDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CMVRAttachmentDto)
  attachments?: CMVRAttachmentDto[];

  @ApiProperty({
    required: false,
    description: 'ECC Conditions document attachment info',
  })
  @IsOptional()
  @IsObject()
  eccConditionsAttachment?: {
    fileName?: string;
    fileUrl?: string;
    mimeType?: string;
    storagePath?: string;
  };
}
