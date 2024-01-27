import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button, Form, Modal, Stack } from "react-bootstrap";
import { useCreateAdminSubscriptionMutation } from "store/api/admin";

interface Props {
  serverId?: string;
}

const SubscriptionAdd = ({ serverId }: Props) => {
  const [show, setShow] = useState(false);

  const [owner, setOwner] = useState("");
  const [server, setServer] = useState(serverId || "");
  const [expires, setExpires] = useState(
    new Date()
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
  const [expiresNever, setExpiresNever] = useState(false);
  const [limits, setLimits] = useState(false);
  const [players, setPlayers] = useState(0);
  const [guilds, setGuilds] = useState(0);
  const [alliances, setAlliances] = useState(0);
  const [dispatchCreateSubscription, createSubscription] =
    useCreateAdminSubscriptionMutation();

  useEffect(() => {
    if (createSubscription.isSuccess) setShow(false);
  }, [createSubscription.isSuccess]);

  const handleSubscriptionForm = async () => {
    dispatchCreateSubscription({
      subscription: {
        owner,
        server,
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
      <Button variant="secondary" onClick={() => setShow(true)}>
        <FontAwesomeIcon icon={faPlus} />
        <div>Add</div>
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubscriptionForm();
          }}
        >
          <Modal.Header>
            <Modal.Title>Add Subscription</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Stack gap={2}>
              <Form.Group controlId="owner">
                <Form.Label>Owner</Form.Label>
                <Form.Control
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please input an owner.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="server">
                <Form.Label>Server</Form.Label>
                <Form.Control
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  Please input an owner.
                </Form.Control.Feedback>
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
            <Button variant="secondary" onClick={() => setShow(false)}>
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

export default SubscriptionAdd;
