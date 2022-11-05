import LeaveServer from "components/LeaveServer";
import Loader from "components/Loader";
import ServerCard from "components/ServerCard";
import SubscriptionAdd from "components/SubscriptionAdd";
import SubscriptionDelete from "components/SubscriptionDelete";
import SubscriptionEdit from "components/SubscriptionEdit";
import SubscriptionPriceCard from "components/SubscriptionPriceCard";
import { Button, Card, Container, Stack } from "react-bootstrap";
import { Link, Navigate, useParams } from "react-router-dom";
import { useFetchServerQuery } from "store/api";

const AdminServer = () => {
  const { serverId = "" } = useParams();
  const server = useFetchServerQuery(serverId);

  if (server.isFetching) return <Loader />;
  if (!server.data) return <Navigate to=".." replace={true} />;

  const { subscription, limits } = server.data;

  return (
    <>
      <Container fluid className="py-2">
        <Stack gap={2}>
          <ServerCard server={server.data} list>
            <Stack
              direction="horizontal"
              gap={2}
              className="justify-content-end"
            >
              <Link to="..">
                <Button variant="secondary">Change Server</Button>
              </Link>
              <LeaveServer server={server.data} />
            </Stack>
          </ServerCard>

          <Card>
            <Card.Header>Subscription</Card.Header>
            <Card.Body>
              <Stack gap={2}>
                {subscription?.stripe && subscription.stripe?.price && (
                  <div className="d-flex justify-content-center justify-content-md-start">
                    <SubscriptionPriceCard price={subscription.stripe?.price} />
                  </div>
                )}

                <Stack direction="horizontal" gap={1}>
                  <span>Status: </span>
                  <span className="text-primary">
                    {subscription
                      ? subscription.expires === "never"
                        ? `Never expires`
                        : `
                        ${
                          new Date(subscription.expires).getTime() >
                          new Date().getTime()
                            ? `Active until `
                            : `Expired at `
                        }
                         ${new Date(subscription.expires).toLocaleString()}`
                      : "Free user "}
                  </span>
                  {subscription?.stripe && (
                    <span>(Auto-managed by Stripe)</span>
                  )}
                </Stack>

                {subscription?.owner && (
                  <Stack direction="horizontal" gap={1}>
                    <span>Owner: </span>
                    <span className="text-primary">{subscription.owner}</span>
                  </Stack>
                )}

                <Stack direction="horizontal" gap={2}>
                  <div>Track Limits:</div>
                  <div className="text-primary">
                    {subscription?.limits ? "Custom" : "Default"}
                  </div>
                </Stack>

                <ul>
                  <li>Players: {limits.players}</li>
                  <li>Guilds: {limits.guilds}</li>
                  <li>Alliances: {limits.alliances}</li>
                </ul>
              </Stack>
            </Card.Body>
            <Card.Footer>
              <Stack
                direction="horizontal"
                gap={2}
                className="justify-content-end"
              >
                {subscription ? (
                  <>
                    <SubscriptionEdit subscription={subscription} />
                    <SubscriptionDelete subscription={subscription} />
                  </>
                ) : (
                  <SubscriptionAdd serverId={serverId} />
                )}
              </Stack>
            </Card.Footer>
          </Card>
        </Stack>
      </Container>
    </>
  );
};

export default AdminServer;
