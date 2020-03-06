# albion-killbot

Discord bot to display kill statistics in Albion Online.

It keeps tracks of events using the gameinfo API and displays tracked events for specific players, guilds or entire alliances. For now, we only track kill events in the open world.

Also, when you are tracking a guild, the bot will display the monthly ranking every day at 12pm (bot time).

Other feature suggestions are welcome in the issues section of the github.

# How to install

Invite it to your server:

[![Invite](https://dabuttonfactory.com/button.png?t=INVITE+ALBION+KILLBOT&f=Roboto-Bold&ts=14&tc=fff&w=250&h=50&c=4&bgt=unicolored&bgc=7289da)](https://discordapp.com/oauth2/authorize?client_id=677603531028693042&scope=bot)

Make sure the bot have the following permissions:

- Read Texts
- Send Messages
- Embed Links

# Configuration

Type `!help` to see the bot's command.

The bot can track players and guilds. Alliances are disabled for now to avoid bot spam.

# Contributing

The bot development is simple as cloning the repository, cd'ing into it and running yarn.
You only need to set the Discord token using the `TOKEN` env. And `MONGODB_URL` if you want to persist server config.

Patches and suggestions are very welcome!
