import banner1 from "assets/subscriptions/subscription_banner_1.png";
import banner2 from "assets/subscriptions/subscription_banner_2.png";
import banner3 from "assets/subscriptions/subscription_banner_3.png";
import banner4 from "assets/subscriptions/subscription_banner_4.png";
import { Subscription, SubscriptionPrice } from "store/api";

const banners = [
  {
    name: "subscription_banner_1",
    banner: banner1,
  },
  {
    name: "subscription_banner_2",
    banner: banner2,
  },
  {
    name: "subscription_banner_3",
    banner: banner3,
  },
  {
    name: "subscription_banner_4",
    banner: banner4,
  },
];

export const isSubscriptionActive = (subscription: Subscription) => {
  if (subscription.expires === "never") return true;
  return new Date(subscription.expires).getTime() > new Date().getTime();
};

export const isSubscriptionActiveAndUnassiged = (
  subscription: Subscription
) => {
  return isSubscriptionActive(subscription) && !subscription.server;
};

export const getSubscriptionPriceBanner = (price: SubscriptionPrice) => {
  if (price.metadata.banner) {
    const banner = banners.find((b) => b.name === price.metadata.banner);
    if (banner) return banner.banner;
  }

  return banners[0].banner;
};
