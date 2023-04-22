import { faCrown, faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, Col, Container, ListGroup, Row, Stack } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";

const AdminPage = () => {
  return (
    <Container fluid className="py-3">
      <Row className="g-3">
        <Col md={4}>
          <Card>
            <ListGroup>
              <NavLink
                to="servers"
                className="list-group-item list-group-item-action"
              >
                <Stack direction="horizontal" gap={2}>
                  <FontAwesomeIcon icon={faList} size="sm" />
                  <div>Servers</div>
                </Stack>
              </NavLink>
              <NavLink
                to="subscriptions"
                className="list-group-item list-group-item-action"
              >
                <Stack direction="horizontal" gap={2}>
                  <FontAwesomeIcon icon={faCrown} size="sm" />
                  <div>Subscriptions</div>
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

export default AdminPage;
