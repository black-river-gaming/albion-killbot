import Loader from "components/Loader";
import Page from "components/Page";
import ServerSelect from "components/ServerSelect";
import SubscriptionStripePriceCard from "components/subscriptions/SubscriptionStripePriceCard";
import LocaleCurrency from "locale-currency";
import { useState } from "react";
import { Button, Col, Dropdown, Modal, Row, Stack } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
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
  const [dispatchCreateSubscriptionCheckout, createSubscriptionCheckout] =
    useCreateSubscriptionCheckoutMutation();
  const [queryParams] = useSearchParams();
  const status = queryParams.get("status");
  const [priceId, setPriceId] = useState("");

  if (createSubscriptionCheckout.isLoading) return <Loader />;
  if (createSubscriptionCheckout.isSuccess && createSubscriptionCheckout.data) {
    window.location.href = createSubscriptionCheckout.data.url;
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
            <SubscriptionStripePriceCard
              price={price}
              onSelect={() => setPriceId(price.id)}
            />
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Page
      alerts={[
        {
          show: status === "success",
          variant: "success",
          message: (
            <>
              <span>
                Thank you for your purchase! Go to{" "}
                <Link to="/subscriptions">My Subscriptions</Link> to see your
                new subscription.
              </span>
            </>
          ),
        },
        {
          show: status === "cancel",
          variant: "danger",
          message: "Purchase cancelled.",
        },
      ]}
      title="Premium"
    >
      <Stack gap={2}>
        <div className="d-flex justify-content-end">
          {renderCurrenciesDropdown()}
        </div>
        {renderPrices()}
      </Stack>

      <Modal
        centered={true}
        size="lg"
        show={priceId !== ""}
        onExit={() => setPriceId("")}
      >
        <Modal.Header>
          <Modal.Title>Please select a Server</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <ServerSelect
            onSelect={(serverId) =>
              dispatchCreateSubscriptionCheckout({
                priceId,
                serverId,
              })
            }
          />
        </Modal.Body>

        <Modal.Footer>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={() => setPriceId("")}>
              Cancel
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </Page>
  );
};

export default PremiumPage;
