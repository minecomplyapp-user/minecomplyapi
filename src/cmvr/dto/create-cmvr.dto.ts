import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
  IsBoolean,
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

class AirQualityParameterDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsOptional()
  results: any;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsOptional()
  eqpl: any;

  @ApiProperty()
  @IsString()
  remarks: string;
}

class AirQualityImpactAssessmentDto {
  @ApiProperty()
  @IsString()
  quarry: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  quarryPlant?: string;

  @ApiProperty()
  @IsString()
  plant: string;

  @ApiProperty()
  @IsString()
  port: string;

  @ApiProperty({ type: [AirQualityParameterDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AirQualityParameterDto)
  parameters: AirQualityParameterDto[];

  @ApiProperty()
  @IsString()
  samplingDate: string;

  @ApiProperty()
  @IsString()
  weatherAndWind: string;

  @ApiProperty()
  @IsString()
  explanationForConfirmatorySampling: string;

  @ApiProperty()
  @IsString()
  overallAssessment: string;
}

class WaterQualityReadingDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsNumber()
  current_mgL: number;

  @ApiProperty()
  @IsNumber()
  previous_mgL: number;
}

class InternalMonitoringDto {
  @ApiProperty()
  @IsString()
  month: string;

  @ApiProperty({ type: [WaterQualityReadingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaterQualityReadingDto)
  readings: WaterQualityReadingDto[];
}

class MMTConfirmatorySamplingDto {
  @ApiProperty()
  @IsString()
  current: string;

  @ApiProperty()
  @IsString()
  previous: string;
}

class WaterQualityResultDto {
  @ApiProperty({ type: InternalMonitoringDto })
  @ValidateNested()
  @Type(() => InternalMonitoringDto)
  internalMonitoring: InternalMonitoringDto;

  @ApiProperty({ type: MMTConfirmatorySamplingDto })
  @ValidateNested()
  @Type(() => MMTConfirmatorySamplingDto)
  mmtConfirmatorySampling: MMTConfirmatorySamplingDto;
}

class DENRStandardDto {
  @ApiProperty()
  @IsString()
  redFlag: string;

  @ApiProperty()
  @IsString()
  action: string;

  @ApiProperty()
  @IsNumber()
  limit_mgL: number;
}

class WaterQualityParameterDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: WaterQualityResultDto })
  @ValidateNested()
  @Type(() => WaterQualityResultDto)
  result: WaterQualityResultDto;

  @ApiProperty({ type: DENRStandardDto })
  @ValidateNested()
  @Type(() => DENRStandardDto)
  denrStandard: DENRStandardDto;

  @ApiProperty()
  @IsString()
  remark: string;
}

class WaterQualityImpactAssessmentDto {
  @ApiProperty()
  @IsString()
  quarry: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  quarryPlant?: string;

  @ApiProperty()
  @IsString()
  plant: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  port?: string;

  @ApiProperty({ type: [WaterQualityParameterDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaterQualityParameterDto)
  parameters: WaterQualityParameterDto[];

  @ApiProperty({ type: [WaterQualityParameterDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaterQualityParameterDto)
  parametersTable2?: WaterQualityParameterDto[];

  @ApiProperty()
  @IsString()
  samplingDate: string;

  @ApiProperty()
  @IsString()
  weatherAndWind: string;

  @ApiProperty()
  @IsString()
  explanationForConfirmatorySampling: string;

  @ApiProperty()
  @IsString()
  overallAssessment: string;
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
}

export class CreateCMVRDto {
  @ApiProperty()
  @IsString()
  companyName: string;

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
}
