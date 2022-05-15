require("dotenv").config();
const parseArgs = require("minimist");

const args = parseArgs(process.argv.slice(2));
if (args.mode) {
  process.env.MODE = args.mode;
}
const { MODE } = process.env;

const modes = [
  {
    name: "crawler",
    description: "Component that fetches kills in Albion Servers and publish them to queue.",
    entryPoint: require("../src/interfaces/crawler/index.js"),
  },
  {
    name: "bot",
    description: "Component that consumes the queue and publishes kills to Discord servers.",
    entryPoint: require("../src/interfaces/bot/index.js"),
  },
  {
    name: "api",
    description: "Web API to interact with server configurations and see events.",
    entryPoint: {
      run: () => {
        console.log("Not implemented yet.");
        process.exit(0);
      },
    },
  },
];

const run = async () => {
  const mode = modes.find((m) => m.name == MODE);
  if (!mode) {
    console.log(`Please select an mode from the following:\n`);
    modes.forEach((mode) => {
      console.log(`\t${mode.name}\t- ${mode.description}`);
    });
    console.log(`\nTIP: You can use MODE env var or --mode command-line argument.`);
    process.exit(0);
  }

  const { run, cleanup } = mode.entryPoint;

  try {
    await run();
  } catch (e) {
    console.error(e.stack);
    if (cleanup) {
      cleanup({ error: e });
    }
    process.exit(1);
  }
};

run();
