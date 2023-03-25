import { faAdd, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { Button, ButtonGroup, ListGroup } from "react-bootstrap";
import { addToast } from "store/toast";
import { trackAlliance, trackGuild, trackPlayer } from "store/track";
import { ISearchResults, Limits, TrackList } from "types";

interface ISearchResultsProps {
  limits: Limits;
  searchResults?: ISearchResults;
}

const SearchResults = ({ limits, searchResults }: ISearchResultsProps) => {
  const track = useAppSelector((state) => state.track);
  const dispatch = useAppDispatch();

  const renderSearchResultsList = (
    title: string,
    searchResults: ISearchResults["players" | "guilds" | "alliances"],
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

  const doTrackPlayer = (player: ISearchResults["players"][number]) => {
    const limit = limits.players || 0;

    if (track.players.length >= limit)
      return showError(`Maximum limit of ${limit} player(s) exceeded.`);
    dispatch(trackPlayer(player));
  };

  const doTrackGuild = (guild: ISearchResults["guilds"][number]) => {
    const limit = limits.guilds || 0;

    if (track.guilds.length >= limit)
      return showError(`Maximum limit of ${limit} guild(s) exceeded.`);
    dispatch(trackGuild(guild));
  };

  const doTrackAlliance = (alliance: ISearchResults["alliances"][number]) => {
    const limit = limits.alliances || 0;

    if (track.alliances.length >= limit)
      return showError(`Maximum limit of ${limit} alliances(s) exceeded.`);
    dispatch(trackAlliance(alliance));
  };

  if (
    !searchResults ||
    (searchResults.players.length === 0 &&
      searchResults.guilds.length === 0 &&
      searchResults.alliances.length === 0)
  )
    return (
      <span className="d-flex justify-content-center p-2">
        Nothing was found. Please use a different search term.
      </span>
    );

  const { players, guilds, alliances } = searchResults;

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

export default SearchResults;
