import {
  faCrown,
  faGear,
  faList,
  faPeopleGroup,
  faSkull,
  faSkullCrossbones,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
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
import { useFetchServerQuery } from "store/api";

const ServerPage = () => {
  const { serverId = "" } = useParams();
  const server = useFetchServerQuery(serverId);

  const redirectToDashboard = <Navigate to="/dashboard" replace={true} />;

  if (server.isFetching) return <Loader />;
  if (!server.data) return redirectToDashboard;

  const { subscription } = server.data;

  const menu = [
    {
      path: "track",
      name: "Notification List",
      icon: faList,
    },
    {
      path: "settings",
      name: "Settings",
      icon: faGear,
    },
    {
      path: "kills",
      name: "Kills",
      icon: faSkull,
    },
    {
      path: "deaths",
      name: "Deaths",
      icon: faSkullCrossbones,
    },
    {
      path: "battles",
      name: "Battles",
      icon: faPeopleGroup,
    },
    {
      path: "rankings",
      name: "Rankings",
      icon: faTrophy,
    },
    {
      path: "subscription",
      name: "Subscription",
      icon: faCrown,
    },
  ];

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
              <Link to="/dashboard">
                <Button variant="secondary">Change Server</Button>
              </Link>
            </Stack>
          </ServerCard>
          <Card className="mt-3">
            <ListGroup>
              {menu.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="list-group-item list-group-item-action"
                >
                  <Stack direction="horizontal" gap={2}>
                    <FontAwesomeIcon
                      icon={item.icon}
                      size="sm"
                      style={{ flexBasis: 20 }}
                    />
                    <div>{item.name}</div>
                  </Stack>
                </NavLink>
              ))}
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
