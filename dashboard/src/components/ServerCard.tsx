import { getServerPictureUrl } from "helpers/discord";
import { Card, Col, Row } from "react-bootstrap";
import { ServerBase } from "types";
import StyledServerCard from "./styles/ServerCard";

interface ServerCardProps {
  server: ServerBase;
  list?: boolean;
  children?: JSX.Element | string | number;
}

const ServerCard = ({ server, list = false, children }: ServerCardProps) => {
  if (list) {
    return (
      <StyledServerCard className="list">
        <Row className="gy-2">
          <Col xs={12} md={6} className="d-flex align-items-center">
            <div className="server-img-container">
              <Card.Img
                className="server-img-icon"
                variant="top"
                src={getServerPictureUrl(server, true)}
              />
            </div>
            <div className="px-4">
              <div className="server-id">#{server.id}</div>
              <div className="server-name">{server.name}</div>
            </div>
          </Col>
          <Col
            xs={12}
            md={6}
            className="d-flex align-items-center justify-content-end"
          >
            {children}
          </Col>
        </Row>
      </StyledServerCard>
    );
  }

  return (
    <StyledServerCard>
      <div className="server-img-container">
        <Card.Img
          className="server-img-blurred"
          src={getServerPictureUrl(server, false)}
        />
        <Card.Img
          className="server-img-icon"
          variant="top"
          src={getServerPictureUrl(server, true)}
        />
      </div>
      <Card.Body>
        <Card.Title className="server-name">{server.name}</Card.Title>
        <hr />
        {children}
      </Card.Body>
    </StyledServerCard>
  );
};

export default ServerCard;
