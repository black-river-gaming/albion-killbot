import Loader from "components/Loader";
import Search from "components/Search";
import Track from "components/Track";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { useEffect } from "react";
import { Alert, Col, Row } from "react-bootstrap";
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
            <Link to="/settings">Settings</Link>
            <span> page to set up notification channels.</span>
          </Alert>
        )}

        <Track
          limits={limits}
          onUpdateClick={() => dispatchUpdateTrack({ serverId: id, track })}
          onResetClick={() => {
            if (server?.data?.track) dispatch(loadTrack(server.data.track));
          }}
        />
      </Col>

      <Col sm={12}>
        <Search limits={limits} />
      </Col>
    </Row>
  );
};

export default TrackPage;
