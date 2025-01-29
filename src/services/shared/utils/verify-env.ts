// src/services/shared/utils/verify-env.ts
import { config, DotenvConfigOptions } from 'dotenv';
import { logger } from './logger';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

async function findRootEnvFile(): Promise<string> {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const projectRoot = join(currentDir, '..', '..', '..', '..');
  return join(projectRoot, '.env');
}

export async function verifyEnv(skipFileLoad = false): Promise<void> {
  try {
    if (!skipFileLoad) {
      const envPath = await findRootEnvFile();
      logger.info(`Using .env file at: ${envPath}`);

      const result = config({
        path: envPath
      });

      if (result.error) {
        logger.error('Failed to load .env file');
        throw result.error;
      }
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