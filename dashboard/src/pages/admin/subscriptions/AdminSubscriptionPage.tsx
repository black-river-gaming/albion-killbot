import LeaveServer from "components/LeaveServer";
import Loader from "components/Loader";
import ServerCard from "components/ServerCard";
import SubscriptionDelete from "components/SubscriptionDelete";
import SubscriptionEdit from "components/subscriptions/SubscriptionEdit";
import { getSubscriptionUrl } from "helpers/stripe";
import { Button, Card, Stack } from "react-bootstrap";
import { Link, Navigate, useParams } from "react-router-dom";
import { useFetchServerQuery } from "store/api";
import { useGetAdminSubscriptionQuery } from "store/api/admin";

const AdminSubscriptionPage = () => {
  const { subscriptionId = "" } = useParams();
  const subscription = useGetAdminSubscriptionQuery({ id: subscriptionId });
  const server = useFetchServerQuery(subscription.data?.server || "", {
    skip: !subscription.data?.server,
  });

  if (subscription.isFetching) return <Loader />;
  if (!subscription.data) return <Navigate to=".." replace={true} />;

  const {
    id,
    owner,
    server: subscriptionServer,
    expires,
    limits,
    stripe,
  } = subscription.data;

  return (
    <Stack gap={3}>
      <Card>
        <Card.Header>Subscription</Card.Header>
        <Card.Body>
          <Stack gap={2}>
            <Stack direction="horizontal" gap={1}>
              <span>Id: </span>
              <span className="text-primary">{id}</span>
            </Stack>

            {owner && (
              <Stack direction="horizontal" gap={1}>
                <span>Owner: </span>
                <span className="text-primary">{owner}</span>
              </Stack>
            )}

            {subscriptionServer && (
              <Stack direction="horizontal" gap={1}>
                <span>Server: </span>
                <span className="text-primary">{subscriptionServer}</span>
              </Stack>
            )}

            {stripe && (
              <Stack direction="horizontal" gap={1}>
                <span>Stripe: </span>
                <a
                  href={getSubscriptionUrl(stripe)}
                  target="_blank"
                  className="text-primary"
                  rel="noreferrer"
                >
                  {stripe}
                </a>
              </Stack>
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
            <SubscriptionEdit subscription={subscription.data} />
            <SubscriptionDelete subscription={subscription.data} />
          </Stack>
        </Card.Footer>
      </Card>
      {subscription.data.server && (
        <ServerCard
          list
          loading={server.isLoading}
          server={server.data}
          header={<Card.Header>Assigned to:</Card.Header>}
        >
          {server.data && (
            <Stack
              direction="horizontal"
              gap={2}
              className="justify-content-end"
            >
              <Link to={`/dashboard/${server.data.id}`}>
                <Button variant="primary">Dashboard</Button>
              </Link>
              <LeaveServer server={server.data} />
            </Stack>
          )}
        </ServerCard>
      )}
    </Stack>
  );
};

export default AdminSubscriptionPage;
