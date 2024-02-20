import Loader from "components/Loader";
import Search from "components/Search";
import TrackList from "components/TrackList";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { useEffect } from "react";
import { Alert, Button, Card, Stack } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useFetchServerQuery, useUpdateTrackMutation } from "store/api";
import { loadTrack } from "store/track";
import { TRACK_TYPE } from "types/track";

const TrackPage = () => {
  const { serverId = "" } = useParams();
  const server = useFetchServerQuery(serverId);
  const track = useAppSelector((state) => state.track);
  const dispatch = useAppDispatch();
  const [dispatchUpdateTrack, updateTrack] = useUpdateTrackMutation();

  useEffect(() => {
    if (server?.data?.settings) {
      dispatch(loadTrack(server.data.track));
    }
  }, [dispatch, server]);

  if (server.isLoading || updateTrack.isLoading) return <Loader />;
  if (!server.data) return <div>No data for this server.</div>;

  const { id, limits, settings, subscription } = server.data;

  const hasOverLimitItems =
    (limits?.players && track.players.length > limits.players) ||
    (limits?.guilds && track.guilds.length > limits.guilds) ||
    (limits?.alliances && track.alliances.length > limits.alliances);
  const isPremium =
    subscription &&
    (subscription.expires === "never" ||
      new Date(subscription.expires).getTime() > new Date().getTime());
  const hasNoConfiguredTrackChannels =
    !settings.kills.channel && !settings.deaths.channel;
  const emptyList =
    track.players.length === 0 &&
    track.guilds.length === 0 &&
    track.alliances.length === 0;

  return (
    <Stack gap={3}>
      {hasOverLimitItems ? (
        <Alert variant="danger" className="m-0">
          Items <span className="text-danger">over the limit</span> will not
          generate notifications. To increase your limits, please check the
          <Link to="/premium"> Premium</Link> page to buy assign a subscription.
        </Alert>
      ) : (
        !isPremium && (
          <Alert variant="info" className="m-0">
            Want to have more slots to track? To increase your limits, please
            check the
            <Link to="/premium"> Premium</Link> page to buy assign a
            subscription.
          </Alert>
        )
      )}

      {hasNoConfiguredTrackChannels && (
        <Alert variant="warning" className="m-0">
          <b>Warning: </b>
          <span>
            You do not have configured a channel to display kills or death
            notifications. Please go to the{" "}
          </span>
          <Link to={`/dashboard/${id}/settings`}>Settings</Link>
          <span> page to set up notification channels.</span>
        </Alert>
      )}

      {track.changed && (
        <Alert variant="warning" className="m-0">
          You have unsaved changes.
        </Alert>
      )}

      <Card>
        <Card.Header>Notification List</Card.Header>
        <Stack gap={3} className="p-2">
          {track.players.length > 0 && (
            <TrackList
              type={TRACK_TYPE.PLAYERS}
              limit={limits.players}
              list={track.players}
            />
          )}
          {track.guilds.length > 0 && (
            <TrackList
              type={TRACK_TYPE.GUILDS}
              limit={limits.guilds}
              list={track.guilds}
            />
          )}
          {track.alliances.length > 0 && (
            <TrackList
              type={TRACK_TYPE.ALLIANCES}
              limit={limits.alliances}
              list={track.alliances}
            />
          )}

          {emptyList && (
            <div className="px-2">
              Use the search to add to the notification list.
            </div>
          )}
        </Stack>

        <Card.Footer>
          <Stack direction="horizontal" gap={2} className="justify-content-end">
            <Button
              variant="secondary"
              onClick={() => {
                if (server?.data?.track) dispatch(loadTrack(server.data.track));
              }}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={() => dispatchUpdateTrack({ serverId: id, track })}
            >
              Save
            </Button>
          </Stack>
        </Card.Footer>
      </Card>

      <Search limits={limits} />
    </Stack>
  );
};

export default TrackPage;
