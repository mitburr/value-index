export async function log(message: string, level: 'info' | 'error' | 'debug' = 'info'): Promise<void> {
    const timestamp = new Date().toISOString();
    const logMessage = `[${level.toUpperCase()}] ${timestamp}: ${message}\n`;
    
    // Create a BunFile reference first
    const file = Bun.file('app.log');
    
    // Then write to it using one of two approaches:
    
    // Approach 1: Using write()
    await Bun.write(file, logMessage);
    
}