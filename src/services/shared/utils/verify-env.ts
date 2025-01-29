// src/services/shared/utils/verify-env.ts
import { config, DotenvConfigOptions } from 'dotenv';
import { logger } from './logger';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

async function findRootEnvFile(): Promise<string> {
  // Get the directory of the current file
  const currentDir = dirname(fileURLToPath(import.meta.url));

  // Navigate up to the project root (3 levels up from src/services/shared/utils)
  const projectRoot = join(currentDir, '..', '..', '..', '..');

  // Return the path to the root .env file
  return join(projectRoot, '.env');
}

export async function verifyEnv(): Promise<void> {
  try {
    const envPath = await findRootEnvFile();
    logger.info(`Using .env file at: ${envPath}`);

    const result = config({
      path: envPath
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
  } catch (error) {
    logger.error(`Failed to verify environment: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}