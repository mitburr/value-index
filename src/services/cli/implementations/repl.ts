import { CommandFactory } from '../interfaces/factory';
import { logger } from 'u/logger.ts';
import readline from 'readline';

export class CLI {
  private rl: readline.Interface;

  constructor(private commandFactory: CommandFactory) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'price-tracker> '
    });
  }

  async start(): Promise<void> {
    logger.info('Starting CLI...');
    this.rl.prompt();

    this.rl.on('line', async (line) => {
      const [commandName, ...args] = line.trim().split(' ');

      try {
        if (this.commandFactory.hasCommand(commandName)) {
          const command = this.commandFactory.createCommand(commandName);
          if (command.validate(...args)) {
            const result = await command.execute(...args);
            console.log(result);
          } else {
            console.log(`Usage: ${command.usage}`);
          }
        } else {
          console.log('Unknown command. Type "help" for available commands.');
        }
      } catch (error) {
        logger.error(`Command execution failed: ${error}`);
      }

      this.rl.prompt();
    });

    this.rl.on('close', () => {
      console.log('\nGoodbye!');
      process.exit(0);
    });
  }
}