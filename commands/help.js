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
      const description = l.__(command.description);
      response +=
        "!" +
        command.aliases[0] +
        " ".repeat(
          LINE_LENGTH - 1 - command.aliases[0].length - description.length
        ) +
        description +
        "\n";
    });
    response += "```";
    message.channel.send(response);
  }
};
