const Discord = require("discord.js");

const token = process.env.TOKEN;
if (!token) {
  console.log(
    "Please define TOKEN environment variable with the discord token."
  );
  process.exit(0);
}

const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Connected successfully as ${client.user.tag}`);
});

client.on("message", msg => {
  if (msg.content === "ping") {
    msg.reply("pong");
  }
});

client.login(token);
