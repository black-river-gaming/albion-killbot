import ChannelInput from "components/ChannelInput";
import { KILL_MODES } from "helpers/constants";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { capitalize } from "helpers/utils";
import { Form } from "react-bootstrap";
import {
  setDeathsChannel,
  setDeathsEnabled,
  setDeathsMode,
} from "store/settings";
import { IChannel } from "types";

interface ISettingsDeathsProps {
  channels: IChannel[];
}

const SettingsDeaths = ({ channels }: ISettingsDeathsProps) => {
  const deaths = useAppSelector((state) => state.settings.deaths);
  const dispatch = useAppDispatch();

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
          {KILL_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {capitalize(mode)}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </>
  );
};

export default SettingsDeaths;
