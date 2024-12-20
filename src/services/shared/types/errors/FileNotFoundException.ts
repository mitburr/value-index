export class FileNotFoundException extends Error {
    constructor(filename: string) {
        super(`No file found with name: ${filename}`);
        this.name = 'FileNotFoundException';
    }
}