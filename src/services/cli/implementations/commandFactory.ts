// implementations/commandFactory.ts
import { Command } from '../interfaces/command';
import { CommandFactory } from '../interfaces/factory.ts'
import { CommandResponse } from '../types/responses';
import { Retailer } from '../../retailer-integration/interfaces/retailer';
import { logger } from '../../shared/utils/logger';
import { SearchCommand } from './commands/search';
import { PriceHistoryCommand } from './commands/priceHistory';
import { ComparisonCommand } from './commands/comparison';

export class DefaultCommandFactory implements CommandFactory {
  private commands = new Map<string, Command>();

  constructor(private retailerServices: Map<string, Retailer>) {
    this.initializeCommands();
  }

  private initializeCommands(): void {
    this.registerCommand('search', new SearchCommand(this.retailerServices.get('bestbuy')!));
    this.registerCommand('history', new PriceHistoryCommand(this.retailerServices.get('bestbuy')!));
    this.registerCommand('compare', new ComparisonCommand(this.retailerServices));
  }

  createCommand(type: string): Command {
    const command = this.commands.get(type);
    if (!command) {
      throw new Error(`Unknown command type: ${type}`);
    }
    return command;
  }

  registerCommand(name: string, command: Command): void {
    this.commands.set(name, command);
    logger.info(`Registered command: ${name}`);
  }

  hasCommand(name: string): boolean {
    return this.commands.has(name);
  }
}
