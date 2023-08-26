import ChannelInput from "components/ChannelInput";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { capitalize } from "helpers/utils";
import { Form } from "react-bootstrap";
import { useFetchConstantsQuery } from "store/api";
import {
  setDeathsChannel,
  setDeathsEnabled,
  setDeathsMode,
  setKillsProvider,
} from "store/settings";
import { IChannel } from "types";
import Loader from "./Loader";

interface ISettingsDeathsProps {
  channels: IChannel[];
}

const SettingsDeaths = ({ channels }: ISettingsDeathsProps) => {
  const constants = useFetchConstantsQuery();
  const deaths = useAppSelector((state) => state.settings.deaths);
  const dispatch = useAppDispatch();

  if (constants.isFetching || !constants.data) return <Loader />;
  const { modes, providers } = constants.data;

  return (
    <>
      <Form.Group controlId="deaths-enabled">
        <Form.Check
          type="switch"
          label="Enabled"
          checked={deaths.enabled}
          onChange={(e) => dispatch(setDeathsEnabled(e.target.checked))}
        />
      </Form.Group>
      <Form.Group controlId="deaths-channel" className="py-2">
        <Form.Label>Notification Channel</Form.Label>
        <ChannelInput
          aria-label="Deaths channel"
          disabled={!deaths.enabled}
          availableChannels={channels}
          value={deaths.channel}
          onChannelChange={(channelId) => dispatch(setDeathsChannel(channelId))}
        />
      </Form.Group>
      <Form.Group controlId="deaths-mode" className="py-2">
        <Form.Label>Mode</Form.Label>
        <Form.Select
          aria-label="Notification mode"
          disabled={!deaths.enabled}
          value={deaths.mode}
          onChange={(e) => dispatch(setDeathsMode(e.target.value))}
        >
          {modes.map((mode) => (
            <option key={mode} value={mode}>
              {capitalize(mode)}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group controlId="deaths-provider" className="py-2">
        <Form.Label>Link Provider</Form.Label>
        <Form.Select
          aria-label="Links provider"
          disabled={!deaths.enabled}
          value={deaths.provider}
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

export default SettingsDeaths;
