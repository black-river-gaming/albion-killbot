import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import goodKill from "assets/settings/goodKill.png";
import insaneKill from "assets/settings/insaneKill.png";
import LoadError from "components/LoadError";
import Settings from "components/Settings";
import Loader from "components/common/Loader";
import ChannelInput from "components/dashboard/ChannelInput";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { isSubscriptionActive } from "helpers/subscriptions";
import { capitalize } from "helpers/utils";
import {
  Button,
  Col,
  Form,
  OverlayTrigger,
  Row,
  Stack,
  Tooltip,
} from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import {
  useFetchServerQuery,
  useGetConstantsQuery,
  useTestNotificationSettingsMutation,
} from "store/api";
import { useGetServerSubscriptionQuery } from "store/api/server";
import {
  setJuicyChannel,
  setJuicyEnabled,
  setJuicyMode,
  setJuicyProvider,
} from "store/settings";

const JuicyPage = () => {
  const { serverId = "" } = useParams();
  const dispatch = useAppDispatch();

  const constants = useGetConstantsQuery();
  const server = useFetchServerQuery(serverId);
  const subscription = useGetServerSubscriptionQuery({ serverId });

  const juicy = useAppSelector((state) => state.settings.juicy);
  const [dispatchTestNotification, testNotification] =
    useTestNotificationSettingsMutation();

  if (server.isFetching || constants.isFetching || subscription.isFetching) {
    return <Loader />;
  }

  if (!server.data || !constants.data) {
    return <LoadError />;
  }

  const { modes, providers } = constants.data;
  const { channels } = server.data;

  const isPremium =
    subscription.data && isSubscriptionActive(subscription.data);

  return (
    <Settings
      alerts={[
        {
          show: !isPremium,
          variant: "danger",
          message: (
            <>
              This is a Premium feature. To enable, please check the
              <Link to="/premium"> Premium</Link> page to buy assign a
              subscription.
            </>
          ),
        },
      ]}
    >
      <Stack gap={2}>
        {constants.data.servers.map((server) => (
          <Form.Group controlId={`juicy-enabled-${server.id}`}>
            <Form.Check
              type="switch"
              label={server.name}
              checked={juicy.enabled[server.id]}
              disabled={!isPremium}
              onChange={(e) =>
                dispatch(
                  setJuicyEnabled({
                    serverId: server.id,
                    enabled: e.target.checked,
                  })
                )
              }
            />
          </Form.Group>
        ))}

        <Row className="g-2 align-items-end">
          <Col xs={12} md={true}>
            <Form.Group controlId="good-channel">
              <Form.Label>
                <Stack direction="horizontal" gap={1}>
                  <div>Good Kills Notification Channel</div>
                  <OverlayTrigger
                    placement="auto-end"
                    overlay={
                      <Tooltip>
                        <Stack gap={2} className="align-items-center">
                          <pre>
                            Good Kills are kills whose the loot is worth a
                            certain threshold.
                            <br />
                            (Roughly around ~15m)
                          </pre>
                          <img
                            src={goodKill}
                            alt="Example of Good Kill"
                            style={{ borderRadius: "0.2rem" }}
                          />
                        </Stack>
                      </Tooltip>
                    }
                  >
                    <Button className="btn-icon" variant="secondary" size="sm">
                      <FontAwesomeIcon icon={faQuestionCircle} />
                    </Button>
                  </OverlayTrigger>
                </Stack>
              </Form.Label>
              <ChannelInput
                aria-label="Good kills notification channel"
                disabled={!isPremium}
                availableChannels={channels}
                value={juicy.good.channel}
                onChannelChange={(channelId) =>
                  dispatch(
                    setJuicyChannel({ type: "good", channel: channelId })
                  )
                }
              />
            </Form.Group>
          </Col>
          <Col xs={12} md="auto">
            <Button
              disabled={!isPremium || testNotification.isLoading}
              variant="secondary"
              type="button"
              onClick={() => {
                dispatchTestNotification({
                  serverId,
                  type: "good",
                  channelId: juicy.good.channel,
                  mode: juicy.mode,
                });
              }}
            >
              Test Notification
            </Button>
          </Col>
        </Row>

        <Row className="g-2 align-items-end">
          <Col xs={12} md={true}>
            <Form.Group controlId="insane-channel">
              <Form.Label>
                <Stack direction="horizontal" gap={1}>
                  <div>Insane Kills Notification Channel</div>
                  <OverlayTrigger
                    placement="auto-end"
                    overlay={
                      <Tooltip>
                        <Stack gap={2} className="align-items-center">
                          <pre>
                            Insane kills are the most expensible kills on the
                            entire server!
                            <br />
                            The loot value has no limits but is expected to be
                            at least ~30m
                          </pre>
                          <img
                            src={insaneKill}
                            alt="Example of Insane Kill"
                            style={{ borderRadius: "0.2rem" }}
                          />
                        </Stack>
                      </Tooltip>
                    }
                  >
                    <Button className="btn-icon" variant="secondary" size="sm">
                      <FontAwesomeIcon icon={faQuestionCircle} />
                    </Button>
                  </OverlayTrigger>
                </Stack>
              </Form.Label>
              <ChannelInput
                aria-label="Insane kills notification channel"
                disabled={!isPremium}
                availableChannels={channels}
                value={juicy.insane.channel}
                onChannelChange={(channelId) =>
                  dispatch(
                    setJuicyChannel({ type: "insane", channel: channelId })
                  )
                }
              />
            </Form.Group>
          </Col>
          <Col xs={12} md="auto">
            <Button
              disabled={!isPremium || testNotification.isLoading}
              variant="secondary"
              type="button"
              onClick={() => {
                dispatchTestNotification({
                  serverId,
                  type: "insane",
                  channelId: juicy.insane.channel,
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
            disabled={!isPremium}
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
            disabled={!isPremium}
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
