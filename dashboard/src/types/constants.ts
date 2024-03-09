export interface IAlbionServer {
  id: string;
  name: string;
}

export interface IConstants {
  languages: string[];
  modes: string[];
  rankingModes: string[];
  providers: {
    id: string;
    name: string;
    events: boolean;
    battles: boolean;
  }[];
  servers: IAlbionServer[];
  subscriptionStatuses: string[];
}
