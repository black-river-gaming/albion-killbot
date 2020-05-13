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

Type `!help` to see the bot's command. Don't forget to set up the notification channel using `!channel #channel` command.

The bot can track players and guilds. Alliances are disabled for now to avoid bot spam.

# Development

To set up the bot in a self-hosted way:

1. Clone the repository
```
git clone git@github.com:agnjunio/albion-killbot.git
cd albion-killbot
```

2. Run yarn to install dependencies
```
yarn
```

3. Create an .env file or set the environment variables that you wish to use, following the example
```
cp .env.example .env
```

4. Run the bot
```
yarn start
```

# Contributing

Patches and suggestions are very welcome, but please note that I will judge the quality of the code before merging it through the Pull Request process.
