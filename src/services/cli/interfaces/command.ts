import { RetailerService } from '../../retailer-integration/interfaces/retailerService';

export type CommandResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface Command<T = unknown> {
  execute(...args: string[]): Promise<CommandResult<T>>;
  validate(args: string[]): boolean;
  usage: string;
  description: string;
}

export interface SearchOptions {
  query: string[];      // Multiple terms joined in service
  retailer?: string;    // Optional retailer flag
  limit?: number;       // Optional result limit
}