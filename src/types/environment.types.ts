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
