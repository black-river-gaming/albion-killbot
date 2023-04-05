import { TRACK_TYPE } from "helpers/constants";
import { useAppDispatch } from "helpers/hooks";
import { useState } from "react";
import { Button, Form, Modal, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useFetchServerQuery } from "store/api";
import { setItemChannel } from "store/track";
import { ITrackItem } from "types";
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

  const { id, name, channel } = item;
  return (
    <>
      <Button size="sm" variant="primary" onClick={() => setShow(true)}>
        Settings
      </Button>

      <Modal show={show} centered={true}>
        <Modal.Title>
          <Stack className="p-3">
            <div className="id-text">#{id}</div>
            <div>{name}</div>
          </Stack>
        </Modal.Title>
        <Modal.Body>
          <Form>
            <Stack gap={2}>
              <Form.Group controlId="channel">
                <Form.Label>Notification Channel</Form.Label>
                <ChannelInput
                  aria-label="Notification channel"
                  availableChannels={server?.channels}
                  value={channel}
                  onChannelChange={(channel) =>
                    dispatch(setItemChannel({ type, item, channel }))
                  }
                />
                <Form.Text muted>
                  Setting custom notification channel will override kills/deaths
                  settings.
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
