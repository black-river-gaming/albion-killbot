const { Permissions } = require("discord.js");

const isAdmin = (permissions) => {
  const bitPermissions = new Permissions(permissions);
  return bitPermissions.has(Permissions.FLAGS.ADMINISTRATOR);
};

const transformGuild = (guild) => {
  const transformedGuild = {
    id: guild.id,
    name: guild.name,
    icon: guild.icon,
    owner: guild.owner,
  };

  if (guild.permissions) {
    transformedGuild.admin = isAdmin(guild.permissions);
  }

  if (guild.roles) {
    transformedGuild.roles = guild.roles.map((role) => ({
      id: role.id,
      name: role.name,
      permission: role.permissions,
    }));
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
  isAdmin,
  transformChannel,
  transformGuild,
};
