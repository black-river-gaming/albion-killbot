import { faStripe } from "@fortawesome/free-brands-svg-icons";
import {
  faCircleCheck,
  faCircleQuestion,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "components/Loader";
import SubscriptionAssignModal from "components/SubscriptionAssignModal";
import SubscriptionPriceCard from "components/SubscriptionPriceCard";
import { isSubscriptionActiveAndUnassiged } from "helpers/subscriptions";
import { getCurrency } from "helpers/utils";
import { useState } from "react";
import { Alert, Button, Card, Col, ListGroup, Row } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import {
  SubscriptionPrice,
  useBuySubscriptionMutation,
  useFetchPricesQuery,
  useFetchSubscriptionsQuery,
  useManageSubscriptionMutation,
} from "store/api";
import StyledPremium from "./styles";

const Premium = () => {
  const subscriptions = useFetchSubscriptionsQuery();
  const prices = useFetchPricesQuery();
  const [dispatchBuySubscription, buySubscription] =
    useBuySubscriptionMutation();
  const [dispatchManageSubscription, manageSubscription] =
    useManageSubscriptionMutation();
  const [queryParams] = useSearchParams();
  const status = queryParams.get("status");
  const checkoutId = queryParams.get("checkout_id");
  const [subscriptionAssignId, setSubscriptionAssignId] = useState("");

  if (buySubscription.isLoading) return <Loader />;
  if (buySubscription.isSuccess && buySubscription.data) {
    window.location.href = buySubscription.data.url;
  }

  if (manageSubscription.isLoading) return <Loader />;
  if (manageSubscription.isSuccess && manageSubscription.data) {
    window.location.href = manageSubscription.data.url;
  }

  const renderPrices = () => {
    if (prices.isFetching) return <Loader />;

    return (
      <Row className="gy-2">
        {prices.data?.map((price: SubscriptionPrice, i) => (
          <Col key={price.id} sm={6} lg={4} xxl={3} className="gx-4">
            <SubscriptionPriceCard price={price}>
              <>
                <Card.Body className="pt-0">
                  <ListGroup>
                    <ListGroup.Item className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faCircleCheck} className="s-1" />
                      <span className="ps-2">No ads</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faPeopleGroup} className="s-1" />
                      <span className="ps-2">Guild track slot</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faCircleQuestion}
                        className="s-1"
                      />
                      <span className="ps-2">Premium support</span>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
                <Card.Footer>
                  <div className="d-flex justify-content-stretch">
                    <Button
                      variant="primary"
                      style={{ width: "100%" }}
                      className="d-flex align-items-center"
                      onClick={() => dispatchBuySubscription(price.id)}
                    >
                      <FontAwesomeIcon icon={faStripe} className="s-2" />
                      <div>Checkout</div>
                    </Button>
                  </div>
                </Card.Footer>
              </>
            </SubscriptionPriceCard>
          </Col>
        ))}
      </Row>
    );
  };

  const renderUserSubscriptions = () => {
    if (subscriptions.isFetching) return <Loader />;
    if (subscriptions.data?.length === 0) return;

    return (
      <Card className="p-2 mt-4 user-subscriptions">
        <div className="d-flex justify-content-center pb-2">
          Your Active Subscriptions:
        </div>

        <ListGroup>
          {subscriptions.data?.map((subscription) => {
            const price = subscription.stripe?.price;

            return (
              <ListGroup.Item
                key={subscription.id}
                className="user-subscription-list-item"
              >
                <div className="info">
                  <div className="id-text">
                    <span>#{subscription.id}</span>
                    {subscription.stripe?.cancel_at_period_end && (
                      <span className="cancelled-text">cancelled</span>
                    )}
                  </div>
                  <div className="active">
                    {subscription.expires === "never"
                      ? `Activated`
                      : `Active until ${new Date(
                          subscription.expires
                        ).toLocaleDateString()}`}
                    {price && (
                      <div className="d-flex align-items-baseline price">
                        (
                        {getCurrency(price.price / 100, {
                          currency: price.currency,
                        })}
                        /{price.recurrence.count} {price.recurrence.interval})
                      </div>
                    )}
                  </div>
                </div>
                <div className="actions">
                  {subscription.server && (
                    <Link to={`/dashboard/${subscription.server}/subscription`}>
                      <Button variant="secondary">Dashboard</Button>
                    </Link>
                  )}
                  {!subscription.server && (
                    <Button
                      variant="primary"
                      onClick={() => setSubscriptionAssignId(subscription.id)}
                    >
                      Assign
                    </Button>
                  )}
                  {subscription.stripe?.customer && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (subscription.stripe?.customer)
                          dispatchManageSubscription(
                            subscription.stripe.customer
                          );
                      }}
                    >
                      Manage
                    </Button>
                  )}
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card>
    );
  };

  return (
    <StyledPremium className="py-2">
      <div className="d-flex justify-content-center">
        <h1 className="py-2">Premium</h1>
      </div>
      {status === "cancel" && (
        <Alert className="mb-4" variant="danger">
          Purchase cancelled.
        </Alert>
      )}
      {status === "success" && checkoutId && (
        <SubscriptionAssignModal checkoutId={checkoutId} />
      )}
      {!status && subscriptions.data?.some(isSubscriptionActiveAndUnassiged) && (
        <Alert className="mb-4" variant="success">
          You currently have an active subscription that is not assigned to a
          server. Make sure to assign it before being able to benefit from the
          subscription.
        </Alert>
      )}
      {renderPrices()}
      {renderUserSubscriptions()}
      {subscriptionAssignId && (
        <SubscriptionAssignModal
          subscriptionId={subscriptionAssignId}
          onClose={() => setSubscriptionAssignId("")}
        />
      )}
    </StyledPremium>
  );
};

export default Premium;
