import ChannelInput from "components/ChannelInput";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { capitalize } from "helpers/utils";
import { Form } from "react-bootstrap";
import { useFetchConstantsQuery } from "store/api";
import {
  setKillsChannel,
  setKillsEnabled,
  setKillsMode,
  setKillsProvider,
} from "store/settings";
import { IChannel } from "types";
import Loader from "./Loader";

interface ISettingsKillsProps {
  channels: IChannel[];
}

const SettingsKills = ({ channels }: ISettingsKillsProps) => {
  const constants = useFetchConstantsQuery();
  const kills = useAppSelector((state) => state.settings.kills);
  const dispatch = useAppDispatch();

  if (constants.isFetching || !constants.data) return <Loader />;
  const { modes, providers } = constants.data;

  return (
    <>
      <Form.Group controlId="kills-enabled">
        <Form.Check
          type="switch"
          label="Enabled"
          checked={kills.enabled}
          onChange={(e) => dispatch(setKillsEnabled(e.target.checked))}
        />
      </Form.Group>
      <Form.Group controlId="kills-channel" className="py-2">
        <Form.Label>Notification Channel</Form.Label>
        <ChannelInput
          aria-label="Kills channel"
          disabled={!kills.enabled}
          availableChannels={channels}
          value={kills.channel}
          onChannelChange={(channelId) => dispatch(setKillsChannel(channelId))}
        />
      </Form.Group>
      <Form.Group controlId="kills-mode" className="py-2">
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
      <Form.Group controlId="kills-provider" className="py-2">
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
    </>
  );
};

export default SettingsKills;
