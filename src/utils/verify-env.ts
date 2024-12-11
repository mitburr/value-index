import { config } from 'dotenv';
import { logger } from './logger';
import path from 'path';

export function verifyEnv(): void {
  // Find project root (where .env should be)
  const rootPath = path.join(__dirname, '../..');

  const result = config({
    path: path.join(rootPath, '.env')
  });

  if (result.error) {
    logger.error('Failed to load .env file');
    throw result.error;
  }

  const requiredVars = [
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_DB',
    'POSTGRES_TEST_DB'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    throw new Error('Missing required environment variables');
  }

  logger.success('Environment variables loaded successfully');
}