import { Button, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import Loader from "shared/components/Loader";
import ServerCard from "shared/components/ServerCard";
import { getServerInviteUrl } from "shared/discord";
import { ServerPartial, useFetchUserServersQuery } from "store/api";
import DashboardStyles from "./styles";

const Dashboard = () => {
  const userServers = useFetchUserServersQuery();

  if (userServers.isFetching) {
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
          userServers.refetch();
        }
      }, 1000);
    } else {
      invitePopup.focus();
    }
  };

  const renderUserServer = (server: ServerPartial) => {
    return (
      <Col sm={6} lg={4} key={server.id}>
        <ServerCard server={server}>
          <div className="server-buttons">
            {server.bot ? (
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
      <div className="dashboard-title">
        <h1>Discord Servers</h1>
      </div>
      <Container fluid className="pt-4">
        <Row className="g-4">
          {userServers.data && userServers.data.map(renderUserServer)}
        </Row>
      </Container>
    </DashboardStyles>
  );
};

export default Dashboard;
