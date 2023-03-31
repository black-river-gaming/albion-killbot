import ChannelInput from "components/ChannelInput";
import { KILL_MODES } from "helpers/constants";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { capitalize } from "helpers/utils";
import { Form } from "react-bootstrap";
import { setKillsChannel, setKillsEnabled, setKillsMode } from "store/settings";
import { IChannel } from "types";

interface ISettingsKillsProps {
  channels: IChannel[];
}

const SettingsKills = ({ channels }: ISettingsKillsProps) => {
  const kills = useAppSelector((state) => state.settings.kills);
  const dispatch = useAppDispatch();

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

export default SettingsKills;
