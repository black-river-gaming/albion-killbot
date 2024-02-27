import ChannelInput from "components/ChannelInput";
import LoadError from "components/LoadError";
import Settings from "components/Settings";
import Loader from "components/common/Loader";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { capitalize } from "helpers/utils";
import { Button, Col, Form, Row, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
  useFetchConstantsQuery,
  useFetchServerQuery,
  useTestNotificationSettingsMutation,
} from "store/api";
import {
  setDeathsChannel,
  setDeathsEnabled,
  setDeathsMode,
  setDeathsProvider,
} from "store/settings";

const DeathsPage = () => {
  const { serverId = "" } = useParams();

  const dispatch = useAppDispatch();
  const constants = useFetchConstantsQuery();
  const server = useFetchServerQuery(serverId);
  const deaths = useAppSelector((state) => state.settings.deaths);
  const [dispatchTestNotification, testNotification] =
    useTestNotificationSettingsMutation();

  if (server.isFetching || constants.isFetching) return <Loader />;
  if (!server.data || !constants.data) return <LoadError />;

  const { modes, providers } = constants.data;
  const { channels } = server.data;

  return (
    <Settings>
      <Stack gap={2}>
        <Form.Group controlId="deaths-enabled">
          <Form.Check
            type="switch"
            label="Enabled"
            checked={deaths.enabled}
            onChange={(e) => dispatch(setDeathsEnabled(e.target.checked))}
          />
        </Form.Group>

        <Row className="g-2 align-items-end">
          <Col xs={12} md={true}>
            <Form.Group controlId="deaths-channel">
              <Form.Label>Notification Channel</Form.Label>
              <ChannelInput
                aria-label="Deaths channel"
                disabled={!deaths.enabled}
                availableChannels={channels}
                value={deaths.channel}
                onChannelChange={(channelId) =>
                  dispatch(setDeathsChannel(channelId))
                }
              />
            </Form.Group>
          </Col>
          <Col xs={12} md="auto">
            <Button
              disabled={!deaths.enabled || testNotification.isLoading}
              variant="secondary"
              type="button"
              onClick={() => {
                dispatchTestNotification({
                  serverId,
                  type: "deaths",
                  channelId: deaths.channel,
                  mode: deaths.mode,
                });
              }}
            >
              Test Notification
            </Button>
          </Col>
        </Row>

        <Form.Group controlId="deaths-mode">
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

        <Form.Group controlId="deaths-provider">
          <Form.Label>Link Provider</Form.Label>
          <Form.Select
            aria-label="Links provider"
            disabled={!deaths.enabled}
            value={deaths.provider}
            onChange={(e) => dispatch(setDeathsProvider(e.target.value))}
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

export default DeathsPage;
