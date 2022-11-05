import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDeleteSubscriptionMutation } from "store/api";
import { Subscription } from "types";

interface ManageSubscriptionProps {
  subscription: Subscription;
}

const ManageSubscription = ({ subscription }: ManageSubscriptionProps) => {
  const [showDelete, setShowDelete] = useState(false);

  const [dispatchDeleteSubscription, deleteSubscription] =
    useDeleteSubscriptionMutation();

  useEffect(() => {
    if (deleteSubscription.isSuccess) setShowDelete(false);
  }, [deleteSubscription.isSuccess]);

  const serverId = subscription.server as string;
  if (!serverId) return null;

  return (
    <>
      <Button variant="danger" onClick={() => setShowDelete(true)}>
        Delete
      </Button>

      <Modal show={showDelete} onHide={() => setShowDelete(false)}>
        <Modal.Header>
          <Modal.Title>Delete Subscription</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete this subscription?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>
            Close
          </Button>
          <Button
            type="submit"
            variant="danger"
            onClick={() => dispatchDeleteSubscription({ serverId })}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ManageSubscription;
