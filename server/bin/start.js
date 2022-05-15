require("dotenv").config();
const parseArgs = require("minimist");

const args = parseArgs(process.argv.slice(2));
if (args.mode) {
  process.env.MODE = args.mode;
}
const { MODE } = process.env;

const run = () => {
  console.log("Not implemented yet.");
  process.exit(0);
};

const modes = [
  {
    name: "crawler",
    description: "Component that fetches kills in Albion Servers and publish them to queue.",
    entryPoint: require("../src/interfaces/crawler/index.js"),
  },
  {
    name: "bot",
    description: "Component that consumes the queue and publishes kills to Discord servers.",
    entryPoint: {
      run,
    },
  },
  {
    name: "api",
    description: "Web API to interact with server configurations and see events.",
    entryPoint: {
      run,
    },
  },
];

const mode = modes.find((m) => m.name == MODE);
if (!mode) {
  console.log(`Please select an mode from the following:\n`);
  modes.forEach((mode) => {
    console.log(`\t${mode.name}\t- ${mode.description}`);
  });
  console.log(`\nTIP: You can use MODE env var or --mode command-line argument.`);
  process.exit(0);
}

mode.entryPoint.run();
