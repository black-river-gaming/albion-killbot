import Loader from "components/Loader";
import ServerCard from "components/ServerCard";
import Toast from "components/Toast";
import { useState } from "react";
import { Alert, Button, Col, Modal, Row } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import {
  useAssignSubscriptionMutation,
  useFetchUserServersQuery,
} from "store/api";

interface SubscriptionAssignModalProps {
  checkoutId?: string;
  currentServerId?: string;
  subscriptionId?: string;
  onClose?: () => void;
}

const SubscriptionAssignModal = ({
  checkoutId,
  currentServerId,
  subscriptionId,
  onClose,
}: SubscriptionAssignModalProps) => {
  const [show, setShow] = useState(true);
  const servers = useFetchUserServersQuery();
  const [dispatchAssignSubscription, assignSubscription] =
    useAssignSubscriptionMutation();

  if (assignSubscription.isSuccess && assignSubscription.data) {
    console.log(assignSubscription.data);
    return (
      <Navigate
        to={`/dashboard/${assignSubscription.data.server}/subscription`}
      />
    );
  }

  const availableServers = servers.data?.filter(
    (server) => server.bot && server.id !== currentServerId
  );

  return (
    <Modal
      show={show}
      centered={true}
      size="lg"
      onExit={() => {
        if (onClose) onClose();
      }}
    >
      <Modal.Header>
        <Modal.Title>
          {checkoutId
            ? "Premium subscription successfully purchased. Thank you!"
            : "Assign Premium subcription"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info" className="m-0">
          <b>Can't find your server?</b> You can invite the bot in the{" "}
          <Link to="/dashboard">Dashboard</Link> before assigning the
          subscription.
        </Alert>
        <div className="py-3">
          Please, select a server to associate your subscription. You can
          transfer it to another server later:
        </div>
        <Row className="g-4">
          {servers.isFetching && <Loader />}
          {availableServers?.length === 0 && (
            <h5 className="d-flex justify-content-center py-5">
              No servers available.
            </h5>
          )}
          {availableServers &&
            availableServers.map((server) => (
              <Col key={server.id} sm={6} lg={4}>
                <ServerCard server={server}>
                  <div className="d-flex justify-content-end">
                    <Button
                      variant="primary"
                      onClick={() =>
                        dispatchAssignSubscription({
                          server: server.id,
                          checkoutId,
                          subscriptionId,
                        })
                      }
                      disabled={assignSubscription.isLoading}
                    >
                      Select
                    </Button>
                  </div>
                </ServerCard>
              </Col>
            ))}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-end">
          <Button variant="secondary" onClick={() => setShow(false)}>
            Later
          </Button>
        </div>
      </Modal.Footer>
      <Toast
        bg="danger"
        show={assignSubscription.isError}
        onClose={() => assignSubscription.reset()}
        delay={3000}
        autohide
      >
        Failed to assign subscription. Please try again later.
      </Toast>
    </Modal>
  );
};

export default SubscriptionAssignModal;
