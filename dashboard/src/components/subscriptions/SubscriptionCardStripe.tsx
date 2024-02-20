import { faStripe } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "components/Loader";
import { getServerPictureUrl, getUserPictureUrl } from "helpers/discord";
import { getCurrency } from "helpers/utils";
import { Button, Card, Image, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useFetchUserQuery } from "store/api";
import { useDoSubscriptionManageMutation } from "store/api/subscriptions";
import { ISubscriptionExtended } from "types/subscription";
import SubscriptionAdmin from "./SubscriptionAdmin";
import SubscriptionAssign from "./SubscriptionAssign";
import SubscriptionStatusBadge from "./SubscriptionStatusBadge";

interface Props {
  subscription: ISubscriptionExtended;
}

const SubscriptionCardStripe = ({ subscription }: Props) => {
  const user = useFetchUserQuery();
  const [dispatchManageSubscription, manageSubscription] =
    useDoSubscriptionManageMutation();

  if (manageSubscription.isLoading) {
    return (
      <Loader width={500} height={115}>
        <rect cx="0" cy="0" width="500" height="115" rx={3} ry={3} />
      </Loader>
    );
  }
  if (manageSubscription.isSuccess && manageSubscription.data) {
    window.location.href = manageSubscription.data.url;
  }

  if (!subscription.stripe) return <div>Invalid subscription data</div>;

  const { owner, server, stripe } = subscription;
  const { price } = stripe;

  return (
    <Card>
      <Card.Header>
        <h6 className="m-0">
          <Stack direction="horizontal" gap={2}>
            <div>#{subscription.id}</div>
          </Stack>
        </h6>
      </Card.Header>

      <Card.Body>
        <div
          style={{
            display: "grid",
            columnGap: "2rem",
            rowGap: "0.25rem",
            gridTemplateColumns: "minmax(100px, max-content) auto",
            gridAutoRows: "1.75rem",
          }}
        >
          <div className="text-muted">Status:</div>
          <div>
            <SubscriptionStatusBadge status={stripe.status} />
          </div>

          <div className="text-muted">Period End:</div>
          <div>
            {new Date(stripe.current_period_end * 1000).toLocaleDateString(
              undefined,
              {
                day: "2-digit",
                weekday: "long",
                month: "short",
                year: "numeric",
              }
            )}
          </div>

          <div className="text-muted">Amount:</div>
          <Stack direction="horizontal" gap={1}>
            <div>
              {getCurrency(price.price / 100, {
                currency: price.currency,
              })}
            </div>
            <div>/</div>
            <div>
              {price.recurrence.count} {price.recurrence.interval}
            </div>
          </Stack>

          {owner && (
            <>
              <div className="text-muted">Owner:</div>
              <Stack
                className="d-flex align-items-center"
                direction="horizontal"
                gap={2}
              >
                <Image
                  roundedCircle
                  src={getUserPictureUrl(owner)}
                  style={{ width: 30, height: 30 }}
                  alt={owner.username}
                />
                <div>{owner.username || owner.id}</div>
              </Stack>
            </>
          )}

          {server && (
            <>
              <div className="text-muted">Server:</div>
              <Link to={`/dashboard/${server.id}/subscription`}>
                <Stack
                  className="d-flex align-items-center"
                  direction="horizontal"
                  gap={2}
                >
                  <Image
                    roundedCircle
                    src={getServerPictureUrl(server, true)}
                    style={{ width: 30, height: 30 }}
                    alt={server.name}
                  />
                  <div>{server.name}</div>
                </Stack>
              </Link>
            </>
          )}
        </div>
      </Card.Body>

      <Card.Footer>
        <Stack
          aria-label="subscription-actions"
          direction="horizontal"
          gap={2}
          className="justify-content-end"
        >
          <SubscriptionAdmin subscription={subscription} />

          <Button
            disabled={subscription.owner?.id !== user.data?.id}
            variant="danger"
            onClick={() =>
              dispatchManageSubscription({
                subscriptionId: subscription.id,
                customerId: stripe.customer,
                serverId: subscription.server?.id,
              })
            }
          >
            <FontAwesomeIcon icon={faStripe} className="s-2" />
            <div>Manage</div>
          </Button>

          <SubscriptionAssign
            currentServerId={server?.id}
            subscription={subscription}
          />
        </Stack>
      </Card.Footer>
    </Card>
  );
};

export default SubscriptionCardStripe;
