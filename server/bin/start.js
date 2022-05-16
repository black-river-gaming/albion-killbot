require("dotenv").config();
const parseArgs = require("minimist");
const path = require("node:path");

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
  },
];

(async () => {
  const mode = modes.find((m) => m.name == MODE);
  if (!mode) {
    console.log(`Please select an mode from the following:\n`);
    modes.forEach((mode) => {
      console.log(`\t${mode.name}\t- ${mode.description}`);
    });
    console.log(`\nTIP: You can use MODE env var or --mode command-line argument.`);
    process.exit(0);
  }

  try {
    const { run, cleanup } = require(mode.entryPoint);

    //catches ctrl+c event
    process.once("SIGINT", cleanup);
    // catches "kill pid" (for example: nodemon restart)
    process.once("SIGUSR1", cleanup);
    process.once("SIGUSR2", cleanup);
    //catches uncaught exceptions
    process.once("uncaughtException", cleanup);

    await run();
  } catch (e) {
    console.error(e.stack);
    console.log(`An error ocurred while running ${mode.name}. Exiting...`);
    process.exit(1);
  }
})();
