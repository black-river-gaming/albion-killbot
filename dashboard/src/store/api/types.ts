import { ISubscription } from "types";

export type IFindSubscriptions = {
  server?: string;
  owner?: string;
  status?: "free" | "active" | "expired";
  stripe?: string;
};
export type IGetSubscription = {
  id: string;
};
export type ICreateSubscription = Omit<ISubscription, "id">;
export type IUpdateSubscription = Omit<ISubscription, "id">;
export type IDeleteSubscription = {
  id: string;
};
