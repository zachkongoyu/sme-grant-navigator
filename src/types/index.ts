export type SchemeId = string;

export type SchemeStatus = 'active' | 'coming-soon' | 'closed';

export type SchemeCategory =
  | 'BUD Fund'
  | 'Innovation'
  | 'Incubation'
  | 'Creative'
  | 'Financing'
  | 'Organisation Support'
  | 'Export'
  | 'Sustainability';

export type ActivityType =
  | 'advertisements'
  | 'exhibitions'
  | 'ip-registration'
  | 'testing-certification'
  | 'mobile-app'
  | 'website'
  | 'promotional-materials'
  | 'online-sales-platform';

export type IntakeFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox';

export type EligibilityOperator = 'eq' | 'lte' | 'gte' | 'truthy';

export interface IntakeFieldOption {
  readonly label: string;
  readonly value: string;
}

export interface IntakeFieldConfig {
  readonly id: keyof BusinessProfile;
  readonly label: string;
  readonly type: IntakeFieldType;
  readonly required: boolean;
  readonly placeholder?: string;
  readonly description?: string;
  readonly options?: ReadonlyArray<IntakeFieldOption>;
}

export interface EligibilityRule {
  readonly field: keyof BusinessProfile;
  readonly operator: EligibilityOperator;
  readonly value?: boolean | number | string;
  readonly message: string;
}

export interface DocumentItem {
  readonly id: string;
  readonly label: string;
  readonly stage: 'application' | 'reimbursement';
  readonly note?: string;
}

export interface SchemeLink {
  readonly label: string;
  readonly url: string;
}

export interface Scheme {
  readonly id: SchemeId;
  readonly name: string;
  readonly shortDescription: string;
  readonly category: SchemeCategory;
  readonly status: SchemeStatus;
  readonly fundingCap: number | null;
  readonly currency: 'HKD';
  readonly durationMonths: number | null;
  readonly eligibility: ReadonlyArray<EligibilityRule>;
  readonly activityTypes: ReadonlyArray<ActivityType>;
  readonly approvedMarkets: ReadonlyArray<string> | null;
  readonly intakeFields: ReadonlyArray<IntakeFieldConfig>;
  readonly promptTemplateId: string | null;
  readonly documentChecklist: ReadonlyArray<DocumentItem>;
  readonly links: ReadonlyArray<SchemeLink>;
}

export interface BusinessProfile {
  readonly companyName: string;
  readonly businessRegistrationNumber: string;
  readonly industry: string;
  readonly employeeCount: number;
  readonly annualTurnover: number;
  readonly isListedCompany: boolean;
  readonly hasSubstantiveOperationsInHongKong: boolean;
  readonly targetMarkets: ReadonlyArray<string>;
  readonly plannedActivities: ReadonlyArray<ActivityType>;
  readonly estimatedProjectBudget: number;
  readonly projectDurationMonths: number;
  readonly businessGoal: string;
  readonly hasPriorBudFunding: boolean;
  readonly currentBudProjectsFunding?: number;
  readonly cumulativeBudFundingReceived?: number;
}

export interface EligibilityResult {
  readonly isEligible: boolean;
  readonly score: number;
  readonly summary: string;
  readonly flags: ReadonlyArray<string>;
}

export interface DraftSection {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly isFree: boolean;
}

export interface Draft {
  readonly id: string;
  readonly schemeId: SchemeId;
  readonly sessionToken: string;
  readonly businessProfile: BusinessProfile;
  readonly sections: ReadonlyArray<DraftSection>;
  readonly paid: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly stripePaymentIntentId?: string;
}