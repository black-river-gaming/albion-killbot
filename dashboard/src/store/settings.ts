import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Settings } from "types";

const initialState = {
  lang: "en",
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
  },
  rankings: {
    enabled: true,
    channel: "",
    pvpRanking: "daily",
    guildRanking: "daily",
  },
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    loadSettings: (state, { payload }: PayloadAction<Settings>) => {
      state.lang = payload.lang;
      state.kills = payload.kills;
      state.deaths = payload.deaths;
      state.battles = payload.battles;
      state.rankings = payload.rankings;
    },
    setLang: (state, action: PayloadAction<string>) => {
      state.lang = action.payload;
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
    setDeathsEnabled: (state, action: PayloadAction<boolean>) => {
      state.deaths.enabled = action.payload;
    },
    setDeathsChannel: (state, action: PayloadAction<string>) => {
      state.deaths.channel = action.payload;
    },
    setDeathsMode: (state, action: PayloadAction<string>) => {
      state.deaths.mode = action.payload;
    },
    setBattlesEnabled: (state, action: PayloadAction<boolean>) => {
      state.battles.enabled = action.payload;
    },
    setBattlesChannel: (state, action: PayloadAction<string>) => {
      state.battles.channel = action.payload;
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
    setRankingsGuildRanking: (state, action: PayloadAction<string>) => {
      state.rankings.guildRanking = action.payload;
    },
  },
});

export const {
  loadSettings,
  setLang,
  setKillsEnabled,
  setKillsChannel,
  setKillsMode,
  setDeathsEnabled,
  setDeathsChannel,
  setDeathsMode,
  setBattlesEnabled,
  setBattlesChannel,
  setRankingsEnabled,
  setRankingsChannel,
  setRankingsPvpRanking,
  setRankingsGuildRanking,
} = settingsSlice.actions;

export default settingsSlice.reducer;
