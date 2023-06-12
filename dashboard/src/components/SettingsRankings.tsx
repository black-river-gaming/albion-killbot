import ChannelInput from "components/ChannelInput";
import { RANKING_MODES } from "helpers/constants";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { capitalize } from "helpers/utils";
import { Col, Form, Row } from "react-bootstrap";
import {
  setRankingsChannel,
  setRankingsEnabled,
  setRankingsGuildRanking,
  setRankingsPvpRanking,
} from "store/settings";
import { IChannel } from "types";

interface ISettingsRankingsProps {
  channels: IChannel[];
}

const SettingsRankings = ({ channels }: ISettingsRankingsProps) => {
  const rankings = useAppSelector((state) => state.settings.rankings);
  const dispatch = useAppDispatch();

  const renderRankingModeOptions = (rankingMode: string) => {
    return (
      <option key={rankingMode} value={rankingMode}>
        {capitalize(rankingMode)}
      </option>
    );
  };

  return (
    <>
      <Form.Group controlId="rankings-enabled">
        <Form.Check
          type="switch"
          label="Enabled"
          checked={rankings.enabled}
          onChange={(e) => dispatch(setRankingsEnabled(e.target.checked))}
        />
      </Form.Group>
      <Form.Group controlId="rankings-channel" className="py-2">
        <Form.Label>Notification Channel</Form.Label>
        <ChannelInput
          aria-label="Rankings channel"
          disabled={!rankings.enabled}
          availableChannels={channels}
          value={rankings.channel}
          onChannelChange={(channelId) =>
            dispatch(setRankingsChannel(channelId))
          }
        />
      </Form.Group>
      <Row>
        <Col sm={6}>
          <Form.Group controlId="rankings-pvp-mode" className="py-2">
            <Form.Label>PvP Ranking Mode</Form.Label>
            <Form.Select
              aria-label="PvP ranking mode select"
              disabled={!rankings.enabled}
              value={rankings.pvpRanking}
              onChange={(e) => dispatch(setRankingsPvpRanking(e.target.value))}
            >
              {RANKING_MODES.map(renderRankingModeOptions)}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col sm={6}>
          <Form.Group controlId="rankings-guild-mode" className="py-2">
            <Form.Label>Guild Ranking Mode</Form.Label>
            <Form.Select
              aria-label="Guild ranking mode select"
              disabled={!rankings.enabled}
              value={rankings.guildRanking}
              onChange={(e) =>
                dispatch(setRankingsGuildRanking(e.target.value))
              }
            >
              {RANKING_MODES.map(renderRankingModeOptions)}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default SettingsRankings;
