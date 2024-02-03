import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ISettings } from "types";

const initialState: ISettings = {
  server: "",
  general: {
    locale: "en",
    showAttunement: false,
    guildTags: false,
    splitLootValue: false,
  },
  kills: {
    enabled: true,
    channel: "",
    mode: "image",
  },
  deaths: {
    enabled: true,
    channel: "",
    mode: "image",
  },
  battles: {
    enabled: true,
    channel: "",
    threshold: {
      players: 0,
      guilds: 0,
      alliances: 0,
    },
  },
  rankings: {
    enabled: true,
    channel: "",
    pvpRanking: "daily",
  },
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    loadSettings: (state, action: PayloadAction<ISettings>) => {
      state.server = action.payload.server;
      state.general = action.payload.general;
      state.kills = action.payload.kills;
      state.deaths = action.payload.deaths;
      state.battles = action.payload.battles;
      state.rankings = action.payload.rankings;
    },
    setGeneralLocale: (state, action: PayloadAction<string>) => {
      state.general.locale = action.payload;
    },
    setGeneralShowAttunement: (state, action: PayloadAction<boolean>) => {
      state.general.showAttunement = action.payload;
    },
    setGeneralGuildTags: (state, action: PayloadAction<boolean>) => {
      state.general.guildTags = action.payload;
    },
    setGeneralSplitLootValue: (state, action: PayloadAction<boolean>) => {
      state.general.splitLootValue = action.payload;
    },
    setKillsEnabled: (state, action: PayloadAction<boolean>) => {
      state.kills.enabled = action.payload;
    },
    setKillsChannel: (state, action: PayloadAction<string>) => {
      state.kills.channel = action.payload;
    },
    setKillsMode: (state, action: PayloadAction<string>) => {
      state.kills.mode = action.payload;
    },
    setKillsProvider: (state, action: PayloadAction<string>) => {
      state.kills.provider = action.payload;
    },
    setDeathsEnabled: (state, action: PayloadAction<boolean>) => {
      state.deaths.enabled = action.payload;
    },
    setDeathsChannel: (state, action: PayloadAction<string>) => {
      state.deaths.channel = action.payload;
    },
    setDeathsMode: (state, action: PayloadAction<string>) => {
      state.deaths.mode = action.payload;
    },
    setDeathsProvider: (state, action: PayloadAction<string>) => {
      state.deaths.provider = action.payload;
    },
    setBattlesEnabled: (state, action: PayloadAction<boolean>) => {
      state.battles.enabled = action.payload;
    },
    setBattlesChannel: (state, action: PayloadAction<string>) => {
      state.battles.channel = action.payload;
    },
    setBattlesThresholdPlayers: (state, action: PayloadAction<number>) => {
      state.battles.threshold = {
        ...state.battles.threshold,
        players: Math.max(0, action.payload),
      };
    },
    setBattlesThresholdGuilds: (state, action: PayloadAction<number>) => {
      state.battles.threshold = {
        ...state.battles.threshold,
        guilds: Math.max(0, action.payload),
      };
    },
    setBattlesThresholdAlliances: (state, action: PayloadAction<number>) => {
      state.battles.threshold = {
        ...state.battles.threshold,
        alliances: Math.max(0, action.payload),
      };
    },
    setBattlesProvider: (state, action: PayloadAction<string>) => {
      state.battles.provider = action.payload;
    },
    setRankingsEnabled: (state, action: PayloadAction<boolean>) => {
      state.rankings.enabled = action.payload;
    },
    setRankingsChannel: (state, action: PayloadAction<string>) => {
      state.rankings.channel = action.payload;
    },
    setRankingsPvpRanking: (state, action: PayloadAction<string>) => {
      state.rankings.pvpRanking = action.payload;
    },
  },
});

export const {
  loadSettings,
  setGeneralLocale,
  setGeneralShowAttunement,
  setGeneralGuildTags,
  setGeneralSplitLootValue,
  setKillsEnabled,
  setKillsChannel,
  setKillsMode,
  setKillsProvider,
  setDeathsEnabled,
  setDeathsChannel,
  setDeathsMode,
  setDeathsProvider,
  setBattlesEnabled,
  setBattlesChannel,
  setBattlesThresholdPlayers,
  setBattlesThresholdGuilds,
  setBattlesThresholdAlliances,
  setBattlesProvider,
  setRankingsEnabled,
  setRankingsChannel,
  setRankingsPvpRanking,
} = settingsSlice.actions;

export default settingsSlice.reducer;
