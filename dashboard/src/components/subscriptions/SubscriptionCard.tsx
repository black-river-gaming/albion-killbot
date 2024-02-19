import { getServerPictureUrl } from "helpers/discord";
import { getSubscriptionStatus } from "helpers/subscriptions";
import { Card, Stack } from "react-bootstrap";
import { ISubscriptionExtended } from "types/subscription";
import SubscriptionAssign from "./SubscriptionAssign";
import SubscriptionStatusBadge from "./SubscriptionStatusBadge";

interface Props {
  subscription: ISubscriptionExtended;
}

const SubscriptionCard = ({ subscription }: Props) => {
  const { server } = subscription;

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
            <SubscriptionStatusBadge
              status={getSubscriptionStatus(subscription)}
            />
          </div>

          {subscription.expires !== "never" && (
            <>
              <div className="text-muted">Period End:</div>
              <div>
                {new Date(subscription.expires).toLocaleDateString(undefined, {
                  day: "2-digit",
                  weekday: "long",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </>
          )}

          {server && (
            <>
              <div className="text-muted">Server:</div>
              <Stack
                className="d-flex align-items-center"
                direction="horizontal"
                gap={2}
              >
                <img
                  src={getServerPictureUrl(server, true)}
                  style={{ width: 30, height: 30 }}
                  alt={server.name}
                />
                <div>{server.name}</div>
              </Stack>
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
          <SubscriptionAssign
            currentServerId={server?.id}
            subscription={subscription}
          />
        </Stack>
      </Card.Footer>
    </Card>
  );
};

export default SubscriptionCard;
