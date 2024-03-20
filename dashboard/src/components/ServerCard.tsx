import { getServerPictureUrl } from "helpers/discord";
import { Card, Col, Row } from "react-bootstrap";
import { ServerBase } from "types/server";
import Loader from "./common/Loader";
import StyledServerCard from "./styles/ServerCard";

interface ServerCardProps {
  server?: ServerBase;
  list?: boolean;
  loading?: boolean;
  header?: JSX.Element | string | number;
  children?: JSX.Element | string | number;
}

const ServerCard = ({
  server,
  list = false,
  loading = false,
  header,
  children,
}: ServerCardProps) => {
  if (typeof server == "string") {
    server = {
      id: server,
      name: "Unknown Server",
    };
  }

  if (list) {
    if (loading) {
      return (
        <Loader width={500} height={70}>
          <rect x="0" y="0" rx="5" ry="5" width="500" height="70" />
        </Loader>
      );
    }
    if (!server) return null;

    return (
      <Card>
        {header}
        <Row className="gy-2 p-3">
          <Col xs={12} md={6} className="d-flex align-items-center">
            <div style={{ position: "relative" }}>
              <Card.Img
                className="server-img-icon"
                variant="top"
                src={getServerPictureUrl(server, true)}
                style={{
                  borderRadius: "50%",
                  width: 75,
                  height: 75,

                  boxShadow:
                    "0px 3px 5px -1px rgb(0 0 0 / 80%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%)",

                  userSelect: "none",
                }}
              />
            </div>
            <div className="px-3">
              {server.id && (
                <div
                  className="text-muted"
                  style={{ fontSize: 10, lineHeight: 1 }}
                >
                  {server.id}
                </div>
              )}
              <div className="m-0">{server.name}</div>
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
      </Card>
    );
  }

  if (!server) return null;
  return (
    <StyledServerCard>
      {header}
      <Card.Body>
        <div style={{ position: "relative" }}>
          <Card.Img
            style={{
              height: 120,
              width: "100%",
              objectFit: "cover",
              filter: "blur(8px)",
              pointerEvents: "none",
              userSelect: "none",
            }}
            src={getServerPictureUrl(server, false)}
          />
          <Card.Img
            variant="top"
            src={getServerPictureUrl(server, true)}
            style={{
              position: "absolute",

              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",

              width: 75,
              height: 75,

              borderRadius: "50%",
              userSelect: "none",
            }}
          />
        </div>
        <Card.Title
          className="server-name"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translate(-50%, -10%)",
            whiteSpace: "nowrap",
          }}
        >
          {server.name}
        </Card.Title>
        <hr />
        {children}
      </Card.Body>
    </StyledServerCard>
  );
};

export default ServerCard;
