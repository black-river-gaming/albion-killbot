import { useState } from "react";
import { Alert, Card, Col, Form, Row } from "react-bootstrap";
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
    if (!subscription) {
      return (
        <Alert variant="dark" className="mx-2">
          This server doesn't have an active subscription.
        </Alert>
      );
    }

    return (
      <div className="px-2">
        <div className="pb-2">
          Server Status: Active until{" "}
          {new Date(subscription.expires).toLocaleDateString()}
        </div>
        {subscription.stripe?.price && (
          <Row className="justify-content-center">
            <Col lg={6}>
              <SubscriptionPriceCard price={subscription.stripe?.price} />
            </Col>
          </Row>
        )}
      </div>
    );
  };

  return (
    <Card>
      <h4 className="d-flex justify-content-center p-2">Subscription</h4>
      <div className="px-2">{renderServerSubscription(serverSubscription)}</div>
      <Card.Body>
        <Form onSubmit={() => ""}>
          <Form.Group controlId="subscription">
            <Form.Label>Subscription</Form.Label>
            <Form.Select
              aria-label="Subscription select"
              value={subscription}
              onChange={(e) => setSubscription(e.target.value)}
            >
              {subscriptions.data?.map((subscription) => (
                <option key={subscription.id} value={subscription.id}>
                  {subscription.expires}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
        {/* <div className="d-flex justify-content-end">
          <Button variant="secondary" className="mx-2">
            Transfer
          </Button>
          <Button className="mx-2">Manage</Button>
          <Link to="/premium" className="mx-2">
            <Button>Buy</Button>
          </Link>
        </div> */}
      </Card.Body>
    </Card>
  );
};

export default SubscriptionPage;
