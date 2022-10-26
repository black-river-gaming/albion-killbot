import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LeaveServer from "components/LeaveServer";
import Loader from "components/Loader";
import ServerCard from "components/ServerCard";
import {
  Button,
  Card,
  Col,
  Container,
  ListGroup,
  Row,
  Stack,
} from "react-bootstrap";
import { Link, Navigate, NavLink, Outlet, useParams } from "react-router-dom";
import { useFetchServerQuery } from "store/api";

const AdminServer = () => {
  const { serverId = "" } = useParams();
  const server = useFetchServerQuery(serverId);

  if (server.isFetching) return <Loader />;
  if (!server.data) return <Navigate to=".." replace={true} />;

  return (
    <Container fluid className="py-3">
      <Row className="g-3">
        <Col md={4}>
          <ServerCard server={server.data}>
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
          <Card className="mt-3">
            <ListGroup>
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
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminServer;
