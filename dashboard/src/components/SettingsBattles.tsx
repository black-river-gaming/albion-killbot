import ChannelInput from "components/ChannelInput";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { Form, Stack } from "react-bootstrap";
import { useFetchConstantsQuery } from "store/api";
import {
  setBattlesChannel,
  setBattlesEnabled,
  setBattlesProvider,
  setBattlesThresholdAlliances,
  setBattlesThresholdGuilds,
  setBattlesThresholdPlayers,
} from "store/settings";
import { IChannel } from "types";
import Loader from "./Loader";

interface ISettingsBattlesProps {
  channels: IChannel[];
}

const SettingsBattles = ({ channels }: ISettingsBattlesProps) => {
  const constants = useFetchConstantsQuery();
  const battles = useAppSelector((state) => state.settings.battles);
  const dispatch = useAppDispatch();

  if (constants.isFetching || !constants.data) return <Loader />;
  const { providers } = constants.data;

  return (
    <>
      <Form.Group controlId="battles-enabled">
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
      <Stack
        direction="horizontal"
        gap={2}
        className="justify-content-between py-2"
      >
        <Form.Group controlId="threshold-players">
          <Form.Label>Minimum Players</Form.Label>
          <Form.Control
            type="number"
            value={battles.threshold.players || 0}
            onChange={(e) =>
              dispatch(setBattlesThresholdPlayers(Number(e.target.value)))
            }
          />
        </Form.Group>
        <Form.Group controlId="threshold-guilds">
          <Form.Label>Minimum Guilds</Form.Label>
          <Form.Control
            type="number"
            value={battles.threshold.guilds || 0}
            onChange={(e) =>
              dispatch(setBattlesThresholdGuilds(Number(e.target.value)))
            }
          />
        </Form.Group>
        <Form.Group controlId="threshold-alliances">
          <Form.Label>Minimum Alliances</Form.Label>
          <Form.Control
            type="number"
            value={battles.threshold.alliances || 0}
            onChange={(e) =>
              dispatch(setBattlesThresholdAlliances(Number(e.target.value)))
            }
          />
        </Form.Group>
      </Stack>
      <Form.Group controlId="battles-provider" className="py-2">
        <Form.Label>Link Provider</Form.Label>
        <Form.Select
          aria-label="Links provider"
          disabled={!battles.enabled}
          value={battles.provider}
          onChange={(e) => dispatch(setBattlesProvider(e.target.value))}
        >
          {providers
            .filter((provider) => provider.battles)
            .map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
        </Form.Select>
      </Form.Group>
    </>
  );
};

export default SettingsBattles;
