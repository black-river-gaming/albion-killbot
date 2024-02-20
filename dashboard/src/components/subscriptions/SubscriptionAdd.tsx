import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useCreateAdminSubscriptionMutation } from "store/api/admin";
import { ISubscription } from "types/subscription";
import SubscriptionForm from "./SubscriptionForm";

const SubscriptionAdd = () => {
  const [show, setShow] = useState(false);

  const [dispatchCreateSubscription, createSubscription] =
    useCreateAdminSubscriptionMutation();

  useEffect(() => {
    if (createSubscription.isSuccess) setShow(false);
  }, [createSubscription.isSuccess]);

  const handleSubscriptionForm = async (subscription: ISubscription) => {
    dispatchCreateSubscription({
      subscription,
    });
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setShow(true)}>
        <FontAwesomeIcon icon={faPlus} />
        <div>Add</div>
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <SubscriptionForm
          title="Create Subscription"
          onSubmit={handleSubscriptionForm}
          onClose={() => setShow(false)}
        />
      </Modal>
    </>
  );
};

export default SubscriptionAdd;
