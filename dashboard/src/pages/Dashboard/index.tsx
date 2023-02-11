import Loader from "components/Loader";
import ServerCard from "components/ServerCard";
import { getServerInviteUrl } from "helpers/discord";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useFetchServersQuery } from "store/api";
import { ServerPartial } from "types";
import DashboardStyles from "./styles";

const Dashboard = () => {
  const servers = useFetchServersQuery();
  const navigate = useNavigate();

  if (servers.isFetching) {
    return (
      <Loader width={500} height={500}>
        <rect x="160" y="15" rx="0" ry="0" width="210" height="20" />
        <rect x="15" y="55" rx="0" ry="0" width="160" height="120" />
        <rect x="185" y="55" rx="0" ry="0" width="160" height="120" />
        <rect x="355" y="55" rx="0" ry="0" width="160" height="120" />
        <rect x="15" y="185" rx="0" ry="0" width="160" height="120" />
      </Loader>
    );
  }

  let invitePopup: Window;
  const inviteToServer = (server: ServerPartial) => {
    if (!invitePopup || invitePopup.closed) {
      invitePopup = window.open(
        getServerInviteUrl(server),
        "_blank",
        "popup"
      ) as Window;

      const invitePopupTick = setInterval(function () {
        if (invitePopup.closed) {
          clearInterval(invitePopupTick);
          return navigate(server.id);
        }
      }, 1000);
    } else {
      invitePopup.focus();
    }
  };

  const renderServer = (server: ServerPartial) => {
    return (
      <Col sm={6} lg={4} key={server.id}>
        <ServerCard server={server}>
          <div className="server-buttons">
            {!server.bot ? (
              <Link to={server.id}>
                <Button variant="primary">Dashboard</Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                onClick={() => inviteToServer(server)}
              >
                Invite
              </Button>
            )}
          </div>
        </ServerCard>
      </Col>
    );
  };

  return (
    <DashboardStyles>
      <Alert variant="info" className="m-0 mb-2">
        <b>Can't find your server?</b> Please check if you are a server owner or
        have the Administrator permissions.
      </Alert>
      <div className="dashboard-title">
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
    </DashboardStyles>
  );
};

export default Dashboard;
