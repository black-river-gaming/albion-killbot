import { useAppDispatch } from "helpers/hooks";
import { capitalize } from "helpers/utils";
import { Badge, Button, ListGroup, Stack } from "react-bootstrap";
import { useFetchConstantsQuery } from "store/api";
import { untrackAlliance, untrackGuild, untrackPlayer } from "store/track";
import { ITrackList, TRACK_TYPE } from "types/track";
import TrackItemOptions from "./TrackItemOptions";

interface ITrackListItemProps {
  type: TRACK_TYPE;
  limit: number;
  list: ITrackList[TRACK_TYPE];
}

const TrackList = ({ type, limit = 0, list }: ITrackListItemProps) => {
  const dispatch = useAppDispatch();
  const constants = useFetchConstantsQuery();

  return (
    <ListGroup>
      <ListGroup.Item
        variant="secondary"
        className="d-flex justify-content-between align-items-baseline"
      >
        <div>{capitalize(type)}</div>
        <Badge bg={list.length < limit ? "secondary" : "danger"}>
          {list.length}/{limit}
        </Badge>
      </ListGroup.Item>

      {list.map((item, i) => {
        if (!constants.data) return null;

        const { id, name } = item;
        const server = constants.data.servers.find(
          (server) => server.id === item.server
        );

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
                  <div className={i >= limit ? "text-danger" : ""}>{name}</div>
                  {server && <Badge bg={server.id}>{server.name}</Badge>}
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <TrackItemOptions type={type} item={item} />
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    switch (type) {
                      case TRACK_TYPE.PLAYERS:
                        return dispatch(untrackPlayer(id));
                      case TRACK_TYPE.GUILDS:
                        return dispatch(untrackGuild(id));
                      case TRACK_TYPE.ALLIANCES:
                        return dispatch(untrackAlliance(id));
                    }
                  }}
                >
                  Remove
                </Button>
              </Stack>
            </div>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};

export default TrackList;
