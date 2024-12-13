export interface AppConfig {
    environment: 'development' | 'production' | 'test';
    port: number;
}

export * from './errors';