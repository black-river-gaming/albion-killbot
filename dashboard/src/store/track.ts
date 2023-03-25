import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TrackList } from "types";

interface ITrackState extends TrackList {
  default: TrackList;
  changed: boolean;
}

const initialState: ITrackState = {
  players: [],
  guilds: [],
  alliances: [],
  default: {
    players: [],
    guilds: [],
    alliances: [],
  },
  changed: false,
};

export const trackslice = createSlice({
  name: "track",
  initialState,
  reducers: {
    loadTrack: (state, { payload }: PayloadAction<TrackList>) => {
      state.players = payload.players;
      state.guilds = payload.guilds;
      state.alliances = payload.alliances;

      state.default.players = payload.players;
      state.default.guilds = payload.guilds;
      state.default.alliances = payload.alliances;

      state.changed = false;
    },
    resetTrack: (state) => {
      state.players = state.default.players;
      state.guilds = state.default.guilds;
      state.alliances = state.default.alliances;

      state.changed = false;
    },
    trackPlayer: (
      state,
      { payload }: PayloadAction<TrackList["players"][number]>
    ) => {
      if (state.players.find(({ id }) => id === payload.id)) return;
      state.players.push(payload);
      state.changed = true;
    },
    trackGuild: (
      state,
      { payload }: PayloadAction<TrackList["guilds"][number]>
    ) => {
      if (state.guilds.find(({ id }) => id === payload.id)) return;
      state.guilds.push(payload);
      state.changed = true;
    },
    trackAlliance: (
      state,
      { payload }: PayloadAction<TrackList["alliances"][number]>
    ) => {
      if (state.alliances.find(({ id }) => id === payload.id)) return;
      state.alliances.push(payload);
      state.changed = true;
    },
    untrackPlayer: (state, { payload }: PayloadAction<string>) => {
      const i = state.players.findIndex(({ id }) => id === payload);
      if (i < 0) return;
      state.players.splice(i, 1);
      state.changed = true;
    },
    untrackGuild: (state, { payload }: PayloadAction<string>) => {
      const i = state.guilds.findIndex(({ id }) => id === payload);
      if (i < 0) return;
      state.guilds.splice(i, 1);
      state.changed = true;
    },
    untrackAlliance: (state, { payload }: PayloadAction<string>) => {
      const i = state.alliances.findIndex(({ id }) => id === payload);
      if (i < 0) return;
      state.alliances.splice(i, 1);
      state.changed = true;
    },
  },
});

export const {
  loadTrack,
  resetTrack,
  trackPlayer,
  trackGuild,
  trackAlliance,
  untrackPlayer,
  untrackGuild,
  untrackAlliance,
} = trackslice.actions;

export default trackslice.reducer;
