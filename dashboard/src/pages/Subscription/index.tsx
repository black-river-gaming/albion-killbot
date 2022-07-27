import Loader from "components/Loader";
import SubscriptionAssignModal from "components/SubscriptionAssignModal";
import SubscriptionPriceCard from "components/SubscriptionPriceCard";
import { useState } from "react";
import { Alert, Button, Col, Row } from "react-bootstrap";
import { Link, Navigate, useParams } from "react-router-dom";
import { useFetchSubscriptionsQuery } from "store/api";

const SubscriptionPage = () => {
  const { serverId = "" } = useParams();
  const subscriptions = useFetchSubscriptionsQuery();
  const [subscriptionAssignId, setSubscriptionAssignId] = useState("");

  if (subscriptions.data && subscriptions.data.length === 0)
    return <Navigate to="/premium" />;

  const renderServerSubscription = () => {
    const subscription = subscriptions.data?.find(
      (subscription) => subscription.server === serverId
    );

    return (
      <div>
        <Alert variant="dark" className="d-flex justify-content-start py-2">
          {subscription ? (
            <div>
              {subscription.expires === "never"
                ? `Server Status: Activated`
                : `Server Status: Active until ${new Date(
                    subscription.expires
                  ).toLocaleDateString()}`}
            </div>
          ) : (
            <div>
              This server doesn't have an active subscription. Please, go to{" "}
              <Link to="/dashboard">Premium</Link> page to assign a
              subscription.
            </div>
          )}
        </Alert>
        {subscription?.stripe && subscription.stripe?.price && (
          <Row className="justify-content-center pb-3">
            <Col lg={6}>
              <SubscriptionPriceCard price={subscription.stripe?.price}>
                <div className="d-flex justify-content-end px-2 pb-2">
                  <Button
                    variant="secondary"
                    onClick={() => setSubscriptionAssignId(subscription.id)}
                  >
                    Transfer
                  </Button>
                </div>
              </SubscriptionPriceCard>
            </Col>
          </Row>
        )}
      </div>
    );
  };

  return (
    <>
      <h4 className="d-flex justify-content-center p-2">Subscription</h4>
      {subscriptions.isFetching && <Loader />}
      {subscriptions.isSuccess && renderServerSubscription()}
      {subscriptionAssignId && (
        <SubscriptionAssignModal
          currentServerId={serverId}
          subscriptionId={subscriptionAssignId}
          onClose={() => setSubscriptionAssignId("")}
        />
      )}
    </>
  );
};

export default SubscriptionPage;
