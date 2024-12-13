// src/services/shared/utils/verify-env.ts
import { config, DotenvConfigOptions } from 'dotenv';
import { logger } from './logger';

import { search } from 'u/file-name-search';
import { SearchErrors } from '../types/errors';

let options: DotenvConfigOptions

try {
  const envPath = await search.findFile('.env');
  logger.info(`Found file at: ${envPath}`, 'info');
  options = {
      path: envPath
  }

} catch (error) {
  if (error instanceof SearchErrors.FileNotFoundException) {
    throw SearchErrors.FileNotFoundException
  } else if (error instanceof SearchErrors.MultipleFilesFoundException) {
    throw SearchErrors.MultipleFilesFoundException
  }
}

export function verifyEnv(): void {
 const result = config(options);

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