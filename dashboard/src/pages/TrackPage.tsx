import { faAdd, faCheck, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "components/Loader";
import TrackList from "components/TrackList";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  InputGroup,
  ListGroup,
  Row,
} from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import {
  useFetchServerQuery,
  useLazySearchQuery,
  useUpdateTrackMutation,
} from "store/api";
import { addToast } from "store/toast";
import { loadTrack, trackAlliance, trackGuild, trackPlayer } from "store/track";
import { SearchResults, TrackList as ITrackList } from "types";

const TrackPage = () => {
  const { serverId = "" } = useParams();
  const server = useFetchServerQuery(serverId);
  const [query, setQuery] = useState("");
  const [search, searchResults] = useLazySearchQuery();
  const track = useAppSelector((state) => state.track);
  const dispatch = useAppDispatch();
  const [dispatchUpdateTrack, updateTrack] = useUpdateTrackMutation();

  useEffect(() => {
    if (server?.data?.settings) {
      dispatch(loadTrack(server.data.track));
    }
  }, [dispatch, server]);

  if (updateTrack.isLoading) return <Loader />;
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    search(query, true);
  };

  const renderSearchResults = () => {
    const renderSearchResultsList = (
      title: string,
      searchResults: SearchResults["players" | "guilds" | "alliances"],
      trackList: ITrackList["players" | "guilds" | "alliances"],
      trackFunction: (
        entity:
          | ITrackList["players"][number]
          | ITrackList["guilds"][number]
          | ITrackList["alliances"][number]
      ) => void
    ) => {
      return (
        <div>
          <div className="d-flex justify-content-center">{title}</div>
          <ListGroup>
            {searchResults.map(({ id, name, server }) => (
              <ListGroup.Item key={id}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>{name}</div>
                  <ButtonGroup size="sm">
                    {trackList.find((item) => item.id === id) ? (
                      <Button variant="success" className="btn-icon" disabled>
                        <FontAwesomeIcon icon={faCheck} />
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="btn-icon"
                        onClick={() => trackFunction({ id, name, server })}
                      >
                        <FontAwesomeIcon icon={faAdd} />
                      </Button>
                    )}
                  </ButtonGroup>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      );
    };

    const showError = (message: string) =>
      dispatch(addToast({ theme: "danger", message }));

    const doTrackPlayer = (player: SearchResults["players"][number]) => {
      const limit = limits.players || 0;

      if (track.players.length >= limit)
        return showError(`Maximum limit of ${limit} player(s) exceeded.`);
      dispatch(trackPlayer(player));
    };

    const doTrackGuild = (guild: SearchResults["guilds"][number]) => {
      const limit = limits.guilds || 0;

      if (track.guilds.length >= limit)
        return showError(`Maximum limit of ${limit} guild(s) exceeded.`);
      dispatch(trackGuild(guild));
    };

    const doTrackAlliance = (alliance: SearchResults["alliances"][number]) => {
      const limit = limits.alliances || 0;

      if (track.alliances.length >= limit)
        return showError(`Maximum limit of ${limit} alliances(s) exceeded.`);
      dispatch(trackAlliance(alliance));
    };

    if (searchResults.isUninitialized) return;
    if (searchResults.isFetching) return <Loader className="p-2" />;
    if (!searchResults.data)
      return (
        <span className="d-flex justify-content-center p-2">
          Nothing was found. Please use a different search term.
        </span>
      );

    const { players, guilds, alliances } = searchResults.data;

    return (
      <div className="p-2 pb-0">
        {players.length > 0 &&
          renderSearchResultsList(
            "Players",
            players.slice(0, 5),
            track.players,
            doTrackPlayer
          )}
        {guilds.length > 0 &&
          renderSearchResultsList(
            "Guilds",
            guilds.slice(0, 5),
            track.guilds,
            doTrackGuild
          )}
        {alliances.length > 0 &&
          renderSearchResultsList(
            "Alliances",
            alliances.slice(0, 5),
            track.alliances,
            doTrackAlliance
          )}
      </div>
    );
  };

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

        <TrackList
          limits={limits}
          onUpdateClick={() => dispatchUpdateTrack({ serverId: id, track })}
        />
      </Col>
      <Col sm={12}>
        <Card className="p-2">
          <h4 className="d-flex justify-content-center p-2">Search</h4>
          <Form onSubmit={handleSearch} className="pb-2">
            <Form.Group controlId="search-albion" className="px-2">
              <Form.Label>Search</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  aria-describedby="search-help"
                  placeholder="Search in Albion Online for name or ID"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button variant="primary" type="submit">
                  <FontAwesomeIcon icon={faSearch} />
                </Button>
              </InputGroup>
              <Form.Text id="search-help" muted>
                For alliances, only search by <b>ID</b> is working
              </Form.Text>
            </Form.Group>
          </Form>
          {renderSearchResults()}
        </Card>
      </Col>
    </Row>
  );
};

export default TrackPage;
