import ChannelInput from "components/ChannelInput";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { Form, Stack } from "react-bootstrap";
import {
  setBattlesChannel,
  setBattlesEnabled,
  setBattlesThresholdAlliances,
  setBattlesThresholdGuilds,
  setBattlesThresholdPlayers,
} from "store/settings";
import { IChannel } from "types";

interface ISettingsBattlesProps {
  channels: IChannel[];
}

const SettingsBattles = ({ channels }: ISettingsBattlesProps) => {
  const battles = useAppSelector((state) => state.settings.battles);
  const dispatch = useAppDispatch();

  return (
    <>
      <Form.Group controlId="kills-enabled">
        <Form.Check
          type="switch"
          label="Enabled"
          checked={battles.enabled}
          onChange={(e) => dispatch(setBattlesEnabled(e.target.checked))}
        />
      </Form.Group>
      <Form.Group controlId="battles-channel" className="py-2">
        <Form.Label>Notification Channel</Form.Label>
        <ChannelInput
          aria-label="Battles channel"
          disabled={!battles.enabled}
          availableChannels={channels}
          value={battles.channel}
          onChannelChange={(channelId) =>
            dispatch(setBattlesChannel(channelId))
          }
        />
      </Form.Group>
      <Stack direction="horizontal" gap={2} className="justify-content-between">
        <Form.Group controlId="threshold-players">
          <Form.Label>Minimum Players</Form.Label>
          <Form.Control
            type="number"
            value={battles.threshold.players}
            onChange={(e) =>
              dispatch(setBattlesThresholdPlayers(Number(e.target.value)))
            }
          />
        </Form.Group>
        <Form.Group controlId="threshold-guilds">
          <Form.Label>Minimum Guilds</Form.Label>
          <Form.Control
            type="number"
            value={battles.threshold.guilds}
            onChange={(e) =>
              dispatch(setBattlesThresholdGuilds(Number(e.target.value)))
            }
          />
        </Form.Group>
        <Form.Group controlId="threshold-alliances">
          <Form.Label>Minimum Alliances</Form.Label>
          <Form.Control
            type="number"
            value={battles.threshold.alliances}
            onChange={(e) =>
              dispatch(setBattlesThresholdAlliances(Number(e.target.value)))
            }
          />
        </Form.Group>
      </Stack>
    </>
  );
};

export default SettingsBattles;
