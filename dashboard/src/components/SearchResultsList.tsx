import { Badge, Button, ButtonGroup, ListGroup, Stack } from "react-bootstrap";
import { useGetConstantsQuery } from "store/api";
import { ITrackList } from "types/track";

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
  const constants = useGetConstantsQuery();

  return (
    <ListGroup>
      <ListGroup.Item
        variant="secondary"
        className="d-flex justify-content-between align-items-baseline"
      >
        <div>{title}</div>
      </ListGroup.Item>

      {list.map((item) => {
        if (!constants.data) return null;
        const server = constants.data.servers.find(
          (server) => server.id === item.server
        );
        if (!server) return null;

        const { id, name } = item;
        const isTracked =
          track &&
          track.some((item) => item.id === id && item.server === server.id);

        return (
          <ListGroup.Item key={id} className="paper">
            <div className="d-flex justify-content-between align-items-center">
              <Stack>
                <span className="id-text">{id}</span>
                <Stack
                  direction="horizontal"
                  gap={2}
                  className="d-flex align-items-baseline"
                >
                  <div>{name}</div>
                  {server && <Badge bg={server.id}>{server.name}</Badge>}
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
                      return onTrackClick(e, item);
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
