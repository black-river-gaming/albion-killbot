import ServerSelect from "components/ServerSelect";
import { useState } from "react";
import { Alert, Button, Modal } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import { useDoSubscriptionAssignMutation } from "store/api/subscriptions";

interface Props {
  currentServerId?: string;
  subscriptionId?: string;
  onClose?: () => void;
}

const SubscriptionAssign = ({
  currentServerId,
  subscriptionId,
  onClose,
}: Props) => {
  const [show, setShow] = useState(false);
  const [dispatchAssignSubscription, assignSubscription] =
    useDoSubscriptionAssignMutation();

  if (assignSubscription.isSuccess && assignSubscription.data) {
    return (
      <Navigate
        to={`/dashboard/${assignSubscription.data.server}/subscription`}
      />
    );
  }

  return (
    <div>
      <Button variant="primary" onClick={() => setShow(true)}>
        {currentServerId ? "Transfer" : "Assign"}
      </Button>

      <Modal
        show={show}
        centered={true}
        size="lg"
        onExit={() => {
          if (onClose) onClose();
        }}
      >
        <Modal.Header>
          <Modal.Title>Assign Premium subcription</Modal.Title>
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

          <ServerSelect
            onSelect={(serverId) => {
              dispatchAssignSubscription({
                server: serverId,
                subscriptionId: subscriptionId,
              });
            }}
            hiddenServerIds={currentServerId ? [currentServerId] : []}
          />
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={() => setShow(false)}>
              Later
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SubscriptionAssign;
