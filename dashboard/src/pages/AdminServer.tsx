import LeaveServer from "components/LeaveServer";
import Loader from "components/Loader";
import ServerCard from "components/ServerCard";
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
    <Container fluid className="py-2">
      <Stack gap={2}>
        <ServerCard server={server.data} list>
          <Stack direction="horizontal" gap={2} className="justify-content-end">
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
                  {subscription.expires === "never"
                    ? `Never expires`
                    : `Active until ${new Date(
                        subscription.expires
                      ).toLocaleString()}`}
                </span>
                {subscription?.stripe && <span>(Auto-managed by Stripe)</span>}
              </Stack>

              <hr />
              <div>
                <div>Track Limits:</div>
                <ul>
                  <li>Players: {limits.players}</li>
                  <li>Guilds: {limits.guilds}</li>
                  <li>Alliances: {limits.alliances}</li>
                </ul>
              </div>
            </Stack>
          </Card.Body>
          <Card.Footer>
            <Stack
              direction="horizontal"
              gap={2}
              className="justify-content-end"
            >
              <Button variant="primary">Edit Expiration</Button>
              <Button variant="primary">Edit Limits</Button>
              <Button variant="danger">Cancel</Button>
            </Stack>
          </Card.Footer>
        </Card>
      </Stack>
    </Container>
  );
};

export default AdminServer;
