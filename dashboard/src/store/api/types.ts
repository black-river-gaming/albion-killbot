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
export type ICreateSubscription = {
  subscription: Omit<ISubscription, "id">;
};
export type IUpdateSubscription = {
  subscription: ISubscription;
};
export type IDeleteSubscription = {
  id: string;
};
