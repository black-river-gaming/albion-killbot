import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  ListGroup,
  Row,
} from "react-bootstrap";
import {
  resetTrack,
  untrackAlliance,
  untrackGuild,
  untrackPlayer,
} from "store/track";
import { Limits, TrackList as ITrackList } from "types";

interface ITrackListProps {
  limits: Limits;
  onUpdateClick: React.MouseEventHandler<HTMLButtonElement>;
}

const TrackList = ({ limits, onUpdateClick }: ITrackListProps) => {
  const track = useAppSelector((state) => state.track);
  const dispatch = useAppDispatch();

  const renderTrackingList = (
    title: string,
    limit = 0,
    list: ITrackList["players" | "guilds" | "alliances"],
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
    <Card>
      <Row className="p-2 gy-2">
        <Col xl={4}>
          {renderTrackingList(
            "Players",
            limits.players,
            track.players,
            untrackPlayer
          )}
        </Col>
        <Col xl={4}>
          {renderTrackingList(
            "Guilds",
            limits.guilds,
            track.guilds,
            untrackGuild
          )}
        </Col>
        <Col xl={4}>
          {renderTrackingList(
            "Alliances",
            limits.alliances,
            track.alliances,
            untrackAlliance
          )}
        </Col>
      </Row>
      <div className="d-flex justify-content-end align-items-center p-3">
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
      </div>
    </Card>
  );
};

export default TrackList;
