import Loader from "components/Loader";
import ServerCard from "components/ServerCard";
import { Button, Col, Row } from "react-bootstrap";
import { useFetchServersQuery } from "store/api";

interface Props {
  hiddenServerIds?: string[];
  onSelect: (serverId: string) => void;
}

const ServerSelect = ({ hiddenServerIds = [], onSelect }: Props) => {
  const servers = useFetchServersQuery();

  const availableServers = servers.data?.filter(
    (server) => server.bot && hiddenServerIds.indexOf(server.id) === -1
  );

  return (
    <Row className="g-4">
      {servers.isFetching && <Loader />}
      {availableServers?.length === 0 && (
        <h5 className="d-flex justify-content-center py-5">
          No servers available.
        </h5>
      )}
      {availableServers &&
        availableServers.map((server) => (
          <Col key={server.id} sm={6} lg={4}>
            <ServerCard server={server}>
              <div className="d-flex justify-content-end">
                <Button variant="primary" onClick={() => onSelect(server.id)}>
                  Select
                </Button>
              </div>
            </ServerCard>
          </Col>
        ))}
    </Row>
  );
};

export default ServerSelect;
