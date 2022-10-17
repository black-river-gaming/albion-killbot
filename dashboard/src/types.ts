export interface User {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  admin: boolean;
}

export interface ServerPartial {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  admin: boolean;
  bot: boolean;
}

export interface Server extends ServerPartial {
  channels: Channel[];
  settings: Settings;
  limits: {
    players: number;
    guilds: number;
    alliances: number;
  };
  track: TrackList;
}

export interface Channel {
  id: string;
  name: string;
  type: number;
  parentId?: string;
}

export interface Settings {
  guild: string;
  lang: string;
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

export interface TrackList {
  players: {
    id: string;
    name: string;
  }[];
  guilds: {
    id: string;
    name: string;
  }[];
  alliances: {
    id: string;
    name: string;
  }[];
}

export type SearchResults = TrackList;

export interface Subscription {
  id: string;
  owner: string;
  expires: string | "never";
  server?: string;
  stripe?: {
    id: string;
    cancel_at_period_end: boolean;
    current_period_end: number;
    customer: string;
    price: SubscriptionPrice;
  };
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
