import { Alert } from "react-bootstrap";
import { Subscription } from "store/api";

interface ServerSubscriptionProps {
  subscription?: Subscription;
}

const ServerSubscription = ({ subscription }: ServerSubscriptionProps) => {
  if (!subscription) {
    return (
      <Alert variant="dark" className="mx-2">
        This server doesn't have an active subscription.
      </Alert>
    );
  }

  return (
    <Alert variant="dark" className="mx-2">
      Server status: Paid
    </Alert>
  );
};

export default ServerSubscription;
