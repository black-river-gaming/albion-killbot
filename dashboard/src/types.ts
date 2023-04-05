export interface User {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
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
  players: ITrackItem[];
  guilds: ITrackItem[];
  alliances: ITrackItem[];
}

export type ISearchResults = ITrackList;

export interface Subscription {
  id: string;
  owner: string;
  expires: string | "never";
  server?: string | ServerBase;
  stripe?: {
    id: string;
    cancel_at_period_end: boolean;
    current_period_end: number;
    customer: string;
    price: SubscriptionPrice;
  };
  limits?: Limits;
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
