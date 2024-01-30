import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useUpdateAdminSubscriptionMutation } from "store/api/admin";
import { ISubscription } from "types";
import SubscriptionForm from "./SubscriptionForm";

interface SubscriptionEditProps {
  subscription: ISubscription;
}

const SubscriptionEdit = ({ subscription }: SubscriptionEditProps) => {
  const [show, setShow] = useState(false);

  const [dispatchUpdateSubscription, updateSubscription] =
    useUpdateAdminSubscriptionMutation();

  useEffect(() => {
    if (updateSubscription.isSuccess) setShow(false);
  }, [updateSubscription.isSuccess]);

  const handleSubscriptionForm = async (subscription: ISubscription) => {
    dispatchUpdateSubscription({
      subscription,
    });
  };

  return (
    <>
      <Button variant="primary" onClick={() => setShow(true)}>
        Edit
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <SubscriptionForm
          title="Edit Subscription"
          subscription={subscription}
          onSubmit={handleSubscriptionForm}
          onClose={() => setShow(false)}
        />
      </Modal>
    </>
  );
};

export default SubscriptionEdit;
