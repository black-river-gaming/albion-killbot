export interface ITrackItem {
  id: string;
  name: string;
  server: string;
  kills?: {
    channel?: string;
  };
  deaths?: {
    channel?: string;
  };
}

export enum TRACK_TYPE {
  PLAYERS = "players",
  GUILDS = "guilds",
  ALLIANCES = "alliances",
}

export interface ITrackList {
  [TRACK_TYPE.PLAYERS]: ITrackItem[];
  [TRACK_TYPE.GUILDS]: ITrackItem[];
  [TRACK_TYPE.ALLIANCES]: ITrackItem[];
}

export type ISearchResults = ITrackList;
