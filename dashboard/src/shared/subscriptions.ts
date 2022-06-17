import { Subscription } from "store/api";

export const isSubscriptionActive = (subscription: Subscription) => {
  if (subscription.expires === "never") return true;
  return new Date(subscription.expires).getTime() > new Date().getTime();
};

export const isSubscriptionActiveAndUnassiged = (
  subscription: Subscription
) => {
  return isSubscriptionActive(subscription) && !subscription.server;
};
