// src/services/shared/utils/search.ts

import { readdir, access } from 'fs/promises';
import { join, resolve, relative, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger';
import { SearchErrors } from '../types/errors';

export class SearchService {
  private async findProjectRoot(startPath: string): Promise<string> {
    let currentPath = startPath;

    while (currentPath !== '/') {
      try {
        await access(join(currentPath, 'package.json'));
        return currentPath;
      } catch {
        currentPath = dirname(currentPath);
      }
    }

    throw new Error('Could not find project root (no package.json found in parent directories)');
  }

  private async searchDirectory(dir: string, targetFileName: string): Promise<string[]> {
    const results: string[] = [];

    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and .git directories
          if (entry.name === 'node_modules' || entry.name === '.git') {
            logger.debug(`Skipping directory: ${entry.name}`);
            continue;
          }

          const subDirResults = await this.searchDirectory(fullPath, targetFileName);
          results.push(...subDirResults);
        } else if (entry.name === targetFileName) {
          // Convert absolute path to relative path from current working directory
          const relativePath = relative(process.cwd(), fullPath);
          results.push(relativePath);
        }
      }
    } catch (error) {
      logger.error(`Error searching directory ${dir}: ${error instanceof Error ? error.message : String(error)}`);
    }

    return results;
  }

  private async findDirectoryContents(dirPath: string): Promise<string[]> {
    const results: string[] = [];

    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Recursively get contents of subdirectories
          const subDirResults = await this.findDirectoryContents(fullPath);
          results.push(...subDirResults);
        } else {
          // Convert absolute path to relative path from current working directory
          const relativePath = relative(process.cwd(), fullPath);
          results.push(relativePath);
        }
      }
    } catch (error) {
      logger.error(`Error reading directory ${dirPath}: ${error instanceof Error ? error.message : String(error)}`);
    }

    return results;
  }

  private async searchForDirectory(dir: string, targetDirName: string): Promise<string[]> {
    const results: string[] = [];

    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and .git directories
          if (entry.name === 'node_modules' || entry.name === '.git') {
            logger.debug(`Skipping directory: ${entry.name}`);
            continue;
          }

          if (entry.name === targetDirName) {
            // Found the target directory, get all its contents
            const contents = await this.findDirectoryContents(fullPath);
            results.push(...contents);
          }

          // Continue searching in subdirectories
          const subDirResults = await this.searchForDirectory(fullPath, targetDirName);
          results.push(...subDirResults);
        }
      }
    } catch (error) {
      logger.error(`Error searching directory ${dir}: ${error instanceof Error ? error.message : String(error)}`);
    }

    return results;
  }

  async findFile(filename: string): Promise<string> {
    logger.startSection(`Searching for file: ${filename}`);

    try {
      // Get the project root by looking for package.json
      const projectRoot = await this.findProjectRoot(dirname(fileURLToPath(import .meta.url)));
      logger.info(`Starting search from project root: ${projectRoot}`);
      logger.debug(`Current working directory: ${process.cwd()}`);

      // Search for files
      const foundFiles = await this.searchDirectory(projectRoot, filename);

      // Handle results
      if (foundFiles.length === 0) {
        logger.error(`No files found with name: ${filename}`);
        throw new SearchErrors.FileNotFoundException(filename);
      }

      if (foundFiles.length > 1) {
        logger.warn(`Multiple files found with name: ${filename}`);
        foundFiles.forEach(path => logger.debug(`Found at: ${path}`));
        throw new SearchErrors.MultipleFilesFoundException(filename, foundFiles);
      }

      logger.success(`File found at: ${foundFiles[0]}`);
      logger.endSection(`Search for ${filename}`);

      return foundFiles[0];
    } catch (error) {
      if (error instanceof SearchErrors.FileNotFoundException ||
          error instanceof SearchErrors.MultipleFilesFoundException) {
        throw error;
      }
      logger.error(`Error during file search: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error('Failed to perform file search');
    }
  }

  async findDirectoryFiles(directoryName: string): Promise<string[]> {
    logger.startSection(`Searching for directory: ${directoryName}`);

    try {
      // Get the project root by looking for package.json
      const projectRoot = await this.findProjectRoot(dirname(fileURLToPath(import .meta.url)));
      logger.info(`Starting search from project root: ${projectRoot}`);
      logger.debug(`Current working directory: ${process.cwd()}`);

      // Search for directory and get its contents
      const foundFiles = await this.searchForDirectory(projectRoot, directoryName);

      // Handle results
      if (foundFiles.length === 0) {
        logger.error(`No directory found with name: ${directoryName}`);
        throw new SearchErrors.FileNotFoundException(directoryName);
      }

      logger.success(`Found ${foundFiles.length} files in directory "${directoryName}"`);
      foundFiles.forEach(path => logger.debug(`Found: ${path}`));
      logger.endSection(`Search for directory ${directoryName}`);

      return foundFiles;
    } catch (error) {
      if (error instanceof SearchErrors.FileNotFoundException) {
        throw error;
      }
      logger.error(`Error during directory search: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error('Failed to perform directory search');
    }
  }
}

export const search = new SearchService();