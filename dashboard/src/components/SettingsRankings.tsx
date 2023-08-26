import ChannelInput from "components/ChannelInput";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { capitalize } from "helpers/utils";
import { Col, Form, Row } from "react-bootstrap";
import { useFetchConstantsQuery } from "store/api";
import {
  setRankingsChannel,
  setRankingsEnabled,
  setRankingsGuildRanking,
  setRankingsPvpRanking,
} from "store/settings";
import { IChannel } from "types";
import Loader from "./Loader";

interface ISettingsRankingsProps {
  channels: IChannel[];
}

const SettingsRankings = ({ channels }: ISettingsRankingsProps) => {
  const constants = useFetchConstantsQuery();
  const rankings = useAppSelector((state) => state.settings.rankings);
  const dispatch = useAppDispatch();

  if (constants.isFetching || !constants.data) return <Loader />;
  const { rankingModes } = constants.data;

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
              {rankingModes.map((rankingMode) => (
                <option key={rankingMode} value={rankingMode}>
                  {capitalize(rankingMode)}
                </option>
              ))}
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
              {rankingModes.map((rankingMode) => (
                <option key={rankingMode} value={rankingMode}>
                  {capitalize(rankingMode)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default SettingsRankings;
