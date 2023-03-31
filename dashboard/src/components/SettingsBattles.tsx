import ChannelInput from "components/ChannelInput";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { Form } from "react-bootstrap";
import { setBattlesChannel, setBattlesEnabled } from "store/settings";
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
    </>
  );
};

export default SettingsBattles;
