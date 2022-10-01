import { Server, ServerPartial, User } from "store/api";

const { REACT_APP_DISCORD_CLIENT_ID, REACT_APP_DISCORD_REDIRECT_URI = "" } =
  process.env;

const encodedRedirectUri = encodeURIComponent(REACT_APP_DISCORD_REDIRECT_URI);

export const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${REACT_APP_DISCORD_CLIENT_ID}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=identify%20guilds`;
export const DISCORD_SERVER_URL = `https://discord.gg/56AExWh`;
export const DISCORD_CDN_URL = `https://cdn.discordapp.com`;

export const getUserPictureUrl = (user: User) => {
  if (user.avatar)
    return `${DISCORD_CDN_URL}/avatars/${user.id}/${user.avatar}.png`;

  if (user.id)
    return `${DISCORD_CDN_URL}/embed/avatars/${Number(user.id) % 5}.png`;
};

export const getServerPictureUrl = (
  server: ServerPartial | Server,
  animated?: boolean
) => {
  if (server.icon) {
    const ext = animated && server.icon.startsWith("a_") ? "gif" : "png";
    return `${DISCORD_CDN_URL}/icons/${server.id}/${server.icon}.${ext}`;
  }

  if (server.id)
    return `${DISCORD_CDN_URL}/embed/avatars/${Number(server.id) % 5}.png`;
};

export const getServerInviteUrl = (server?: ServerPartial | Server) => {
  const serverParam = server ? `&guild_id=${server.id}` : ``;
  return `https://discord.com/oauth2/authorize?client_id=${REACT_APP_DISCORD_CLIENT_ID}&scope=bot&permissions=2147534848${serverParam}`;
};

export const CHANNEL_TYPES = {
  TEXT: 0,
};
