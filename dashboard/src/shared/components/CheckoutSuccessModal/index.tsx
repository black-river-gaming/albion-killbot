import { useState } from "react";
import { Alert, Button, Col, Modal, Row } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import Loader from "shared/components/Loader";
import ServerCard from "shared/components/ServerCard";
import Toast from "shared/components/Toast";
import {
  useAssignSubscriptionMutation,
  useFetchUserServersQuery,
} from "store/api";

interface CheckoutSuccessModalProps {
  checkoutId: string;
}

const CheckoutSuccessModal = ({ checkoutId }: CheckoutSuccessModalProps) => {
  const [show, setShow] = useState(true);
  const servers = useFetchUserServersQuery();
  const [dispatchAssignSubscription, assignSubscription] =
    useAssignSubscriptionMutation();

  if (assignSubscription.isSuccess && assignSubscription.data) {
    return (
      <Navigate
        to={`/dashboard/${assignSubscription.data.server}/subscription`}
      />
    );
  }

  return (
    <Modal show={show} centered={true} size="lg">
      <Modal.Header>
        <Modal.Title>
          Premium subscription successfully purchased. Thank you!
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
          {servers.data
            ?.filter((server) => server.bot)
            .map((server) => (
              <Col key={server.id} sm={6} lg={4}>
                <ServerCard server={server}>
                  <div className="d-flex justify-content-end">
                    <Button
                      variant="primary"
                      onClick={() =>
                        dispatchAssignSubscription({
                          server: server.id,
                          checkoutId,
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

export default CheckoutSuccessModal;
