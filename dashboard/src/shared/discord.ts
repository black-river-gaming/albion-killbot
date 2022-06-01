import { Server, User } from "store/api";

const { REACT_APP_DISCORD_CLIENT_ID, REACT_APP_DISCORD_REDIRECT_URI = "" } =
  process.env;

const encodedRedirectUri = encodeURIComponent(REACT_APP_DISCORD_REDIRECT_URI);

export const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${REACT_APP_DISCORD_CLIENT_ID}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=identify%20guilds`;

export const DISCORD_SERVER_URL = "https://discord.gg/56AExWh";

export const getUserPictureUrl = (user: User) =>
  `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

export const getServerPictureUrl = (server: Server) =>
  `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`;

export const getServerInviteUrl = (server: Server) =>
  `https://discord.com/oauth2/authorize?client_id=${REACT_APP_DISCORD_CLIENT_ID}&guild_id=${server.id}&scope=bot&permissions=2147534848`;
