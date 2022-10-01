import { getServerPictureUrl } from "helpers/discord";
import { Card } from "react-bootstrap";
import { Server, ServerPartial } from "store/api";
import StyledServerCard from "./styles";

interface ServerCardProps {
  server: ServerPartial | Server;
  children?: JSX.Element | string | number;
}

const ServerCard = ({ server, children }: ServerCardProps) => {
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
