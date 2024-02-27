import Box from "components/common/Box";
import Loader from "components/common/Loader";
import NoData from "components/common/NoData";
import SubscriptionCard from "components/subscriptions/SubscriptionCard";
import SubscriptionCardStripe from "components/subscriptions/SubscriptionCardStripe";
import SubscriptionStripePriceCard from "components/subscriptions/SubscriptionStripePriceCard";
import { Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useGetServerSubscriptionQuery } from "store/api/server";
import {
  useCreateSubscriptionCheckoutMutation,
  useFetchSubscriptionPricesQuery,
} from "store/api/subscriptions";

const ServerSubscriptionPage = () => {
  const { serverId = "" } = useParams();
  const subscription = useGetServerSubscriptionQuery({ serverId });
  const prices = useFetchSubscriptionPricesQuery({ currency: "usd" });

  const [dispatchCreateSubscriptionCheckout, createSubscriptionCheckout] =
    useCreateSubscriptionCheckoutMutation();

  if (createSubscriptionCheckout.isLoading) return <Loader />;
  if (createSubscriptionCheckout.isSuccess && createSubscriptionCheckout.data) {
    window.location.href = createSubscriptionCheckout.data.url;
  }

  if (subscription.isLoading) return <Loader />;
  const isNotFoundError =
    subscription.error &&
    "status" in subscription.error &&
    subscription.error.status === "PARSING_ERROR" &&
    subscription.error.originalStatus === 404;
  if (subscription.error && !isNotFoundError) {
    return <NoData />;
  }

  if (!subscription.data) {
    return (
      <div>
        {prices.isLoading && <Loader />}
        {prices.data && (
          <Box>
            <h5 className="d-flex justify-content-center">
              Ascend to Power - Unlock Premium Benefits
            </h5>
            <div
              className="pb-2"
              style={{
                overflowX: "auto",
                overflowY: "hidden",
              }}
            >
              <Stack direction="horizontal" gap={4}>
                {prices.data.prices.map((price) => (
                  <SubscriptionStripePriceCard
                    key={price.id}
                    price={price}
                    onSelect={() => {
                      dispatchCreateSubscriptionCheckout({
                        priceId: price.id,
                        serverId,
                      });
                    }}
                  />
                ))}
              </Stack>
            </div>
          </Box>
        )}
      </div>
    );
  }

  if (subscription.data.stripe) {
    return <SubscriptionCardStripe subscription={subscription.data} />;
  }

  return <SubscriptionCard subscription={subscription.data} />;
};

export default ServerSubscriptionPage;
