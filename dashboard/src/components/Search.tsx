import { faAdd, faCheck, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SERVER, SERVERS } from "helpers/constants";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Dropdown,
  Form,
  InputGroup,
  ListGroup,
} from "react-bootstrap";
import { useLazySearchQuery } from "store/api";
import { addToast } from "store/toast";
import { trackAlliance, trackGuild, trackPlayer } from "store/track";
import { Limits, SearchResults, TrackList } from "types";
import Loader from "./Loader";

interface ISearchProps {
  limits: Limits;
}

const Search = ({ limits }: ISearchProps) => {
  const [query, setQuery] = useState("");
  const [server, setServer] = useState(SERVER.WEST);
  const [search, searchResults] = useLazySearchQuery();
  const track = useAppSelector((state) => state.track);
  const dispatch = useAppDispatch();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    search({ server, query }, true);
  };

  const renderSearchResults = () => {
    const renderSearchResultsList = (
      title: string,
      searchResults: SearchResults["players" | "guilds" | "alliances"],
      trackList: TrackList["players" | "guilds" | "alliances"],
      trackFunction: (
        entity:
          | TrackList["players"][number]
          | TrackList["guilds"][number]
          | TrackList["alliances"][number]
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
    <Card>
      <Form onSubmit={handleSearch} className="p-2">
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
            <Dropdown>
              <Dropdown.Toggle variant="primary">{server}</Dropdown.Toggle>

              <Dropdown.Menu>
                {SERVERS.map((server) => (
                  <Dropdown.Item key={server} onClick={() => setServer(server)}>
                    {server}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
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
  );
};

export default Search;
