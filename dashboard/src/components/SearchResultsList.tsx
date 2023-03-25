import { Badge, Button, ButtonGroup, ListGroup, Stack } from "react-bootstrap";
import { TrackList as ITrackList } from "types";

interface ISearchResultListsProps {
  title: string;
  list: ITrackList["players" | "guilds" | "alliances"];
  track?: ITrackList["players" | "guilds" | "alliances"];
  onTrackClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    item: ITrackList["players" | "guilds" | "alliances"][number]
  ) => void;
}

const SearchResultsList = ({
  title,
  list,
  track,
  onTrackClick,
}: ISearchResultListsProps) => {
  return (
    <ListGroup>
      <ListGroup.Item
        variant="secondary"
        className="d-flex justify-content-between align-items-baseline"
      >
        <div>{title}</div>
      </ListGroup.Item>

      {list.map((item) => {
        const { id, name, server } = item;
        const isTracked =
          track &&
          track.some((item) => item.id === id && item.server === server);

        return (
          <ListGroup.Item key={id} className="paper">
            <div className="d-flex justify-content-between align-items-center">
              <Stack>
                <span className="id-text">#{id}</span>
                <Stack
                  direction="horizontal"
                  gap={2}
                  className="d-flex align-items-baseline"
                >
                  <div>{name}</div>
                  <Badge bg={server.toLowerCase().replace(" ", "-")}>
                    {server}
                  </Badge>
                </Stack>
              </Stack>
              <ButtonGroup size="sm">
                {isTracked ? (
                  <Button size="sm" variant="secondary" disabled>
                    Added
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={(e) => {
                      return onTrackClick(e, { id, name, server });
                    }}
                  >
                    Add
                  </Button>
                )}
              </ButtonGroup>
            </div>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};

export default SearchResultsList;
