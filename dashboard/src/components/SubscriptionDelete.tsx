import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDeleteAdminSubscriptionMutation } from "store/api/admin";
import { ISubscriptionBase } from "types";

interface SubscriptionDeleteProps {
  subscription: ISubscriptionBase;
}

const SubscriptionDelete = ({ subscription }: SubscriptionDeleteProps) => {
  const [showDelete, setShowDelete] = useState(false);

  const [dispatchDeleteSubscription, deleteSubscription] =
    useDeleteAdminSubscriptionMutation();

  useEffect(() => {
    if (deleteSubscription.isSuccess) setShowDelete(false);
  }, [deleteSubscription.isSuccess]);

  const id = subscription.id;
  if (!id) return null;

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
