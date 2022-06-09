import {
  faAdd,
  faCheck,
  faSearch,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import React, { useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  InputGroup,
  ListGroup,
  Row,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import Loader from "shared/components/Loader";
import Toast from "shared/components/Toast";
import { useAppDispatch, useAppSelector } from "shared/hooks";
import {
  SearchResults,
  TrackList,
  useFetchServerQuery,
  useLazySearchQuery,
  useUpdateTrackMutation,
} from "store/api";
import {
  loadTrack,
  trackAlliance,
  trackGuild,
  trackPlayer,
  untrackAlliance,
  untrackGuild,
  untrackPlayer,
} from "store/track";

// Until we have subscriptions working, these limits are constants
const PLAYER_LIMIT = 10;
const GUILD_LIMIT = 1;
const ALLIANCE_LIMIT = 1;

const Track = () => {
  const { serverId = "" } = useParams();
  const server = useFetchServerQuery(serverId);
  const [dispatchUpdateTrack, updateTrack] = useUpdateTrackMutation();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [search, searchResults] = useLazySearchQuery();
  const track = useAppSelector((state) => state.track);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (server?.data?.settings) {
      dispatch(loadTrack(server.data.settings.track));
    }
  }, [dispatch, server]);

  useEffect(() => {
    if (
      updateTrack.status === QueryStatus.fulfilled ||
      updateTrack.status === QueryStatus.rejected
    ) {
      setTimeout(() => {
        updateTrack.reset();
      }, 3000);
    }
  }, [server, updateTrack, updateTrack.reset, updateTrack.status]);

  if (updateTrack.isLoading) return <Loader />;

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
            {title} {limit && `[${list.length}/${limit}]`}
          </ListGroup.Item>
          {list.map(({ id, name }) => (
            <ListGroup.Item key={id} className="pe-1">
              <div className="d-flex justify-content-between align-items-center">
                <div>{name}</div>
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
        <Col sm={4}>
          {renderTrackingList(
            "Players",
            PLAYER_LIMIT,
            track.players,
            untrackPlayer
          )}
        </Col>
        <Col sm={4}>
          {renderTrackingList(
            "Guilds",
            GUILD_LIMIT,
            track.guilds,
            untrackGuild
          )}
        </Col>
        <Col sm={4}>
          {renderTrackingList(
            "Alliances",
            ALLIANCE_LIMIT,
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

    const doTrackPlayer = (player: SearchResults["players"][number]) => {
      if (track.players.length >= PLAYER_LIMIT)
        return setError(`Maximum limit of ${PLAYER_LIMIT} player(s) achieved.`);
      dispatch(trackPlayer(player));
    };

    const doTrackGuild = (guild: SearchResults["guilds"][number]) => {
      if (track.guilds.length >= GUILD_LIMIT)
        return setError(`Maximum limit of ${GUILD_LIMIT} guild(s) achieved.`);
      dispatch(trackGuild(guild));
    };

    const doTrackAlliance = (alliance: SearchResults["alliances"][number]) => {
      if (track.alliances.length >= ALLIANCE_LIMIT)
        return setError(
          `Maximum limit of ${ALLIANCE_LIMIT} alliance(s) achieved.`
        );
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
    <>
      <Row className="g-3">
        <Col sm={12}>
          <Card>
            <h4 className="d-flex justify-content-center p-2">Tracking List</h4>
            {renderTracking()}
            <div className="d-flex justify-content-end align-items-center p-3">
              <Button
                variant="secondary"
                onClick={() => {
                  if (server?.data?.settings)
                    dispatch(loadTrack(server.data.settings.track));
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
            <Form onSubmit={handleSearch}>
              <Form.Group controlId="search-albion" className="px-2">
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    aria-describedby="search-help"
                    placeholder="Search in Albion Online for name or id"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Button variant="primary" type="submit">
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                </InputGroup>
                <Form.Text id="search-help" muted>
                  For alliances, input the alliance id
                </Form.Text>
              </Form.Group>
            </Form>
            {renderSearchResults()}
          </Card>
        </Col>
      </Row>

      <Toast bg="success" show={updateTrack.isSuccess}>
        Tracking list saved.
      </Toast>
      <Toast bg="danger" show={updateTrack.isError}>
        Failed to save tracking list. Please try again later.
      </Toast>
      <Toast
        bg="danger"
        show={error.length > 0}
        onClose={() => setError("")}
        delay={3000}
        autohide
      >
        {error}
      </Toast>
    </>
  );
};

export default Track;
