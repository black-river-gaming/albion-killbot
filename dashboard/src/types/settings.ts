export interface ISettings {
  server: string;
  general: {
    locale: string;
    showAttunement?: boolean;
    guildTags: boolean;
    splitLootValue: boolean;
  };
  kills: {
    enabled: boolean;
    channel: string;
    mode: string;
    provider?: string;
  };
  deaths: {
    enabled: boolean;
    channel: string;
    mode: string;
    provider?: string;
  };
  juicy: {
    enabled: {
      [serverId: string]: boolean;
    };
    channel: string;
    mode: string;
    provider?: string;
  };
  battles: {
    enabled: boolean;
    channel: string;
    threshold: {
      players: number;
      guilds: number;
      alliances: number;
    };
    provider?: string;
  };
  rankings: {
    enabled: boolean;
    channel: string;
    daily: string;
    weekly: string;
    monthly: string;
  };
}
