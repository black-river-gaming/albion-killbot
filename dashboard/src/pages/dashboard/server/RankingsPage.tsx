import LoadError from "components/LoadError";
import Settings from "components/Settings";
import Loader from "components/common/Loader";
import ChannelInput from "components/dashboard/ChannelInput";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { getFrequency } from "helpers/utils";
import { Button, Col, Form, Row, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
  useFetchConstantsQuery,
  useFetchServerQuery,
  useTestNotificationSettingsMutation,
} from "store/api";
import {
  setRankingsChannel,
  setRankingsDaily,
  setRankingsEnabled,
  setRankingsMonthly,
  setRankingsWeekly,
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
          <Col xs={12}>
            <Form.Group controlId="rankings-daily">
              <Form.Label>Daily PvP Ranking</Form.Label>
              <Form.Select
                aria-label="Daily PvP ranking mode select"
                disabled={!rankings.enabled}
                value={rankings.daily}
                onChange={(e) => dispatch(setRankingsDaily(e.target.value))}
              >
                {rankingModes.map((rankingMode) => (
                  <option key={rankingMode} value={rankingMode}>
                    {getFrequency(rankingMode)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group controlId="rankings-weekly">
              <Form.Label>Weekly PvP Ranking</Form.Label>
              <Form.Select
                aria-label="Weekly PvP ranking mode select"
                disabled={!rankings.enabled}
                value={rankings.weekly}
                onChange={(e) => dispatch(setRankingsWeekly(e.target.value))}
              >
                {rankingModes.map((rankingMode) => (
                  <option key={rankingMode} value={rankingMode}>
                    {getFrequency(rankingMode)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group controlId="rankings-monthly">
              <Form.Label>Monthly PvP Ranking</Form.Label>
              <Form.Select
                aria-label="Monthly PvP ranking mode select"
                disabled={!rankings.enabled}
                value={rankings.monthly}
                onChange={(e) => dispatch(setRankingsMonthly(e.target.value))}
              >
                {rankingModes.map((rankingMode) => (
                  <option key={rankingMode} value={rankingMode}>
                    {getFrequency(rankingMode)}
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
