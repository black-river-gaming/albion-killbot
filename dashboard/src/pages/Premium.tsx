import { faStripe } from "@fortawesome/free-brands-svg-icons";
import {
  faCircleCheck,
  faCircleQuestion,
  faPeopleGroup
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "components/Loader";
import SubscriptionAssign from "components/SubscriptionAssign";
import SubscriptionPriceCard from "components/SubscriptionPriceCard";
import { getServerPictureUrl } from "helpers/discord";
import { isSubscriptionActiveAndUnassiged } from "helpers/subscriptions";
import { getCurrency } from "helpers/utils";
import LocaleCurrency from "locale-currency";
import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  ListGroup,
  Row,
  Stack
} from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import {
  useBuySubscriptionMutation,
  useFetchPricesQuery,
  useFetchSubscriptionsQuery,
  useFetchUserQuery,
  useManageSubscriptionMutation
} from "store/api";
import { ServerBase, SubscriptionPrice } from "types";
import UserSubscriptionsCard from "./styles/Premium";

const Premium = () => {
  const user = useFetchUserQuery();
  const [currency, setCurrency] = useState(
    LocaleCurrency.getCurrency(user.data?.locale || "en-US")
  );
  const subscriptions = useFetchSubscriptionsQuery();
  const pricesResponse = useFetchPricesQuery({ currency });
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

  const renderCurrenciesDropdown = () => {
    if (!pricesResponse.data?.currencies) return null;

    return (
      <Stack
        direction="horizontal"
        gap={2}
        className="d-flex align-items-center"
      >
        <div>Currency:</div>

        <Dropdown className="d-flex">
          <Dropdown.Toggle variant="primary" id="currencies">
            {currency?.toUpperCase() || "USD"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {pricesResponse.data.currencies.map((currency) => (
              <Dropdown.Item
                key={currency}
                onClick={() => setCurrency(currency)}
              >
                {currency?.toUpperCase() || "USD"}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Stack>
    );
  };

  const renderPrices = () => {
    if (pricesResponse.isFetching) return <Loader />;

    return (
      <Row className="gy-2">
        {pricesResponse.data?.prices.map((price: SubscriptionPrice, i) => (
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
    const renderSubscriptionServer = (server: string | ServerBase) => {
      if (typeof server === "string") return;

      return (
        <Stack
          className="d-flex align-items-center"
          direction="horizontal"
          gap={2}
        >
          <img
            src={getServerPictureUrl(server, true)}
            style={{ width: 30, height: 30 }}
            alt={server.name}
          />
          <div>{server.name}</div>
        </Stack>
      );
    };

    if (subscriptions.isFetching) return <Loader />;
    if (!subscriptions.data) return;
    const activeSubscriptions = subscriptions.data.filter(
      (subscription) =>
        subscription.expires === "never" ||
        new Date(subscription.expires).getTime() > new Date().getTime()
    );
    if (activeSubscriptions.length === 0) return;

    return (
      <UserSubscriptionsCard>
        <Card.Header>Your Active Subscriptions:</Card.Header>

        <Card.Body>
          <Stack direction="vertical" gap={4}>
            {activeSubscriptions.map((subscription) => {
              const price = subscription.stripe?.price;

              return (
                <Row
                  key={subscription.id}
                  className="user-subscription-list-item gy-2"
                >
                  <Col
                    xs={12}
                    xl={4}
                    className="info d-flex flex-column justify-content-center"
                  >
                    <div className="id-text">
                      <span>#{subscription.id}</span>
                      {subscription.stripe?.cancel_at_period_end && (
                        <span className="cancelled-text">cancelled</span>
                      )}
                    </div>
                    <div className="active">
                      <div className="expires">
                        {subscription.expires === "never"
                          ? `Activated`
                          : `${
                              new Date(subscription.expires).getTime() >
                              new Date().getTime()
                                ? `Active until `
                                : `Expired at `
                            } ${new Date(
                              subscription.expires
                            ).toLocaleString()}`}
                      </div>
                      {price && (
                        <div className="price">
                          {getCurrency(price.price / 100, {
                            currency: price.currency,
                          })}
                          /{price.recurrence.count} {price.recurrence.interval}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col
                    xs={12}
                    md={6}
                    xl={4}
                    className="d-flex align-items-center pt-xl-2"
                  >
                    {subscription.server &&
                      renderSubscriptionServer(subscription.server)}
                  </Col>

                  <Col
                    xs={12}
                    md={6}
                    xl={4}
                    className="actions d-flex align-items-center justify-content-end"
                  >
                    <Button
                      variant="primary"
                      onClick={() => setSubscriptionAssignId(subscription.id)}
                    >
                      {subscription.server ? "Transfer" : "Assign"}
                    </Button>
                    {subscription.stripe?.customer && (
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (subscription.stripe?.customer)
                            dispatchManageSubscription(
                              subscription.stripe.customer
                            );
                        }}
                      >
                        {subscription.stripe?.cancel_at_period_end
                          ? "Renew"
                          : "Cancel"}
                      </Button>
                    )}
                  </Col>
                </Row>
              );
            })}
          </Stack>
        </Card.Body>
      </UserSubscriptionsCard>
    );
  };

  return (
    <Container fluid className="py-3">
      <Stack gap={2}>
        {status === "success" && checkoutId && (
          <SubscriptionAssign checkoutId={checkoutId} />
        )}
        {status === "cancel" && (
          <Alert className="mb-4" variant="danger">
            Purchase cancelled.
          </Alert>
        )}
        {!status && subscriptions.data?.some(isSubscriptionActiveAndUnassiged) && (
          <Alert className="mb-4" variant="success">
            You currently have an active subscription that is not assigned to a
            server. Make sure to assign it before being able to benefit from the
            subscription.
          </Alert>
        )}
        <div className="d-flex justify-content-center">
          <h1>Premium</h1>
        </div>
        <div className="d-flex justify-content-end">
          {renderCurrenciesDropdown()}
        </div>
        {renderPrices()}
        {renderUserSubscriptions()}
        {subscriptionAssignId && (
          <SubscriptionAssign
            subscriptionId={subscriptionAssignId}
            onClose={() => setSubscriptionAssignId("")}
          />
        )}
      </Stack>
    </Container>
  );
};

export default Premium;
