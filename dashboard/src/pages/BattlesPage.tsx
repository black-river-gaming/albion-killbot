import ChannelInput from "components/ChannelInput";
import LoadError from "components/LoadError";
import Loader from "components/Loader";
import Settings from "components/Settings";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { Form, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useFetchConstantsQuery, useFetchServerQuery } from "store/api";
import {
  setBattlesChannel,
  setBattlesEnabled,
  setBattlesProvider,
  setBattlesThresholdAlliances,
  setBattlesThresholdGuilds,
  setBattlesThresholdPlayers,
} from "store/settings";

const BattlesPage = () => {
  const { serverId = "" } = useParams();

  const constants = useFetchConstantsQuery();
  const server = useFetchServerQuery(serverId);
  const battles = useAppSelector((state) => state.settings.battles);
  const dispatch = useAppDispatch();

  if (server.isFetching || constants.isFetching) return <Loader />;
  if (!server.data || !constants.data) return <LoadError />;

  const { providers } = constants.data;
  const { channels } = server.data;

  return (
    <Settings>
      <Stack gap={2}>
        <Form.Group controlId="battles-enabled">
          <Form.Check
            type="switch"
            label="Enabled"
            checked={battles.enabled}
            onChange={(e) => dispatch(setBattlesEnabled(e.target.checked))}
          />
        </Form.Group>

        <Form.Group controlId="battles-channel">
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
          className="justify-content-between"
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

        <Form.Group controlId="battles-provider">
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
      </Stack>
    </Settings>
  );
};

export default BattlesPage;
