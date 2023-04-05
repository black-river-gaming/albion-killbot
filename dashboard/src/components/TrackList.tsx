import { TRACK_TYPE } from "helpers/constants";
import { useAppDispatch } from "helpers/hooks";
import { capitalize } from "helpers/utils";
import { Badge, Button, ListGroup, Stack } from "react-bootstrap";
import { untrackAlliance, untrackGuild, untrackPlayer } from "store/track";
import { ITrackList } from "types";
import TrackItemOptions from "./TrackItemOptions";

interface ITrackListItemProps {
  type: TRACK_TYPE;
  limit: number;
  list: ITrackList[TRACK_TYPE];
}

const TrackList = ({ type, limit = 0, list }: ITrackListItemProps) => {
  const dispatch = useAppDispatch();

  return (
    <ListGroup>
      <ListGroup.Item
        variant="primary"
        className="d-flex justify-content-between align-items-baseline"
      >
        <div>{capitalize(type)}</div>
        <Badge bg={list.length < limit ? "secondary" : "danger"}>
          {list.length}/{limit}
        </Badge>
      </ListGroup.Item>

      {list.map((item, i) => {
        const { id, name, server } = item;
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
                  <Badge bg={server.toLowerCase().replace(" ", "-")}>
                    {server}
                  </Badge>
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
