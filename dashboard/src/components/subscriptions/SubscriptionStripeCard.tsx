import { faStripe } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "components/Loader";
import { getCurrency } from "helpers/utils";
import { Button, Card, Stack } from "react-bootstrap";
import { useDoSubscriptionManageMutation } from "store/api/subscriptions";
import { ISubscriptionExtended } from "types/subscription";
import SubscriptionStatusBadge from "./SubscriptionStatusBadge";

interface Props {
  subscription: ISubscriptionExtended;
}

const SubscriptionStripeCard = ({ subscription }: Props) => {
  const [dispatchManageSubscription, manageSubscription] =
    useDoSubscriptionManageMutation();

  if (manageSubscription.isLoading) return <Loader />;
  if (manageSubscription.isSuccess && manageSubscription.data) {
    window.location.href = manageSubscription.data.url;
  }

  if (!subscription.stripe) return <div>Invalid subscription data</div>;

  const { stripe } = subscription;
  const { price } = stripe;

  return (
    <Card>
      <Card.Header>
        <Stack direction="horizontal" gap={2}>
          <div>#{subscription.id}</div>
          {stripe.status && <SubscriptionStatusBadge status={stripe.status} />}
        </Stack>
      </Card.Header>
      <Card.Body>
        {price && (
          <div className="price">
            {getCurrency(price.price / 100, {
              currency: price.currency,
            })}
            /{price.recurrence.count} {price.recurrence.interval}
          </div>
        )}

        {stripe.customer && (
          <Button
            variant="danger"
            onClick={() =>
              dispatchManageSubscription({
                subscriptionId: subscription.id,
                customerId: stripe.customer,
              })
            }
          >
            <FontAwesomeIcon icon={faStripe} className="s-2" />
            <div>Manage</div>
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default SubscriptionStripeCard;
