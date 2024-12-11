import { config } from 'dotenv';
import { verifyEnv } from '../utils/verify-env';

verifyEnv();  // Call before settings configuration

config();

function validateEnvVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

interface DatabaseSettings {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
}

interface Settings {
  database: DatabaseSettings;
  testDatabase: DatabaseSettings;
  logging: {
    level: string;
    file: string;
  };
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
  }
};