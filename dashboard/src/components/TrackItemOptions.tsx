import { useAppDispatch } from "helpers/hooks";
import { useState } from "react";
import { Button, Form, Modal, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useFetchServerQuery } from "store/api";
import { setItemDeathsChannel, setItemKillsChannel } from "store/track";
import { ITrackItem, TRACK_TYPE } from "types/track";
import ChannelInput from "./ChannelInput";

interface ITrackItemOptionsProps {
  type: TRACK_TYPE;
  item: ITrackItem;
}

const TrackItemOptions = ({ type, item }: ITrackItemOptionsProps) => {
  const { serverId = "" } = useParams();
  const { data: server } = useFetchServerQuery(serverId);
  const [show, setShow] = useState(false);
  const dispatch = useAppDispatch();

  const { id, name, kills, deaths } = item;
  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setShow(true)}>
        Customize
      </Button>

      <Modal show={show} centered={true}>
        <Modal.Title>
          <Stack className="p-3 gap-1">
            <div className="id-text">#{id}</div>
            <div>{name}</div>
          </Stack>
        </Modal.Title>
        <Modal.Body>
          <Form>
            <Stack gap={2}>
              <h5>Kills</h5>
              <Form.Group controlId="channel">
                <Form.Label>Notification Channel</Form.Label>
                <ChannelInput
                  aria-label="Notification channel"
                  availableChannels={server?.channels}
                  value={kills?.channel}
                  onChannelChange={(channel) =>
                    dispatch(setItemKillsChannel({ type, item, channel }))
                  }
                />
                <Form.Text muted>
                  This will override the default kills settings.
                </Form.Text>
              </Form.Group>

              <hr />

              <h5>Deaths</h5>
              <Form.Group controlId="deathsChannel">
                <Form.Label>Notification Channel</Form.Label>
                <ChannelInput
                  aria-label="Notification channel"
                  availableChannels={server?.channels}
                  value={deaths?.channel}
                  onChannelChange={(channel) =>
                    dispatch(setItemDeathsChannel({ type, item, channel }))
                  }
                />
                <Form.Text muted>
                  This will override the default deaths settings.
                </Form.Text>
              </Form.Group>
            </Stack>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-end">
            <Button variant="primary" onClick={() => setShow(false)}>
              Done
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TrackItemOptions;
