import Loader from "components/Loader";
import ServerCard from "components/ServerCard";
import { Container, Row } from "react-bootstrap";
import { ServerPartial, useFetchAdminServersQuery } from "store/api";

const Admin = () => {
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
        Dashboard | Sair
      </ServerCard>
    );
  };

  return (
    <div>
      <div className="d-flex justify-content-center my-2">
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
    </div>
  );
};

export default Admin;
