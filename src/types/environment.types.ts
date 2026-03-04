export interface SalesforceEnvironment {
  baseUrl: string;
  loginUrl: string;
  /** Salesforce session ID — used for CI or token-based auth */
  sessionId?: string;
}

export interface TestConfig {
  environment: SalesforceEnvironment;
  captureDocsEnabled: boolean;
  envName: string;
}

/** Persona identifiers used in fixtures and auth setup */
export type PersonaKey =
  | 'budget-creator'
  | 'invoice-manager'
  | 'site-manager'
  | 'vendor-admin'
  | 'enrollment-manager'
  | 'attendance-taker'
  | 'affiliation-manager'
  | 'education-specialist'
  | 'family-worker'
  | 'education-director'
  | 'monitoring-specialist'
  | 'student-screener'
  | 'checklist-manager'
  | 'classroom-creator'
  | 'internal-admin'
  | 'system-admin'
  | 'enrollment-specialist'
  | 'checklist-viewer';
