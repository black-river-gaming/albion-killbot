import { useEffect, useState } from "react";
import { Button, Form, Modal, Stack } from "react-bootstrap";
import { useUpdateSubscriptionMutation } from "store/api";
import { Subscription } from "types";

interface ManageSubscriptionProps {
  subscription: Subscription;
}

const SubscriptionEdit = ({ subscription }: ManageSubscriptionProps) => {
  const [showManage, setShowManage] = useState(false);

  const [owner, setOwner] = useState(subscription.owner);
  const [expires, setExpires] = useState(
    new Date(subscription.expires)
      .toLocaleString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(" ", "T")
  );
  const [expiresNever, setExpiresNever] = useState(
    subscription.expires === "never"
  );
  const [limits, setLimits] = useState(!!subscription.limits);
  const [players, setPlayers] = useState(subscription.limits?.players || 0);
  const [guilds, setGuilds] = useState(subscription.limits?.guilds || 0);
  const [alliances, setAlliances] = useState(
    subscription.limits?.alliances || 0
  );
  const [dispatchUpdateSubscription, updateSubscription] =
    useUpdateSubscriptionMutation();

  useEffect(() => {
    if (updateSubscription.isSuccess) setShowManage(false);
  }, [updateSubscription.isSuccess]);

  if (!subscription.server) return null;

  const handleSubscriptionForm = async () => {
    if (!subscription.server) return;
    if (typeof subscription.server !== "string") return;

    dispatchUpdateSubscription({
      serverId: subscription.server,
      subscription: {
        id: subscription.id,
        owner,
        expires: expiresNever ? "never" : new Date(expires).toISOString(),
        limits: limits
          ? {
              players,
              guilds,
              alliances,
            }
          : undefined,
      },
    });
  };

  return (
    <>
      <Button variant="primary" onClick={() => setShowManage(true)}>
        Edit
      </Button>

      <Modal show={showManage} onHide={() => setShowManage(false)}>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubscriptionForm();
          }}
        >
          <Modal.Header>
            <Modal.Title>Manage Subscription</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Stack gap={2}>
              <Form.Group controlId="owner">
                <Form.Label>Owner</Form.Label>
                <Form.Control
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="expires">
                <Form.Label>Expires</Form.Label>
                <Form.Control
                  disabled={expiresNever}
                  type="datetime-local"
                  value={expires}
                  onChange={(e) => setExpires(e.target.value)}
                />
                <Form.Check
                  type="switch"
                  label="Never"
                  checked={expiresNever}
                  onChange={(e) => setExpiresNever(e.target.checked)}
                />
              </Form.Group>

              <hr />

              <Form.Group controlId="limits-enabled">
                <Form.Check
                  type="switch"
                  label="Custom Limits"
                  checked={limits}
                  onChange={(e) => setLimits(e.target.checked)}
                />
              </Form.Group>

              {limits && (
                <>
                  <Form.Group controlId="players">
                    <Form.Label>Players</Form.Label>
                    <Form.Control
                      disabled={!limits}
                      type="number"
                      value={players}
                      onChange={(e) => setPlayers(Number(e.target.value))}
                    />
                  </Form.Group>
                  <Form.Group controlId="guilds">
                    <Form.Label>Guilds</Form.Label>
                    <Form.Control
                      disabled={!limits}
                      type="number"
                      value={guilds}
                      onChange={(e) => setGuilds(Number(e.target.value))}
                    />
                  </Form.Group>
                  <Form.Group controlId="alliances">
                    <Form.Label>Alliances</Form.Label>
                    <Form.Control
                      disabled={!limits}
                      type="number"
                      value={alliances}
                      onChange={(e) => setAlliances(Number(e.target.value))}
                    />
                  </Form.Group>
                </>
              )}
            </Stack>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowManage(false)}>
              Close
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default SubscriptionEdit;
