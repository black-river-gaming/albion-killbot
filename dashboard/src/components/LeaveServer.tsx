import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDoLeaveServerMutation } from "store/api";
import { ServerBase } from "types";
import Toast from "./Toast";

interface LeaveServerProps {
  server: ServerBase;
  onLeave?: () => void;
}

const LeaveServer = ({ server, onLeave }: LeaveServerProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [dispatchLeaveServer, leaveServer] = useDoLeaveServerMutation();

  useEffect(() => {
    if (onLeave && leaveServer.isSuccess) {
      onLeave();
    }
  }, [leaveServer.isSuccess, onLeave]);

  return (
    <>
      <Button variant="danger" onClick={() => setShowConfirm(true)}>
        Leave
      </Button>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header>
          <Modal.Title>Leave Server</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to leave{" "}
          <span className="text-primary">{server.name}</span>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              dispatchLeaveServer({ serverId: server.id });
              setShowConfirm(false);
            }}
          >
            Leave
          </Button>
        </Modal.Footer>
      </Modal>

      <Toast
        bg="success"
        show={leaveServer.isSuccess}
        onClose={() => leaveServer.reset()}
      >
        Left server.
      </Toast>
      <Toast
        bg="danger"
        show={leaveServer.isError}
        onClose={() => leaveServer.reset()}
      >
        Failed to leave server. Please try again later.
      </Toast>
    </>
  );
};

export default LeaveServer;
