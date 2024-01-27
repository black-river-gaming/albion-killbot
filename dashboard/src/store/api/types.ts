import { ISubscriptionPartial, Subscription } from "types";

export type IFetchSubscriptions = {
  server?: string;
  owner?: string;
  status?: "free" | "active" | "expired";
  stripe?: string;
};
export type ICreateSubscription = Omit<ISubscriptionPartial, "id">;
export type IUpdateSubscription = Omit<Subscription, "id">;
