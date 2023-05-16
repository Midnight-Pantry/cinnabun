// TypeScript (.ts)
import commander, { Command } from "commander"
import chalk from "chalk"
import init from "./routes/init"
import start from "./routes/start"
import dev from "./routes/dev"
import build from "./routes/build"

const program = new Command()

export const THEME: Partial<commander.Help> = {
  sortSubcommands: true,
  subcommandTerm: (cmd) => chalk.cyan(cmd.name()),
  subcommandDescription: (cmd: Command) => cmd.description(),
  optionTerm: (option) => chalk.green(option.flags),
  optionDescription: (option) => option.description,
  commandUsage: (cmd: Command) => cmd.usage(),
}

program
  .configureHelp(THEME)

  .description(
    chalk.cyan("Cinnabun") +
      " is a the bun of the cinnamon roll. It is the core of the cinnamon roll."
  )
  .name("cinnabun")
  .usage(`${chalk.cyan("<command>")} [options]`)
  .version("0.0.1")
  .option("-h, --help", "display help for command")

program.addCommand(init)
program.addCommand(start)
program.addCommand(dev)
program.addCommand(build)

program.parse(process.argv)
