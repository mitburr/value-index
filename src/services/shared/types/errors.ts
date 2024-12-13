// src/services/shared/types/errors.ts

// Adding 'export' to make this file a module
export namespace SearchErrors {
  export class FileNotFoundException extends Error {
    constructor(filename: string) {
      super(`No file found with name: ${filename}`);
      this.name = 'FileNotFoundException';
    }
  }

  export class MultipleFilesFoundException extends Error {
    constructor(filename: string, paths: string[]) {
      super(`Multiple files found with name "${filename}" at locations:\n${paths.join('\n')}`);
      this.name = 'MultipleFilesFoundException';
    }
  }
}