import LeaveServer from "components/LeaveServer";
import Loader from "components/Loader";
import ServerCard from "components/ServerCard";
import SubscriptionDelete from "components/SubscriptionDelete";
import SubscriptionPriceCard from "components/SubscriptionPriceCard";
import { Button, Card, Stack } from "react-bootstrap";
import { Link, Navigate, useParams } from "react-router-dom";
import { useGetAdminSubscriptionQuery } from "store/api/admin";

const AdminSubscriptionPage = () => {
  const { subscriptionId = "" } = useParams();
  const subscription = useGetAdminSubscriptionQuery({ id: subscriptionId });

  if (subscription.isFetching) return <Loader />;
  if (!subscription.data) return <Navigate to=".." replace={true} />;

  const { owner, server, expires, limits, stripe } = subscription.data;

  return (
    <Stack gap={3}>
      <Card>
        <Card.Header>Subscription</Card.Header>
        <Card.Body>
          <Stack gap={2}>
            {stripe?.price && (
              <div className="d-flex justify-content-center justify-content-md-center">
                <SubscriptionPriceCard price={stripe.price} />
              </div>
            )}

            <Stack direction="horizontal" gap={1}>
              <span>Status: </span>
              <span className="text-primary">
                {expires === "never"
                  ? `Never expires`
                  : `
                        ${
                          new Date(expires).getTime() > new Date().getTime()
                            ? `Active until `
                            : `Expired at `
                        }
                         ${new Date(expires).toLocaleString()}`}
              </span>
              {stripe && <span>(Auto-managed by Stripe)</span>}
            </Stack>

            {owner && (
              <Stack direction="horizontal" gap={1}>
                <span>Owner: </span>
                <span className="text-primary">{owner}</span>
              </Stack>
            )}

            <Stack direction="horizontal" gap={2}>
              <div>Track Limits:</div>
              <div className="text-primary">
                {limits ? "Custom" : "Default"}
              </div>
            </Stack>

            {limits && (
              <ul>
                <li>Players: {limits.players}</li>
                <li>Guilds: {limits.guilds}</li>
                <li>Alliances: {limits.alliances}</li>
              </ul>
            )}
          </Stack>
        </Card.Body>
        <Card.Footer>
          <Stack direction="horizontal" gap={2} className="justify-content-end">
            {/* <SubscriptionEdit subscription={subscription.data} /> */}
            <SubscriptionDelete subscription={subscription.data} />
          </Stack>
        </Card.Footer>
      </Card>

      {server && (
        <ServerCard
          list
          server={server}
          header={<Card.Header>Assigned to:</Card.Header>}
        >
          <Stack direction="horizontal" gap={2} className="justify-content-end">
            <Link to={`/dashboard/${subscriptionId}`}>
              <Button variant="primary">Dashboard</Button>
            </Link>
            <LeaveServer server={server} />
          </Stack>
        </ServerCard>
      )}
    </Stack>
  );
};

export default AdminSubscriptionPage;
