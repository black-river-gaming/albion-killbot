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

const scanEvents = async () => {
    // TODO: Configure channel
    const channel = client.channels.find(c => c.name === "geral");

    const newEvents = await eventHandler.getEvents();
    newEvents.forEach(event => {
        channel.send({
            embed: messages.embedEvent(event)
        });
    });
};

client.on("ready", () => {
    console.log(`Connected successfully as ${client.user.tag}`);
    setInterval(scanEvents, 30000);
});

client.on("message", msg => {
    if (msg.content === "test") {
        scanEvents();
    }
});

client.login(token);
