import { ISubscriptionPartial } from "types";

export type IFindSubscriptions = {
  server?: string;
  owner?: string;
  status?: "free" | "active" | "expired";
  stripe?: string;
};
export type IGetSubscription = {
  id: string;
};
export type ICreateSubscription = Omit<ISubscriptionPartial, "id">;
export type IUpdateSubscription = Omit<ISubscriptionPartial, "id">;
export type IDeleteSubscription = {
  id: string;
};
