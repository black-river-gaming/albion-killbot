import { TRACK_TYPE } from "helpers/constants";

export interface User {
  id: string;
  username: string;
  avatar: string;
  locale: string;
  admin: boolean;
}

export interface Limits {
  players: number;
  guilds: number;
  alliances: number;
}

export interface ServerBase {
  id: string;
  name: string;
  icon: string;
}

export interface ServerPartial extends ServerBase {
  owner: boolean;
  admin: boolean;
  bot: boolean;
}

export interface IServer extends ServerBase {
  channels: IChannel[];
  settings: ISettings;
  limits: Limits;
  subscription: Subscription;
  track: ITrackList;
}

export interface IChannel {
  id: string;
  name: string;
  type: number;
  parentId?: string;
}

export interface ISettings {
  server: string;
  general: {
    locale: string;
    guildTags: boolean;
    splitLootValue: boolean;
  };
  kills: {
    enabled: boolean;
    channel: string;
    mode: string;
  };
  deaths: {
    enabled: boolean;
    channel: string;
    mode: string;
  };
  battles: {
    enabled: boolean;
    channel: string;
    threshold: {
      players: number;
      guilds: number;
      alliances: number;
    };
  };
  rankings: {
    enabled: boolean;
    channel: string;
    pvpRanking: string;
    guildRanking: string;
  };
}

export interface ITrackItem {
  id: string;
  name: string;
  server: string;
  channel?: string;
}

export interface ITrackList {
  [TRACK_TYPE.PLAYERS]: ITrackItem[];
  [TRACK_TYPE.GUILDS]: ITrackItem[];
  [TRACK_TYPE.ALLIANCES]: ITrackItem[];
}

export type ISearchResults = ITrackList;

export interface SubscriptionBase {
  id: string;
  owner: string;
  expires: string | "never";
  limits?: Limits;
}

export interface SubscriptionPartial extends SubscriptionBase {
  server?: string;
  stripe?: string;
}

export interface Subscription extends SubscriptionBase {
  server?: string | ServerBase;
  stripe?: {
    id: string;
    cancel_at_period_end: boolean;
    current_period_end: number;
    customer: string;
    price: SubscriptionPrice;
  };
}
export type UpdateSubscription = Omit<Subscription, "id">;

export interface SubscriptionPricesResponse {
  currencies: string[];
  prices: SubscriptionPrice[];
}

export interface SubscriptionPrice {
  id: string;
  currency: string;
  price: number;
  recurrence: {
    interval: string;
    count: number;
  };
  metadata: {
    banner?: string;
  };
}

export interface Session {
  id: string;
  url: string;
}
