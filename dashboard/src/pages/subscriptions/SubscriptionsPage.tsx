import { faStripe } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "components/Loader";
import Page from "components/Page";
import { getServerPictureUrl } from "helpers/discord";
import { isSubscriptionActiveAndUnassiged } from "helpers/subscriptions";
import { getCurrency } from "helpers/utils";
import { Button, Card, Col, Row, Stack } from "react-bootstrap";
import {
  useDoSubscriptionManageMutation,
  useFetchSubscriptionsQuery,
} from "store/api/subscriptions";
import { ServerBase } from "types";

const SubscriptionsPage = () => {
  const subscriptions = useFetchSubscriptionsQuery();

  const [dispatchManageSubscription, manageSubscription] =
    useDoSubscriptionManageMutation();

  if (subscriptions.isLoading) return <Loader />;

  if (manageSubscription.isLoading) return <Loader />;
  if (manageSubscription.isSuccess && manageSubscription.data) {
    window.location.href = manageSubscription.data.url;
  }

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
      <Card>
        <Card.Header>Your Active Subscriptions:</Card.Header>

        <Card.Body>
          <Stack direction="vertical" gap={4}>
            {activeSubscriptions.map((subscription) => {
              const price = subscription.stripe?.price;

              return (
                <Row key={subscription.id} className="gy-2">
                  <Col
                    xs={12}
                    xl={4}
                    className="d-flex flex-column justify-content-center"
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
                      // onClick={() => setSubscriptionAssignId(subscription.id)}
                    >
                      {subscription.server ? "Transfer" : "Assign"}
                    </Button>
                    {subscription.stripe?.customer && (
                      <Button
                        variant="danger"
                        onClick={() =>
                          subscription.stripe?.customer &&
                          dispatchManageSubscription({
                            subscriptionId: subscription.id,
                            customerId: subscription.stripe.customer,
                          })
                        }
                      >
                        <FontAwesomeIcon icon={faStripe} className="s-2" />
                        <div>Manage</div>
                      </Button>
                    )}
                  </Col>
                </Row>
              );
            })}
          </Stack>
        </Card.Body>
      </Card>
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
