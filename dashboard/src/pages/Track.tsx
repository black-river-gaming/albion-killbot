import {
  faAdd,
  faCheck,
  faSearch,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import Loader from "components/Loader";
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
import {
  loadTrack,
  trackAlliance,
  trackGuild,
  trackPlayer,
  untrackAlliance,
  untrackGuild,
  untrackPlayer,
} from "store/track";
import { SearchResults, TrackList } from "types";

const Track = () => {
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

  const limits = server.data?.limits;
  const hasOverLimitItems =
    (limits?.players && track.players.length >= limits.players) ||
    (limits?.guilds && track.guilds.length >= limits.guilds) ||
    (limits?.alliances && track.alliances.length >= limits.alliances);

  const subscription = server.data?.subscription;
  const isPremium =
    subscription &&
    (subscription.expires === "never" ||
      new Date(subscription.expires).getTime() > new Date().getTime());

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    search(query, true);
  };

  const renderTracking = () => {
    const renderTrackingList = (
      title: string,
      limit = 0,
      list: TrackList["players" | "guilds" | "alliances"],
      untrackAction: ActionCreatorWithPayload<string, string>
    ) => {
      return (
        <ListGroup className="rounded">
          <ListGroup.Item
            className="d-flex justify-content-center"
            variant="primary"
          >
            {title} [{list.length}/{limit}]
          </ListGroup.Item>
          {list.map(({ id, name }, i) => (
            <ListGroup.Item key={id} className="paper">
              <div className="d-flex justify-content-between align-items-center">
                <div className={i >= limit ? "text-danger" : ""}>{name}</div>
                <ButtonGroup size="sm">
                  <Button
                    variant="danger"
                    className="btn-icon"
                    onClick={() => dispatch(untrackAction(id))}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </ButtonGroup>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      );
    };

    return (
      <Row className="p-2 gy-2">
        <Col xl={4}>
          {renderTrackingList(
            "Players",
            server.data?.limits.players,
            track.players,
            untrackPlayer
          )}
        </Col>
        <Col xl={4}>
          {renderTrackingList(
            "Guilds",
            server.data?.limits.guilds,
            track.guilds,
            untrackGuild
          )}
        </Col>
        <Col xl={4}>
          {renderTrackingList(
            "Alliances",
            server.data?.limits.alliances,
            track.alliances,
            untrackAlliance
          )}
        </Col>
      </Row>
    );
  };

  const renderSearchResults = () => {
    const renderSearchResultsList = (
      title: string,
      searchResults: SearchResults["players" | "guilds" | "alliances"],
      trackList: TrackList["players" | "guilds" | "alliances"],
      trackFunction: (entity: { id: string; name: string }) => void
    ) => {
      return (
        <div>
          <div className="d-flex justify-content-center">{title}</div>
          <ListGroup>
            {searchResults.map(({ id, name }) => (
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
                        onClick={() => trackFunction({ id, name })}
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
      const limit = server.data?.limits.players || 0;

      if (track.players.length >= limit)
        return showError(`Maximum limit of ${limit} player(s) exceeded.`);
      dispatch(trackPlayer(player));
    };

    const doTrackGuild = (guild: SearchResults["guilds"][number]) => {
      const limit = server.data?.limits.guilds || 0;

      if (track.guilds.length >= limit)
        return showError(`Maximum limit of ${limit} guild(s) exceeded.`);
      dispatch(trackGuild(guild));
    };

    const doTrackAlliance = (alliance: SearchResults["alliances"][number]) => {
      const limit = server.data?.limits.alliances || 0;

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

        <Card>
          {renderTracking()}
          <div className="d-flex justify-content-end align-items-center p-3">
            <Button
              variant="secondary"
              onClick={() => {
                if (server?.data?.settings)
                  dispatch(loadTrack(server.data.track));
              }}
            >
              Reset
            </Button>
            <div className="px-2" />
            <Button
              variant="primary"
              onClick={() => dispatchUpdateTrack({ serverId, track })}
            >
              Save
            </Button>
          </div>
        </Card>
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

export default Track;
