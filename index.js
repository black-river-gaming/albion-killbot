const Discord = require("discord.js");
const eventHandler = require("./events");
const messages = require("./messages");

const token = process.env.TOKEN;
if (!token) {
  console.log(
    "Please define TOKEN environment variable with the discord token."
  );
  process.exit(0);
}

const client = new Discord.Client();
const notify = events => {
  // TODO: Configure channel
  const channel = client.channels.find(c => c.name === 'geral');

  events.forEach(event => {
    const embed = messages.embed(event);

    // TODO: Send messages to channels based on tracking settings
    channel.send({
      embed
    });
  });
};
client.on("ready", () => {
  console.log(`Connected successfully as ${client.user.tag}`);
  setInterval(() => eventHandler.fetch(notify), 30000);
});
client.on("message", msg => {
  if (msg.content === 'test') {
    eventHandler.fetch(notify);
    }
});
client.login(token);
