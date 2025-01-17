
import {Command} from "services/cli/interfaces/command.ts";

export interface CommandFactory {
  createCommand(type: string): Command;
  registerCommand(name: string, command: Command): void;
  hasCommand(name: string): boolean;
}