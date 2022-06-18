import { useState } from "react";
import { Card, Form } from "react-bootstrap";
import { Navigate, useParams } from "react-router-dom";
import Loader from "shared/components/Loader";
import ServerSubscription from "shared/components/ServerSubscription";
import { useFetchSubscriptionsQuery } from "store/api";

const Subscription = () => {
  const { serverId = "" } = useParams();
  const subscriptions = useFetchSubscriptionsQuery();
  const [subscription, setSubscription] = useState("");

  if (subscriptions.isFetching) return <Loader />;
  if (subscriptions.data && subscriptions.data.length === 0)
    return <Navigate to="/premium" />;

  const serverSubscription = subscriptions.data?.find(
    (subscription) => subscription.server === serverId
  );

  return (
    <Card>
      <h4 className="d-flex justify-content-center p-2">Subscription</h4>
      <div className="px-2">
        <ServerSubscription subscription={serverSubscription} />
      </div>
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

export default Subscription;
