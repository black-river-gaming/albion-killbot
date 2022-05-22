![](https://img.shields.io/discord/738365346855256107?label=Discord&logo=Discord&style=social)

# albion-killbot

Discord bot to display kill statistics in Albion Online.

It keeps tracks of events using the gameinfo API and displays tracked events for specific players, guilds or entire alliances. For now, we only track kill events in the open world.

Also, when you are tracking a guild, the bot will display the monthly ranking every day at 12pm (bot time).

Other feature suggestions are welcome in the issues section of the github. Please join our Discord server for further questions: https://discord.gg/56AExWh

# Development

While you can develop without docker, this is the preferred way used for the development team. Steps to start working with it are described below.

## Requirements

- [docker](https://www.docker.com/) (20.x)
- [docker-compose](https://docs.docker.com/compose/) (2.5.x)

## Setup steps

First, you need a [Discord Token](https://discord.com/developers/applications) to run the bot component. The bot uses the following [environment variable](https://en.wikipedia.org/wiki/Environment_variable):

```
DISCORD_TOKEN=<your discord token>
```

You can drop that into an `.env` file or in your system's environment variables.

We have a convencience script called `ctl.sh` (refered in this guide as `ctl`) that you can install using `npm link` and use to quickly start the project. This assumes you have the requirements set-up. The commands inside are well-descripted so you can use them directly if you wish.

To start the project, just run:

```
ctl start
```

And then follow the logs using `ctl.sh logs [component]`. The component list can be found in `ctl help`.

That's it! Any changes made in the watched folders (`src/interfaces/<component>/nodemon.json`) will trigger a restart.

**NOTE**: Because the bot deals with sub processes, sometimes a full restart may be required. `ctl restart` is the command to do this.

## Upgrading from v3

If you are already using v3, there is a convencience script at the server that is designed to help with migrations. To run it, you can use:

```
ctl migrate
```

This will setup a temporary devenv and run the migrations. Outside of docker, there is the `npm run db:migrate` script, but you need to setup the necessary environment variables for that to work.

# Contributing

Patches and suggestions are very welcome, but please note that I will judge the quality of the code before merging it through the Pull Request process.
