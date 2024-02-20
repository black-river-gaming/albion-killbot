import { Limits } from "./limits";
import { ServerBase } from "./server";
import { User } from "./user";

export interface ISubscriptionBase {
  readonly id: string;
  expires: string | "never";
  limits?: Limits;
}

export interface ISubscription extends ISubscriptionBase {
  owner?: string;
  server?: string;
  stripe?: string;
}

export interface ISubscriptionExtended extends ISubscriptionBase {
  owner?: User;
  server?: ServerBase;
  stripe?: {
    id: string;
    customer: string;
    status: string;
    cancel_at_period_end: boolean;
    current_period_end: number;
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
    tag?: string;
  };
}

export interface Session {
  id: string;
  url: string;
}
