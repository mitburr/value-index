// implementations/commands/help.ts
import { Command } from '../../interfaces/command';
import type { CommandFactory } from '../../interfaces/factory';

interface HelpResponse {
  type: 'help';
  commands: { name: string; description: string; usage: string }[];
}

export class HelpCommand implements Command<HelpResponse> {
  constructor(private commandFactory: CommandFactory) {}

  description = 'List all available commands';
  usage = 'help [command]';

  validate(...args: unknown[]): boolean {
    const [command] = args;
    return !command || typeof command === 'string';
  }

  async execute(commandName?: string): Promise<HelpResponse> {
    if (commandName && this.commandFactory.hasCommand(commandName)) {
      const command = this.commandFactory.createCommand(commandName);
      return {
        type: 'help',
        commands: [{
          name: commandName,
          description: command.description,
          usage: command.usage
        }]
      };
    }

    // Return all commands if no specific command requested
    return {
      type: 'help',
      commands: Array.from(this.commandFactory.getCommands())
    };
  }
}