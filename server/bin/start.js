const parseArgs = require("minimist");

const { MODE } = process.env;
const args = parseArgs(process.argv.slice(2));

const modes = [
  {
    name: "crawler",
    entryPoint: "./src/interfaces/crawler/index.js",
    description: "Component that fetches kills in Albion Servers and publish them to queue.",
  },
  {
    name: "bot",
    description: "Component that consumes the queue and publishes kills to Discord servers.",
    entryPoint: "./src/interfaces/discord/index.js",
  },
  {
    name: "api",
    description: "Web API to interact with server configurations and see events.",
    entryPoint: "./src/interfaces/rest/index.js",
  },
];

const mode = modes.find((m) => m.name == args.mode || m.name == MODE);
if (!mode) {
  console.log(`Please select an mode from the following:\n`);
  modes.forEach((mode) => {
    console.log(`\t${mode.name}\t- ${mode.description}`);
  });
  console.log(`\nTIP: You can use MODE env var or --mode command-line argument.`);
  process.exit(0);
}

console.log(`Starting component: ${mode.name}...`);
// TODO
