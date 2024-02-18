import Loader from "components/Loader";
import Page from "components/Page";
import SubscriptionCard from "components/subscriptions/SubscriptionCard";
import SubscriptionCardStripe from "components/subscriptions/SubscriptionCardStripe";
import { isSubscriptionActiveAndUnassiged } from "helpers/subscriptions";
import { Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useFetchSubscriptionsQuery } from "store/api/subscriptions";
import { ISubscriptionBase } from "types/subscription";

const SubscriptionsPage = () => {
  const subscriptions = useFetchSubscriptionsQuery();

  if (subscriptions.isLoading) return <Loader />;

  const sortByExpireDate = (
    subscriptionA: ISubscriptionBase,
    subscriptionB: ISubscriptionBase
  ) => {
    if (subscriptionB.expires === "never" && subscriptionA.expires === "never")
      return 0;
    if (subscriptionA.expires === "never") return -1;
    if (subscriptionB.expires === "never") return 1;
    return (
      new Date(subscriptionB.expires).getTime() -
      new Date(subscriptionA.expires).getTime()
    );
  };

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

    const sortedSubscriptions = [...subscriptions.data].sort(sortByExpireDate);

    return (
      <Stack direction="vertical" gap={2}>
        {sortedSubscriptions.map((subscription) => {
          if (subscription.stripe)
            return (
              <SubscriptionCardStripe
                key={subscription.id}
                subscription={subscription}
              />
            );
          return (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
            />
          );
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
