import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { Button, Card, Stack } from "react-bootstrap";
import {
  resetTrack,
  untrackAlliance,
  untrackGuild,
  untrackPlayer,
} from "store/track";
import { Limits } from "types";
import TrackListItem from "./TrackListItem";

interface ITrackListProps {
  limits: Limits;
  onUpdateClick: React.MouseEventHandler<HTMLButtonElement>;
}

const TrackList = ({ limits, onUpdateClick }: ITrackListProps) => {
  const track = useAppSelector((state) => state.track);
  const dispatch = useAppDispatch();

  return (
    <Card>
      <Stack gap={3} className="p-2">
        <TrackListItem
          title="Players"
          limit={limits.players}
          list={track.players}
          onUntrackClick={(e, id) => dispatch(untrackPlayer(id))}
        />
        <TrackListItem
          title="Guilds"
          limit={limits.guilds}
          list={track.guilds}
          onUntrackClick={(e, id) => dispatch(untrackGuild(id))}
        />
        <TrackListItem
          title="Alliances"
          limit={limits.alliances}
          list={track.alliances}
          onUntrackClick={(e, id) => dispatch(untrackAlliance(id))}
        />
      </Stack>

      <Card.Footer className="d-flex justify-content-end align-items-center">
        <Button
          variant="secondary"
          onClick={() => {
            dispatch(resetTrack());
          }}
        >
          Reset
        </Button>
        <div className="px-2" />
        <Button variant="primary" onClick={onUpdateClick}>
          Save
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default TrackList;
