import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "components/Loader";
import SubscriptionList from "components/SubscriptionList";
import { useState } from "react";
import { Button, Card, Col, Dropdown, Form, Row, Stack } from "react-bootstrap";
import {
  useFetchConstantsQuery,
  useLazyFetchAdminSubscriptionsQuery,
} from "store/api";

const AdminSubscriptionsPage = () => {
  const constants = useFetchConstantsQuery();
  const [search, { isFetching, data }] = useLazyFetchAdminSubscriptionsQuery();

  const [server, setServer] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("All");
  const [stripe, setStripe] = useState("");

  if (constants.isFetching || !constants.data) return <Loader />;
  const { subscriptionStatuses } = constants.data;

  return (
    <Stack gap={3}>
      <Form
        onSubmit={(e) => {
          e?.preventDefault();

          const query: any = {};
          if (server) query.server = server;
          if (owner) query.owner = owner;
          if (status !== "All") query.status = status;
          if (stripe) query.stripe = stripe;

          search(query);
        }}
      >
        <Card>
          <Card.Body className="p-3">
            <Stack gap={2}>
              <Row className="gy-2">
                <Form.Group controlId="server" as={Col} xs={12} lg={6}>
                  <Form.Label>Server</Form.Label>
                  <Form.Control
                    type="text"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="owner" as={Col} xs={12} lg={6}>
                  <Form.Label>Owner</Form.Label>
                  <Form.Control
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="stripe" as={Col} xs={12} lg={6}>
                  <Form.Label>Stripe</Form.Label>
                  <Form.Control
                    type="text"
                    value={stripe}
                    onChange={(e) => setStripe(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="status" as={Col} xs={2}>
                  <Form.Label>Status</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle variant="secondary" className="w-100">
                      {status}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setStatus("All")}>
                        All
                      </Dropdown.Item>
                      {subscriptionStatuses.map((status) => (
                        <Dropdown.Item
                          key={status}
                          onClick={() => setStatus(status)}
                        >
                          {status}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Row>
            </Stack>
          </Card.Body>
          <Card.Footer>
            <Stack
              direction="horizontal"
              className="justify-content-end"
              gap={2}
            >
              <Button variant="primary" type="submit">
                <FontAwesomeIcon icon={faSearch} />
                <div>Search</div>
              </Button>
            </Stack>
          </Card.Footer>
        </Card>
      </Form>

      {isFetching ? (
        <Loader width={500} height={500}>
          <rect x="160" y="10" rx="0" ry="0" width="210" height="15" />
          <rect x="15" y="45" rx="5" ry="5" width="475" height="40" />
          <rect x="15" y="95" rx="5" ry="5" width="475" height="40" />
          <rect x="15" y="145" rx="5" ry="5" width="475" height="40" />
          <rect x="15" y="195" rx="5" ry="5" width="475" height="40" />
          <rect x="15" y="245" rx="5" ry="5" width="475" height="40" />
          <rect x="15" y="295" rx="5" ry="5" width="475" height="40" />
          <rect x="15" y="345" rx="5" ry="5" width="475" height="40" />
          <rect x="15" y="395" rx="5" ry="5" width="475" height="40" />
          <rect x="15" y="445" rx="5" ry="5" width="475" height="40" />
        </Loader>
      ) : (
        <SubscriptionList subscriptions={data} />
      )}
    </Stack>
  );
};

export default AdminSubscriptionsPage;
