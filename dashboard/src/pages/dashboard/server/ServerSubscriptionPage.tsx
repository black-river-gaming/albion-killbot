import Loader from "components/Loader";
import Box from "components/common/Box";
import NoData from "components/common/NoData";
import SubscriptionStripePriceCard from "components/subscriptions/SubscriptionStripePriceCard";
import { Card, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useFetchServerQuery } from "store/api";
import {
  useCreateSubscriptionCheckoutMutation,
  useFetchSubscriptionPricesQuery,
} from "store/api/subscriptions";

const ServerSubscriptionPage = () => {
  const { serverId = "" } = useParams();
  const server = useFetchServerQuery(serverId);
  const prices = useFetchSubscriptionPricesQuery({ currency: "usd" });

  const [dispatchCreateSubscriptionCheckout, createSubscriptionCheckout] =
    useCreateSubscriptionCheckoutMutation();

  if (createSubscriptionCheckout.isLoading) return <Loader />;
  if (createSubscriptionCheckout.isSuccess && createSubscriptionCheckout.data) {
    window.location.href = createSubscriptionCheckout.data.url;
  }

  if (!server.data) return <NoData />;
  const { subscription } = server.data;

  if (!subscription) {
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

  return <Card>{subscription.id}</Card>;
};

export default ServerSubscriptionPage;
