import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { Alert, Button, Card, Stack } from "react-bootstrap";
import {
  resetTrack,
  untrackAlliance,
  untrackGuild,
  untrackPlayer,
} from "store/track";
import { Limits } from "types";
import TrackList from "./TrackList";

interface ITrackListProps {
  limits: Limits;
  onUpdateClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Track = ({ limits, onUpdateClick }: ITrackListProps) => {
  const track = useAppSelector((state) => state.track);
  const dispatch = useAppDispatch();

  return (
    <Card>
      <Stack gap={3} className="p-2">
        <TrackList
          title="Players"
          limit={limits.players}
          list={track.players}
          onUntrackClick={(e, id) => dispatch(untrackPlayer(id))}
        />
        <TrackList
          title="Guilds"
          limit={limits.guilds}
          list={track.guilds}
          onUntrackClick={(e, id) => dispatch(untrackGuild(id))}
        />
        <TrackList
          title="Alliances"
          limit={limits.alliances}
          list={track.alliances}
          onUntrackClick={(e, id) => dispatch(untrackAlliance(id))}
        />
      </Stack>

      <Card.Footer>
        {track.changed && (
          <Alert variant="warning">You have unsaved changes.</Alert>
        )}

        <Stack direction="horizontal" gap={2} className="justify-content-end">
          <Button
            variant="secondary"
            onClick={() => {
              dispatch(resetTrack());
            }}
          >
            Reset
          </Button>
          <Button variant="primary" onClick={onUpdateClick}>
            Save
          </Button>
        </Stack>
      </Card.Footer>
    </Card>
  );
};

export default Track;
