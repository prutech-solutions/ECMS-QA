import * as dotenv from 'dotenv';
import * as path from 'path';
import type { SalesforceEnvironment, TestConfig } from '../types/environment.types.js';

function loadEnvFile(): string {
  const sfEnv = process.env.SF_ENV || '';
  const envFile = sfEnv ? `.env.${sfEnv}` : '.env';
  const envPath = path.resolve(process.cwd(), envFile);
  dotenv.config({ path: envPath });
  return sfEnv || 'default';
}

export function getEnvironment(): SalesforceEnvironment {
  return {
    baseUrl: requireEnv('SF_BASE_URL'),
    loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
    sessionId: process.env.SF_SESSION_ID,
  };
}

export function getTestConfig(): TestConfig {
  const envName = loadEnvFile();
  return {
    environment: getEnvironment(),
    captureDocsEnabled: process.env.CAPTURE_DOCS === 'true',
    envName,
  };
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Check your .env file or set SF_ENV to load the correct config.`
    );
  }
  return value;
}
