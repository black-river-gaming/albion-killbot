import ChannelInput from "components/ChannelInput";
import LoadError from "components/LoadError";
import Loader from "components/Loader";
import Settings from "components/Settings";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { capitalize } from "helpers/utils";
import { Button, Col, Form, Row, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useFetchConstantsQuery, useFetchServerQuery, useTestNotificationSettingsMutation } from "store/api";
import {
  setRankingsChannel,
  setRankingsEnabled,
  setRankingsGuildRanking,
  setRankingsPvpRanking,
} from "store/settings";

const RankingsPage = () => {
  const { serverId = "" } = useParams();

  const dispatch = useAppDispatch();
  const constants = useFetchConstantsQuery();
  const server = useFetchServerQuery(serverId);
  const rankings = useAppSelector((state) => state.settings.rankings);
  const [dispatchTestNotification, testNotification] =
    useTestNotificationSettingsMutation();

  if (server.isFetching || constants.isFetching) return <Loader />;
  if (!server.data || !constants.data) return <LoadError />;

  const { rankingModes } = constants.data;
  const { channels } = server.data;

  return (
    <Settings>
      <Stack gap={2}>
        <Form.Group controlId="rankings-enabled">
          <Form.Check
            type="switch"
            label="Enabled"
            checked={rankings.enabled}
            onChange={(e) => dispatch(setRankingsEnabled(e.target.checked))}
          />
        </Form.Group>

        <Row className="g-2 align-items-end">
          <Col xs={12} md={true}>
            <Form.Group controlId="rankings-channel">
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
          </Col>
          <Col xs={12} md="auto">
            <Button
              disabled={!rankings.enabled || testNotification.isLoading}
              variant="secondary"
              type="button"
              onClick={() => {
                dispatchTestNotification({
                  serverId,
                  type: "rankings",
                  channelId: rankings.channel,
                });
              }}
            >
              Test Notification
            </Button>
          </Col>
        </Row>

        <Row className="gy-2">
          <Col sm={6}>
            <Form.Group controlId="rankings-pvp-mode">
              <Form.Label>PvP Ranking Mode</Form.Label>
              <Form.Select
                aria-label="PvP ranking mode select"
                disabled={!rankings.enabled}
                value={rankings.pvpRanking}
                onChange={(e) =>
                  dispatch(setRankingsPvpRanking(e.target.value))
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

          <Col sm={6}>
            <Form.Group controlId="rankings-guild-mode">
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
      </Stack>
    </Settings>
  );
};

export default RankingsPage;
