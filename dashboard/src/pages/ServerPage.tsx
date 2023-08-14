import { faCrown, faGear, faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "components/Loader";
import ServerCard from "components/ServerCard";
import { isSubscriptionActive } from "helpers/subscriptions";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  ListGroup,
  Row,
  Stack,
} from "react-bootstrap";
import { Link, NavLink, Navigate, Outlet, useParams } from "react-router-dom";
import { useFetchServerQuery, useFetchUserQuery } from "store/api";

const ServerPage = () => {
  const { data: user } = useFetchUserQuery();
  const { serverId = "" } = useParams();
  const server = useFetchServerQuery(serverId);

  const redirectToDashboard = <Navigate to="/dashboard" replace={true} />;

  if (server.isFetching) return <Loader />;
  if (!server.data) return redirectToDashboard;

  const { subscription } = server.data;

  return (
    <Container fluid className="py-3">
      <Row className="g-3">
        <Col md={4}>
          <ServerCard server={server.data}>
            <Stack
              gap={2}
              direction="horizontal"
              className="justify-content-end"
            >
              {user?.admin && (
                <Link to={`/admin/servers/${server.data.id}`}>
                  <Button variant="primary">Admin</Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="secondary">Change Server</Button>
              </Link>
            </Stack>
          </ServerCard>
          <Card className="mt-3">
            <ListGroup>
              <NavLink
                to="settings"
                className="list-group-item list-group-item-action"
              >
                <Stack direction="horizontal" gap={2}>
                  <FontAwesomeIcon icon={faGear} size="sm" />
                  <div>Settings</div>
                </Stack>
              </NavLink>
              <NavLink
                to="track"
                className="list-group-item list-group-item-action"
              >
                <Stack direction="horizontal" gap={2}>
                  <FontAwesomeIcon icon={faList} size="sm" />
                  <div>Tracking List</div>
                </Stack>
              </NavLink>
              <NavLink
                to="subscription"
                className="list-group-item list-group-item-action"
              >
                <Stack direction="horizontal" gap={2}>
                  <FontAwesomeIcon icon={faCrown} size="sm" />
                  <div>Subscription</div>
                </Stack>
              </NavLink>
            </ListGroup>
          </Card>
        </Col>
        <Col md={8}>
          {subscription && !isSubscriptionActive(subscription) && (
            <Alert variant="warning">
              You server subscription has expired, please visit the{" "}
              <Link to="/premium">Premium page</Link> to verify and renew your
              subscription.
            </Alert>
          )}
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default ServerPage;
