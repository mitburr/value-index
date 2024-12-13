import { config } from 'dotenv';
import { verifyEnv } from '../utils/verify-env.ts';

interface DatabaseSettings {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
}

// Keep only one Settings interface definition
interface Settings {
  database: DatabaseSettings;
  testDatabase: DatabaseSettings;
  logging: {
    level: string;
    file: string;
  };
  retailers: Record<string, {
    apiKey: string;
    baseUrl: string;
    rateLimit: number;
  }>;
}

verifyEnv();
config();

function validateEnvVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

export const settings: Settings = {
  database: {
    user: validateEnvVariable('POSTGRES_USER'),
    password: validateEnvVariable('POSTGRES_PASSWORD'),
    host: validateEnvVariable('POSTGRES_HOST'),
    port: Number(validateEnvVariable('POSTGRES_PORT')),
    database: validateEnvVariable('POSTGRES_DB')
  },
  testDatabase: {
    user: validateEnvVariable('POSTGRES_USER'),
    password: validateEnvVariable('POSTGRES_PASSWORD'),
    host: validateEnvVariable('POSTGRES_HOST'),
    port: Number(validateEnvVariable('POSTGRES_PORT')),
    database: validateEnvVariable('POSTGRES_TEST_DB')
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'app.log'
  },
  retailers: {

    bestBuy: {
      apiKey: validateEnvVariable('BESTBUY_API_KEY'),
      baseUrl: validateEnvVariable('BESTBUY_BASE_URL'),
      rateLimit: 10
    }
    // Add your retailer configurations here
  }
};