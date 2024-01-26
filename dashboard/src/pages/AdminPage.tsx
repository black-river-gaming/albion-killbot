import { faCrown, faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Col, Container, Nav, Row, Stack } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";

const AdminPage = () => {
  return (
    <Container fluid className="py-3">
      <Stack gap={3}>
        <Nav variant="pills">
          <Nav.Item>
            <Nav.Link as={NavLink} to="servers">
              <Stack direction="horizontal" gap={2}>
                <FontAwesomeIcon icon={faList} size="sm" />
                <div>Servers</div>
              </Stack>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link as={NavLink} to="subscriptions">
              <Stack direction="horizontal" gap={2}>
                <FontAwesomeIcon icon={faCrown} size="sm" />
                <div>Subscriptions</div>
              </Stack>
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Row>
          <Col md={12}>
            <Outlet />
          </Col>
        </Row>
      </Stack>
    </Container>
  );
};

export default AdminPage;
