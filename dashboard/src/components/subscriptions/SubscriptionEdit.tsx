import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useUpdateAdminSubscriptionMutation } from "store/api/admin";
import { ISubscription } from "types/subscription";
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
        <FontAwesomeIcon icon={faPen} />
        <div>Edit</div>
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
