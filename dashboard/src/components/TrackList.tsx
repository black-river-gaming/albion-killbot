import { Badge, Button, ButtonGroup, ListGroup, Stack } from "react-bootstrap";
import { ITrackList } from "types";

interface ITrackListItemProps {
  title: string;
  limit: number;
  list: ITrackList["players" | "guilds" | "alliances"];
  onUntrackClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: string
  ) => void;
}

const TrackList = ({
  title,
  limit = 0,
  list,
  onUntrackClick,
}: ITrackListItemProps) => {
  return (
    <ListGroup>
      <ListGroup.Item
        variant="primary"
        className="d-flex justify-content-between align-items-baseline"
      >
        <div>{title}</div>
        <Badge bg={list.length < limit ? "secondary" : "danger"}>
          {list.length}/{limit}
        </Badge>
      </ListGroup.Item>

      {list.map(({ id, name, server }, i) => (
        <ListGroup.Item key={id} className="paper">
          <div className="d-flex justify-content-between align-items-center">
            <Stack>
              <span className="id-text">#{id}</span>
              <Stack
                direction="horizontal"
                gap={2}
                className="d-flex align-items-baseline"
              >
                <div className={i >= limit ? "text-danger" : ""}>{name}</div>
                <Badge bg={server.toLowerCase().replace(" ", "-")}>
                  {server}
                </Badge>
              </Stack>
            </Stack>
            <ButtonGroup size="sm">
              <Button
                size="sm"
                variant="danger"
                onClick={(e) => {
                  return onUntrackClick(e, id);
                }}
              >
                Remove
              </Button>
            </ButtonGroup>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default TrackList;
