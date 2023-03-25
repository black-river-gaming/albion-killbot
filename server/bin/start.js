require("dotenv").config();
const parseArgs = require("minimist");
const path = require("node:path");
const logger = require("../src/helpers/logger");

const args = parseArgs(process.argv.slice(2));
if (args.mode) {
  process.env.MODE = args.mode;
}
const { MODE } = process.env;

const interfaces = path.join("..", "src", "interfaces");
const modes = [
  {
    name: "crawler",
    description: "Component that fetches kills in Albion Servers and publish them to queue.",
    entryPoint: path.join(interfaces, "crawler"),
  },
  {
    name: "bot",
    description: "Component that consumes the queue and publishes kills to Discord servers.",
    entryPoint: path.join(interfaces, "bot"),
  },
  {
    name: "api",
    description: "Web API to interact with server configurations and see events.",
    entryPoint: path.join(interfaces, "api"),
  },
];

async function start() {
  const mode = modes.find((m) => m.name == MODE);
  if (!mode) {
    logger.info(`Please select an mode from the following:\n`);
    modes.forEach((mode) => {
      logger.info(`\t${mode.name}\t- ${mode.description}`);
    });
    logger.info(`\nTIP: You can use MODE env var or --mode command-line argument.`);
    process.exit(0);
  }

  try {
    const { run, cleanup } = require(mode.entryPoint);

    if (cleanup) {
      //catches ctrl+c event
      process.once("SIGINT", await cleanup);
      // graceful shutdown when using nodemon
      process.once("SIGHUP", await cleanup);
      process.once("SIGUSR2", await cleanup);
    }

    //catches uncaught exceptions
    process.on("uncaughtException", async (error) => {
      logger.error(`Uncaught exception:`, error);
    });

    await run();
  } catch (error) {
    logger.error(`An error ocurred while running ${mode.name}: ${error.message}`, { error });
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}
