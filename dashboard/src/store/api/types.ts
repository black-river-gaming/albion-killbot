import {
  ISubscription,
  ISubscriptionExtended,
  Session,
  SubscriptionPrice,
} from "types/subscription";

// Admin
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

// Subscriptions
export type IFetchSubscriptionsRequest = void;
export type IFetchSubscriptionsResponse = ISubscriptionExtended[];

export type IFetchSubscriptionPricesRequest = {
  currency: string;
};
export type IFetchSubscriptionPricesResponse = {
  currencies: string[];
  prices: SubscriptionPrice[];
};

export type ICreateSubscriptionCheckoutRequest = {
  priceId: string;
  serverId?: string;
};
export type ICreateSubscriptionCheckoutResponse = Session;

export type IDoSubscriptionAssignRequest = {
  server: string;
  checkoutId?: string;
  subscriptionId?: string;
};
export type IDoSubscriptionAssignResponse = ISubscriptionExtended;

export type IDoSubscriptionManageRequest = {
  subscriptionId: string;
  customerId?: string;
  serverId?: string;
};
export type IDoSubscriptionManageResponse = Session;
