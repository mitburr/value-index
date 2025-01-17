import { RetailerService } from '../../retailer-integration/interfaces/retailerService';
import { Command, CommandResult } from '../interfaces/command';

export class CommandRegistry {
  private commands = new Map<string, Command>();

  constructor(private retailers: Map<string, RetailerService>) {}

  register(name: string, command: Command): void {
    this.commands.set(name, command);
  }

  async execute(commandName: string, args: string[]): Promise<CommandResult> {
    const command = this.commands.get(commandName);
    if (!command) {
      return { success: false, error: `Unknown command: ${commandName}` };
    }

    if (!command.validate(args)) {
      return { success: false, error: `Invalid usage. Correct usage: ${command.usage}` };
    }

    return command.execute(...args);
  }

  getCommands(): Array<{ name: string; usage: string; description: string }> {
    return Array.from(this.commands.entries()).map(([name, command]) => ({
      name,
      usage: command.usage,
      description: command.description
    }));
  }
}
