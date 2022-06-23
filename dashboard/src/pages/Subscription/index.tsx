import { useState } from "react";
import { Alert, Button, Col, Row } from "react-bootstrap";
import { Navigate, useParams } from "react-router-dom";
import Loader from "shared/components/Loader";
import SubscriptionAssignModal from "shared/components/SubscriptionAssignModal";
import SubscriptionPriceCard from "shared/components/SubscriptionPriceCard";
import { Subscription, useFetchSubscriptionsQuery } from "store/api";

const SubscriptionPage = () => {
  const { serverId = "" } = useParams();
  const subscriptions = useFetchSubscriptionsQuery();
  const [subscriptionAssignId, setSubscriptionAssignId] = useState("");

  if (subscriptions.data && subscriptions.data.length === 0)
    return <Navigate to="/premium" />;

  const serverSubscription = subscriptions.data?.find(
    (subscription) => subscription.server === serverId
  );

  const renderServerSubscription = (subscription: Subscription | undefined) => {
    return (
      <div>
        <Alert variant="dark" className="d-flex justify-content-start py-2">
          {subscription ? (
            <div>
              Server Status: Active until{" "}
              {new Date(subscription.expires).toLocaleDateString()}
            </div>
          ) : (
            <div>This server doesn't have an active subscription.</div>
          )}
        </Alert>
        {subscription?.stripe && subscription.stripe?.price && (
          <Row className="justify-content-center">
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
    <div>
      <h4 className="d-flex justify-content-center p-2">Subscription</h4>
      {subscriptions.isFetching && <Loader />}
      {serverSubscription && (
        <div>{renderServerSubscription(serverSubscription)}</div>
      )}
      {subscriptionAssignId && (
        <SubscriptionAssignModal
          currentServerId={serverId}
          subscriptionId={subscriptionAssignId}
        />
      )}
    </div>
  );
};

export default SubscriptionPage;
