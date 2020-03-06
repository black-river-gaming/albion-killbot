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
  events.forEach(event => {
    console.log("Notify kill " + event.EventId);
    const embed = messages.embed(event);

    // TODO: Send messages to channels based on tracking settings
    client.channels.forEach(channel => {
      channel.send(embed);
    });
  });
};
client.on("ready", () => {
  console.log(`Connected successfully as ${client.user.tag}`);
  setInterval(() => eventHandler.fetch(notify), 30000);
});
client.login(token);
