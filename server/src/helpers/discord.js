const config = require("config");
const { PermissionFlagsBits, PermissionsBitField } = require("discord.js");

const isCommunityAdmin = (id) => {
  if (!config.has("discord.community.admins")) return false;
  return config.get("discord.community.admins").includes(id);
};

const transformUser = (user) => {
  return {
    id: user.id,
    username: user.global_name,
    avatar: user.avatar,
    locale: user.locale,
    admin: isCommunityAdmin(user.id),
  };
};

const isServerAdmin = (permissions) => {
  return new PermissionsBitField(permissions).has(PermissionFlagsBits.Administrator);
};

const transformGuild = (guild) => {
  const transformedGuild = {
    id: guild.id,
    name: guild.name,
    icon: guild.icon,
    owner: guild.owner,
  };

  if (guild.owner) {
    transformedGuild.owner = guild.owner;
  }

  if (guild.permissions) {
    transformedGuild.admin = isServerAdmin(guild.permissions);
  }

  return transformedGuild;
};

const transformChannel = (channel) => ({
  id: channel.id,
  name: channel.name,
  type: channel.type,
  parentId: channel.parent_id,
});

module.exports = {
  isCommunityAdmin,
  isServerAdmin,
  transformChannel,
  transformGuild,
  transformUser,
};
