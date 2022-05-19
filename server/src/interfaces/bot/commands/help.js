const { InteractionType } = require("discord-api-types/v10");
const { getLocale } = require("../../../helpers/locale");

// const LINE_LENGTH = 70;

const command = {
  name: "help",
  description: getLocale().t("HELP.HELP"),
  type: InteractionType.Ping,
  default_permission: true,
  handle: async (interaction) => {
    // const t = getI18n(guild.config.lang);
    // let response = "```\n";
    // if (process.env.npm_package_version) {
    //   response += l.__("HELP.VERSION", {
    //     version: process.env.npm_package_version,
    //   });
    //   response += "\n\n";
    // }
    // Object.keys(client.commands).forEach((key) => {
    //   const command = client.commands[key];
    //   let commandKey = `!${command.aliases[0]}`;
    //   if (command.args && command.args.length > 0) {
    //     command.args.forEach((arg) => {
    //       commandKey += ` [${arg}]`;
    //       ("");
    //     });
    //   }
    //   const description = l.__(command.description);
    //   response += commandKey + " ".repeat(LINE_LENGTH - commandKey.length) + description + "\n";
    // });
    // response += "```";
    // await message.channel.send(response);
    return interaction.reply({
      content: "Pong!",
      ephemeral: true,
    });
  },
};

module.exports = command;
