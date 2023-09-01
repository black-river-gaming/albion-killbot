import ChannelInput from "components/ChannelInput";
import LoadError from "components/LoadError";
import Loader from "components/Loader";
import Settings from "components/Settings";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { capitalize } from "helpers/utils";
import { Form, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useFetchConstantsQuery, useFetchServerQuery } from "store/api";
import {
  setKillsChannel,
  setKillsEnabled,
  setKillsMode,
  setKillsProvider,
} from "store/settings";

const KillsPage = () => {
  const { serverId = "" } = useParams();

  const constants = useFetchConstantsQuery();
  const server = useFetchServerQuery(serverId);
  const kills = useAppSelector((state) => state.settings.kills);
  const dispatch = useAppDispatch();

  if (server.isFetching || constants.isFetching) return <Loader />;
  if (!server.data || !constants.data) return <LoadError />;

  const { modes, providers } = constants.data;
  const { channels } = server.data;

  return (
    <Settings>
      <Stack gap={2}>
        <Form.Group controlId="kills-enabled">
          <Form.Check
            type="switch"
            label="Enabled"
            checked={kills.enabled}
            onChange={(e) => dispatch(setKillsEnabled(e.target.checked))}
          />
        </Form.Group>

        <Form.Group controlId="kills-channel">
          <Form.Label>Notification Channel</Form.Label>
          <ChannelInput
            aria-label="Kills channel"
            disabled={!kills.enabled}
            availableChannels={channels}
            value={kills.channel}
            onChannelChange={(channelId) =>
              dispatch(setKillsChannel(channelId))
            }
          />
        </Form.Group>

        <Form.Group controlId="kills-mode">
          <Form.Label>Mode</Form.Label>
          <Form.Select
            aria-label="Notification mode"
            disabled={!kills.enabled}
            value={kills.mode}
            onChange={(e) => dispatch(setKillsMode(e.target.value))}
          >
            {modes.map((mode) => (
              <option key={mode} value={mode}>
                {capitalize(mode)}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="kills-provider">
          <Form.Label>Link Provider</Form.Label>
          <Form.Select
            aria-label="Links provider"
            disabled={!kills.enabled}
            value={kills.provider}
            onChange={(e) => dispatch(setKillsProvider(e.target.value))}
          >
            {providers
              .filter((provider) => provider.events)
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

export default KillsPage;
