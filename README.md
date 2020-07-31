![](https://img.shields.io/discord/738365346855256107?label=Discord&logo=Discord&style=social)

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

# Usage

> For detailed information about the commands available. Please check our [Command List](https://github.com/agnjunio/albion-killbot/wiki/Command-List) page on wiki.
> Also, in Discord type `!help` to see the commands available.

First, you need to set up the notification channel using `!channel #channel` command.

```
!channel #killboard
```

If you want to send your notifications to different channels, simply set their categories manually.

Categories are:

* **general**: Any message not related to other categories. Default category.
* **events**: Kills and Deaths of tracked entities.
* **battles**: Battles between guilds and alliances.
* **rankings**: Monthly guild rankings and Daily PvP rankings.

```
!channel #killboard events
!channel #rankings rankings
!channel #battles battles
!channel #announcements general
```

The bot can track players and guilds. Alliances are disabled for now to avoid bot spam. Examples:

If you want to track a guild:

```
!track guild Blue Army
!track guild Black River
```

If you want to track a player:

```
!track player Anjek
!track player MyPlayer
```

To list what guilds/players you're currently tracking, type `!list`
To stop tracking there guilds/players, just swap `!track` for `!untrack`

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
