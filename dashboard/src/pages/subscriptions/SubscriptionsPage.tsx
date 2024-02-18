import Loader from "components/Loader";
import Page from "components/Page";
import SubscriptionCard from "components/subscriptions/SubscriptionCard";
import SubscriptionCardStripe from "components/subscriptions/SubscriptionCardStripe";
import { isSubscriptionActiveAndUnassiged } from "helpers/subscriptions";
import { Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useFetchSubscriptionsQuery } from "store/api/subscriptions";

const SubscriptionsPage = () => {
  const subscriptions = useFetchSubscriptionsQuery();

  if (subscriptions.isLoading) return <Loader />;

  const renderUserSubscriptions = () => {
    if (!subscriptions.data) {
      return (
        <h5 className="d-flex justify-content-center py-5">
          No data available. Please refresh the page and try again.
        </h5>
      );
    }

    if (subscriptions.data.length === 0) {
      return (
        <h5 className="d-flex justify-content-center py-5">
          <span>
            No subscriptions. Please visit the{" "}
            <Link to="/premium">Premium Page</Link> to purchase one.
          </span>
        </h5>
      );
    }

    return (
      <Stack direction="vertical" gap={2}>
        {subscriptions.data.map((subscription) => {
          if (subscription.stripe)
            return <SubscriptionCardStripe subscription={subscription} />;
          return <SubscriptionCard subscription={subscription} />;
        })}
      </Stack>
    );
  };

  return (
    <Page
      title="My Subscriptions"
      alerts={[
        {
          show: subscriptions.data?.some(isSubscriptionActiveAndUnassiged),
          variant: "success",
          message: (
            <div>
              You currently have an active subscription that is not assigned to
              a server. Make sure to assign it before being able to benefit from
              the subscription.
            </div>
          ),
        },
      ]}
    >
      {renderUserSubscriptions()}
    </Page>
  );
};

export default SubscriptionsPage;
