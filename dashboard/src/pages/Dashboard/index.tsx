import { Button, Card, Col, Container, Row } from "react-bootstrap";
import Loader from "shared/components/Loader";
import { getServerInviteUrl, getServerPictureUrl } from "shared/discord";
import { Server, useFetchUserServersQuery } from "store/api";
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
  const inviteToServer = (server: Server) => {
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

  const renderUserServer = (server: Server) => {
    const serverImg = getServerPictureUrl(server);

    return (
      <Col sm={6} lg={4} key={server.id}>
        <Card bg="dark" className="server-card">
          <div className="server-img-container">
            <Card.Img className="server-img-blurred" src={serverImg} />
            <Card.Img
              className="server-img-icon"
              variant="top"
              src={serverImg}
            />
          </div>
          <Card.Body>
            <Card.Title>{server.name}</Card.Title>
            {server.owner ? (
              <Card.Text>Owner</Card.Text>
            ) : (
              server.admin && <Card.Text>Admin</Card.Text>
            )}
            <div className="server-buttons">
              {server.bot ? (
                <Button variant="primary">Dashboard</Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => inviteToServer(server)}
                >
                  Invite
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return (
    <DashboardStyles>
      <div className="dashboard-title">
        <h2>Select your server</h2>
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
