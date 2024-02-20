import { Limits } from "./limits";
import { ISettings } from "./settings";
import { ISubscriptionExtended } from "./subscription";
import { ITrackList } from "./track";

export interface ServerBase {
  id: string;
  name: string;
  icon?: string;
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
  subscription: ISubscriptionExtended;
  track: ITrackList;
}

export interface IChannel {
  id: string;
  name: string;
  type: number;
  parentId?: string;
}
