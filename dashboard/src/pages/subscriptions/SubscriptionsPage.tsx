import Loader from "components/Loader";
import Page from "components/Page";
import SubscriptionCardStripe from "components/subscriptions/SubscriptionCardStripe";
import { getServerPictureUrl } from "helpers/discord";
import { isSubscriptionActiveAndUnassiged } from "helpers/subscriptions";
import { Button, Card, Col, Row, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useFetchSubscriptionsQuery } from "store/api/subscriptions";
import { ServerBase } from "types/server";

const SubscriptionsPage = () => {
  const subscriptions = useFetchSubscriptionsQuery();

  if (subscriptions.isLoading) return <Loader />;

  const renderUserSubscriptions = () => {
    if (!subscriptions.data) {
      return (
        <h5 className="d-flex justify-content-center py-5">
          No data available. Please refresh the page and try again.
        </h5>
      );
    }

    if (subscriptions.data.length === 0) {
      return (
        <h5 className="d-flex justify-content-center py-5">
          <span>
            No subscriptions. Please visit the{" "}
            <Link to="/premium">Premium Page</Link> to purchase one.
          </span>
        </h5>
      );
    }

    const renderSubscriptionServer = (server: ServerBase) => {
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

    return (
      <Stack direction="vertical" gap={2}>
        {subscriptions.data.map((subscription) => {
          if (subscription.stripe) {
            return <SubscriptionCardStripe subscription={subscription} />;
          }

          return (
            <Card>
              <Card.Header>
                <h6 className="m-0">
                  <Stack direction="horizontal" gap={2}>
                    <div>#{subscription.id}</div>
                  </Stack>
                </h6>
              </Card.Header>

              <Card.Body>
                <Row key={subscription.id} className="gy-2">
                  <Col
                    xs={12}
                    xl={4}
                    className="d-flex flex-column justify-content-center"
                  >
                    <div className="id-text">
                      <span>#{subscription.id}</span>
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
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })}
      </Stack>
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
