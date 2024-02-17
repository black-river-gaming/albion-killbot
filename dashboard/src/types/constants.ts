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
  servers: string[];
  subscriptionStatuses: string[];
}
