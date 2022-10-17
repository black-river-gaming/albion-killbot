import Loader from "components/Loader";
import ServerCard from "components/ServerCard";
import { useState } from "react";
import { Button, Container, Modal, Row, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ServerPartial, useFetchAdminServersQuery } from "store/api";

const Admin = () => {
  const [leaveServer, setLeaveServer] = useState<ServerPartial>();
  const servers = useFetchAdminServersQuery();

  if (servers.isFetching) {
    return (
      <Loader width={500} height={500}>
        <rect x="160" y="15" rx="0" ry="0" width="210" height="20" />
        <rect x="15" y="55" rx="5" ry="5" width="475" height="50" />
        <rect x="15" y="115" rx="5" ry="5" width="475" height="50" />
        <rect x="15" y="175" rx="5" ry="5" width="475" height="50" />
        <rect x="15" y="235" rx="5" ry="5" width="475" height="50" />
        <rect x="15" y="295" rx="5" ry="5" width="475" height="50" />
      </Loader>
    );
  }

  const renderServer = (server: ServerPartial) => {
    return (
      <ServerCard key={server.id} server={server} list>
        <Stack gap={2} direction="horizontal">
          <Link to={`/dashboard/${server.id}`}>
            <Button variant="primary">Dashboard</Button>
          </Link>

          <div>
            <Button variant="danger" onClick={() => setLeaveServer(server)}>
              Leave
            </Button>
          </div>
        </Stack>
      </ServerCard>
    );
  };

  return (
    <>
      <div className="d-flex justify-content-center pt-3">
        <h1>Discord Servers</h1>
      </div>
      <Container fluid className="pt-4">
        <Row className="g-4">
          {servers.data && servers.data.map(renderServer)}
          {servers.data?.length === 0 && (
            <h5 className="d-flex justify-content-center py-5">
              No servers available.
            </h5>
          )}
        </Row>
      </Container>

      <Modal show={!!leaveServer} onHide={() => setLeaveServer(undefined)}>
        <Modal.Header>
          <Modal.Title>Leave Server</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to leave{" "}
          <span className="text-primary">{leaveServer?.name}</span>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setLeaveServer(undefined)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => console.log(`Leave server: ${leaveServer?.id}`)}
          >
            Leave
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Admin;
