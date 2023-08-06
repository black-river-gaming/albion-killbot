import Loader from "components/Loader";
import Search from "components/Search";
import TrackList from "components/TrackList";
import { TRACK_TYPE } from "helpers/constants";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { useEffect } from "react";
import { Alert, Button, Card, Col, Row, Stack } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useFetchServerQuery, useUpdateTrackMutation } from "store/api";
import { loadTrack } from "store/track";

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

  return (
    <Row className="g-3">
      <Col sm={12}>
        {hasOverLimitItems ? (
          <Alert variant="danger">
            Items <span className="text-danger">over the limit</span> will not
            generate notifications. To increase your limits, please check the
            <Link to="/premium"> Premium</Link> page to buy assign a
            subscription.
          </Alert>
        ) : (
          !isPremium && (
            <Alert variant="info">
              Want to have more slots to track? To increase your limits, please
              check the
              <Link to="/premium"> Premium</Link> page to buy assign a
              subscription.
            </Alert>
          )
        )}

        {hasNoConfiguredTrackChannels && (
          <Alert variant="warning">
            <b>Warning: </b>
            <span>
              You do not have configured a channel to display kills or death
              notifications. Please go to the{" "}
            </span>
            <Link to={`/dashboard/${id}/settings`}>Settings</Link>
            <span> page to set up notification channels.</span>
          </Alert>
        )}

        <Card>
          <Stack gap={3} className="p-2">
            <TrackList
              type={TRACK_TYPE.PLAYERS}
              limit={limits.players}
              list={track.players}
            />
            <TrackList
              type={TRACK_TYPE.GUILDS}
              limit={limits.guilds}
              list={track.guilds}
            />
            <TrackList
              type={TRACK_TYPE.ALLIANCES}
              limit={limits.alliances}
              list={track.alliances}
            />
          </Stack>

          <Card.Footer>
            {track.changed && (
              <Alert variant="warning">You have unsaved changes.</Alert>
            )}

            <Stack
              direction="horizontal"
              gap={2}
              className="justify-content-end"
            >
              <Button
                variant="secondary"
                onClick={() => {
                  if (server?.data?.track)
                    dispatch(loadTrack(server.data.track));
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
      </Col>

      <Col sm={12}>
        <Search limits={limits} />
      </Col>
    </Row>
  );
};

export default TrackPage;
