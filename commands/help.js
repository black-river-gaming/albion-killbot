const { getI18n } = require("../messages");
const LINE_LENGTH = 70;

module.exports = {
  aliases: ["help"],
  description: "HELP.HELP",
  run: (client, guild, message) => {
    const l = getI18n(guild);
    let response = "```\n";
    Object.keys(client.commands).forEach(key => {
      const command = client.commands[key];
      let commandKey = `!${command.aliases[0]}`;
      if (command.args && command.args.length > 0) {
        command.args.forEach(arg => {
          commandKey += ` [${arg}]`;
          ("");
        });
      }
      const description = l.__(command.description);
      response +=
        commandKey +
        " ".repeat(LINE_LENGTH - commandKey.length) +
        description +
        "\n";
    });
    response += "```";
    message.channel.send(response);

    if (!guild.config.channel) {
      message.channel.send(l.__("CHANNEL_NOT_SET"));
    }
  }
};
