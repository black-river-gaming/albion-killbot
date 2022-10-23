import Loader from "components/Loader";
import SubscriptionAssignModal from "components/SubscriptionAssignModal";
import SubscriptionPriceCard from "components/SubscriptionPriceCard";
import { useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useFetchServerQuery, useFetchUserQuery } from "store/api";
import { Subscription } from "types";

const SubscriptionPage = () => {
  const { serverId = "" } = useParams();
  const user = useFetchUserQuery();
  const server = useFetchServerQuery(serverId);
  const [subscriptionAssignId, setSubscriptionAssignId] = useState("");

  const renderServerSubscription = (subscription?: Subscription) => {
    const isSubscriptionOwner =
      subscription?.owner === user.data?.id || user.data?.admin;

    return (
      <div>
        <Card className="d-flex justify-content-start p-2">
          {subscription ? (
            <div>
              <span>Server Status: </span>
              <span className="text-primary">
                {subscription.expires === "never"
                  ? `Activated`
                  : `Active until ${new Date(
                      subscription.expires
                    ).toLocaleDateString()}`}
              </span>
            </div>
          ) : (
            <div>
              This server doesn't have an active subscription. Please, go to{" "}
              <Link to="/premium">Premium</Link> page to assign a subscription.
            </div>
          )}
        </Card>
        {subscription?.stripe && subscription.stripe?.price && (
          <Row className="justify-content-center my-3">
            <Col lg={6}>
              <SubscriptionPriceCard price={subscription.stripe?.price}>
                {isSubscriptionOwner && (
                  <div className="d-flex justify-content-end px-2 pb-2">
                    <Button
                      variant="secondary"
                      onClick={() => setSubscriptionAssignId(subscription.id)}
                    >
                      Transfer
                    </Button>
                  </div>
                )}
              </SubscriptionPriceCard>
            </Col>
          </Row>
        )}
      </div>
    );
  };

  return (
    <>
      {server.isFetching && <Loader />}
      {!server.data && <div>No data found.</div>}
      {renderServerSubscription(server.data?.subscription)}
      {subscriptionAssignId && (
        <SubscriptionAssignModal
          currentServerId={serverId}
          subscriptionId={subscriptionAssignId}
          onClose={() => setSubscriptionAssignId("")}
        />
      )}
    </>
  );
};

export default SubscriptionPage;
