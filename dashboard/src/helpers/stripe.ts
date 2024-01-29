export const getSubscriptionUrl = (stripeId: string) => {
  return `https://dashboard.stripe.com/subscriptions/${stripeId}`;
};
