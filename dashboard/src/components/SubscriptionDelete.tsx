import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDeleteAdminSubscriptionMutation } from "store/api/admin";
import { ISubscriptionBase } from "types";

interface SubscriptionDeleteProps {
  subscription: ISubscriptionBase;
  onDelete?: () => void;
}

const SubscriptionDelete = ({
  subscription,
  onDelete,
}: SubscriptionDeleteProps) => {
  const [showDelete, setShowDelete] = useState(false);

  const [dispatchDeleteSubscription, deleteSubscription] =
    useDeleteAdminSubscriptionMutation();

  useEffect(() => {
    if (deleteSubscription.isSuccess) {
      setShowDelete(false);
      if (onDelete) onDelete();
    }
  }, [deleteSubscription.isSuccess, onDelete]);

  const id = subscription.id;
  if (!id) return null;

  return (
    <>
      <Button variant="danger" onClick={() => setShowDelete(true)}>
        <FontAwesomeIcon icon={faTrash} />
        <div>Delete</div>
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
            onClick={() => dispatchDeleteSubscription({ id })}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SubscriptionDelete;
