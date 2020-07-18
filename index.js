require("dotenv").config();
const bot = require("./bot");
const logger = require("./logger")("system");

const token = process.env.TOKEN;
if (!token) {
  logger.error(
    "Please define TOKEN environment variable with the discord token.",
  );
  process.exit(1);
}

bot.run(token);
