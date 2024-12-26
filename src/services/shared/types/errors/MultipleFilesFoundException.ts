export class MultipleFilesFoundException extends Error {
    constructor(filename: string, paths: string[]) {
        super(`Multiple files found with name "${filename}" at locations:\n${paths.join('\n')}`);
        this.name = 'MultipleFilesFoundException';
    }
}