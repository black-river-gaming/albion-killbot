import { useState } from "react";
import { Alert, Button, Card, Col, Row } from "react-bootstrap";
import { Navigate, useParams } from "react-router-dom";
import Loader from "shared/components/Loader";
import SubscriptionPriceCard from "shared/components/SubscriptionPriceCard";
import { Subscription, useFetchSubscriptionsQuery } from "store/api";

const SubscriptionPage = () => {
  const { serverId = "" } = useParams();
  const subscriptions = useFetchSubscriptionsQuery();
  const [subscription, setSubscription] = useState("");

  if (subscriptions.isFetching) return <Loader />;
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
                  <Button variant="secondary">Transfer</Button>
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
      <div>{renderServerSubscription(serverSubscription)}</div>
      <Card className="mt-3 p-2">
        {/* <div className="d-flex justify-content-end">
          <Button className="mx-2">Manage</Button>
          <Link to="/premium" className="mx-2">
            <Button>Buy</Button>
          </Link>
        </div> */}
      </Card>
    </div>
  );
};

export default SubscriptionPage;
