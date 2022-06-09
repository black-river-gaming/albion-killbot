import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TrackList } from "./api";

const initialState: TrackList = {
  players: [],
  guilds: [],
  alliances: [],
};

export const trackslice = createSlice({
  name: "track",
  initialState,
  reducers: {
    loadTrack: (state, { payload }: PayloadAction<TrackList>) => {
      state.players = payload.players;
      state.guilds = payload.guilds;
      state.alliances = payload.alliances;
    },
    trackPlayer: (
      state,
      { payload }: PayloadAction<TrackList["players"][number]>
    ) => {
      if (state.players.find(({ id }) => id === payload.id)) return;
      state.players.push(payload);
    },
    trackGuild: (
      state,
      { payload }: PayloadAction<TrackList["guilds"][number]>
    ) => {
      if (state.guilds.find(({ id }) => id === payload.id)) return;
      state.guilds.push(payload);
    },
    trackAlliance: (
      state,
      { payload }: PayloadAction<TrackList["alliances"][number]>
    ) => {
      if (state.alliances.find(({ id }) => id === payload.id)) return;
      state.alliances.push(payload);
    },
    untrackPlayer: (state, { payload }: PayloadAction<string>) => {
      const i = state.players.findIndex(({ id }) => id === payload);
      if (i < 0) return;
      state.players.splice(i, 1);
    },
    untrackGuild: (state, { payload }: PayloadAction<string>) => {
      const i = state.guilds.findIndex(({ id }) => id === payload);
      if (i < 0) return;
      state.guilds.splice(i, 1);
    },
    untrackAlliance: (state, { payload }: PayloadAction<string>) => {
      const i = state.alliances.findIndex(({ id }) => id === payload);
      if (i < 0) return;
      state.alliances.splice(i, 1);
    },
  },
});

export const {
  loadTrack,
  trackPlayer,
  trackGuild,
  trackAlliance,
  untrackPlayer,
  untrackGuild,
  untrackAlliance,
} = trackslice.actions;

export default trackslice.reducer;
