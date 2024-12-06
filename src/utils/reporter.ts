// src/utils/reporter.ts

type ReportLevel = 'info' | 'warn' | 'error' | 'debug';

class Reporter {
  private logFile: string;

  constructor(logFile: string = 'app.log') {
    this.logFile = logFile;
  }

  private async write(message: string, level: ReportLevel): Promise<void> {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${level.toUpperCase()}] ${timestamp}: ${message}\n`;
    
    const file = Bun.file(this.logFile);                // Create BunFile
    const existingContent = await file.text();          // Get existing content
    const updatedContent = existingContent + formattedMessage;  // Append new message
    await Bun.write(file, updatedContent);             // Write back to file
  }
  async info(message: string): Promise<void> {
    await this.write(message, 'info');
  }

  async warn(message: string): Promise<void> {
    await this.write(message, 'warn');
  }

  async error(message: string): Promise<void> {
    await this.write(message, 'error');
  }

  async debug(message: string): Promise<void> {
    await this.write(message, 'debug');
  }

  async queryLog(sql: string, params?: unknown[]): Promise<void> {
    const queryInfo = params ? 
      `Query: ${sql} - Params: ${JSON.stringify(params)}` : 
      `Query: ${sql}`;
    await this.debug(queryInfo);
  }

  async appStart(): Promise<void> {
    await this.info('Application started');
  }

  async appEnd(): Promise<void> {
    await this.info('Application ended');
  }
}

// Export singleton instance
export const reporter = new Reporter();