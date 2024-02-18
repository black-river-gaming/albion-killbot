import { faStripe } from "@fortawesome/free-brands-svg-icons";
import {
  faCircleCheck,
  faCircleQuestion,
  faPeopleGroup,
  faPerson,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "components/Loader";
import SubscriptionAssign from "components/subscriptions/SubscriptionAssign";
import SubscriptionPriceCard from "components/subscriptions/SubscriptionPriceCard";
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
  Stack,
} from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { useFetchUserQuery } from "store/api";
import {
  useCreateSubscriptionCheckoutMutation,
  useFetchSubscriptionPricesQuery,
} from "store/api/subscriptions";
import { SubscriptionPrice } from "types/subscription";

const PremiumPage = () => {
  const user = useFetchUserQuery();
  const [currency, setCurrency] = useState(
    LocaleCurrency.getCurrency(user.data?.locale || "en-US")
  );
  const pricesResponse = useFetchSubscriptionPricesQuery({ currency });
  const [dispatchBuySubscription, buySubscription] =
    useCreateSubscriptionCheckoutMutation();
  const [queryParams] = useSearchParams();
  const status = queryParams.get("status");
  const checkoutId = queryParams.get("checkout_id");
  const [subscriptionAssignId, setSubscriptionAssignId] = useState("");

  if (buySubscription.isLoading) return <Loader />;
  if (buySubscription.isSuccess && buySubscription.data) {
    window.location.href = buySubscription.data.url;
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
                      <FontAwesomeIcon icon={faPerson} className="s-1" />
                      <span className="ps-2">10 Player slots</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faPeopleGroup} className="s-1" />
                      <span className="ps-2">1 Guild slot</span>
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
                      onClick={() =>
                        dispatchBuySubscription({ priceId: price.id })
                      }
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
        <div className="d-flex justify-content-center">
          <h1>Premium</h1>
        </div>
        <div className="d-flex justify-content-end">
          {renderCurrenciesDropdown()}
        </div>
        {renderPrices()}
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

export default PremiumPage;
