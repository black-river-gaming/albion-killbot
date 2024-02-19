import Loader from "components/Loader";
import NoData from "components/common/NoData";
import SubscriptionStripePriceCard from "components/subscriptions/SubscriptionStripePriceCard";
import { Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useFetchServerQuery } from "store/api";
import { useFetchSubscriptionPricesQuery } from "store/api/subscriptions";

const ServerSubscriptionPage = () => {
  const { serverId = "" } = useParams();
  const server = useFetchServerQuery(serverId);
  const prices = useFetchSubscriptionPricesQuery({ currency: "usd" });

  if (!server.data) return <NoData />;

  const { subscription } = server.data;

  if (!subscription) {
    return (
      <div>
        <h5 className="d-flex justify-content-center">
          Ascend to Power - Unlock Premium Benefits
        </h5>
        {prices.isLoading && <Loader />}
        {prices.data?.prices.map((price) => (
          <SubscriptionStripePriceCard price={price} />
        ))}
      </div>
    );
  }

  return <Card>{subscription.id}</Card>;
};

export default ServerSubscriptionPage;
