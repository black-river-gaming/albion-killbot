import LoadError from "components/LoadError";
import Settings from "components/Settings";
import Loader from "components/common/Loader";
import ChannelInput from "components/dashboard/ChannelInput";
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
  setJuicyChannel,
  setJuicyEnabled,
  setJuicyMode,
  setJuicyProvider,
} from "store/settings";

const JuicyPage = () => {
  const { serverId = "" } = useParams();

  const dispatch = useAppDispatch();
  const constants = useFetchConstantsQuery();
  const server = useFetchServerQuery(serverId);
  const juicy = useAppSelector((state) => state.settings.juicy);
  const [dispatchTestNotification, testNotification] =
    useTestNotificationSettingsMutation();

  if (server.isFetching || constants.isFetching) return <Loader />;
  if (!server.data || !constants.data) return <LoadError />;

  const { modes, providers } = constants.data;
  const { channels } = server.data;

  return (
    <Settings>
      <Stack gap={2}>
        <Form.Group controlId="juicy-enabled">
          <Form.Check
            type="switch"
            label="Enabled"
            checked={juicy.enabled}
            onChange={(e) => dispatch(setJuicyEnabled(e.target.checked))}
          />
        </Form.Group>

        <Row className="g-2 align-items-end">
          <Col xs={12} md={true}>
            <Form.Group controlId="juicy-channel">
              <Form.Label>Notification Channel</Form.Label>
              <ChannelInput
                aria-label="Juicy kills channel"
                disabled={!juicy.enabled}
                availableChannels={channels}
                value={juicy.channel}
                onChannelChange={(channelId) =>
                  dispatch(setJuicyChannel(channelId))
                }
              />
            </Form.Group>
          </Col>
          <Col xs={12} md="auto">
            <Button
              disabled={!juicy.enabled || testNotification.isLoading}
              variant="secondary"
              type="button"
              onClick={() => {
                dispatchTestNotification({
                  serverId,
                  type: "juicy",
                  channelId: juicy.channel,
                  mode: juicy.mode,
                });
              }}
            >
              Test Notification
            </Button>
          </Col>
        </Row>

        <Form.Group controlId="juicy-mode">
          <Form.Label>Mode</Form.Label>
          <Form.Select
            aria-label="Notification mode"
            disabled={!juicy.enabled}
            value={juicy.mode}
            onChange={(e) => dispatch(setJuicyMode(e.target.value))}
          >
            {modes.map((mode) => (
              <option key={mode} value={mode}>
                {capitalize(mode)}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="juicy-provider">
          <Form.Label>Link Provider</Form.Label>
          <Form.Select
            aria-label="Links provider"
            disabled={!juicy.enabled}
            value={juicy.provider}
            onChange={(e) => dispatch(setJuicyProvider(e.target.value))}
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

export default JuicyPage;
