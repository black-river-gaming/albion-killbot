import { useEffect } from "react";
import { Accordion, Button, Col, Form, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import ChannelInput from "shared/components/ChannelInput";
import Loader from "shared/components/Loader";
import Toast from "shared/components/Toast";
import { useAppDispatch, useAppSelector } from "shared/hooks";
import { capitalize, getLocaleName } from "shared/utils";
import { useFetchServerQuery, useUpdateSettingsMutation } from "store/api";
import {
  loadSettings,
  setBattlesChannel,
  setBattlesEnabled,
  setKillsChannel,
  setKillsEnabled,
  setKillsMode,
  setLang,
  setRankingsChannel,
  setRankingsEnabled,
  setRankingsGuildRanking,
  setRankingsPvpRanking,
} from "store/settings";

const languages = ["en", "pt", "es", "fr", "ru"];
const killModes = ["image", "text"];
const rankingModes = ["off", "hourly", "daily"];

const Settings = () => {
  const { serverId = "" } = useParams();
  const server = useFetchServerQuery(serverId);
  const [dispatchUpdateSettings, updateSettings] = useUpdateSettingsMutation();
  const settings = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (server?.data?.settings) {
      dispatch(loadSettings(server.data.settings));
    }
  }, [dispatch, server.data]);

  useEffect(() => {
    setTimeout(updateSettings.reset, 5000);
  }, [updateSettings.reset, updateSettings.isSuccess, updateSettings.isError]);

  if (server.isFetching || updateSettings.isLoading) return <Loader />;
  if (!server.data || !server.data.settings)
    return (
      <div className="p-2 d-flex justify-content-center">No data found</div>
    );

  const renderLanguageOptions = (lang: string) => {
    return (
      <option key={lang} value={lang}>
        {getLocaleName(lang)}
      </option>
    );
  };

  const renderKillModeOptions = (killMode: string) => {
    return (
      <option key={killMode} value={killMode}>
        {capitalize(killMode)}
      </option>
    );
  };

  const renderRankingModeOptions = (rankingMode: string) => {
    return (
      <option key={rankingMode} value={rankingMode}>
        {capitalize(rankingMode)}
      </option>
    );
  };

  const { channels } = server.data;
  const { lang, kills, battles, rankings } = settings;

  return (
    <Form className="p-2">
      <h4 className="d-flex justify-content-center">Settings</h4>
      <Form.Group controlId="language" className="p-3">
        <Form.Label>Language</Form.Label>
        <Form.Select
          aria-label="Language select"
          value={lang}
          onChange={(e) => dispatch(setLang(e.target.value))}
        >
          {languages.map(renderLanguageOptions)}
        </Form.Select>
      </Form.Group>
      <Accordion
        alwaysOpen
        defaultActiveKey={["kills", "battles", "rankings"]}
        flush
      >
        <Accordion.Item eventKey="kills">
          <Accordion.Header>Kills </Accordion.Header>
          <Accordion.Body>
            <Form.Check
              type="checkbox"
              label="Enabled"
              checked={kills.enabled}
              onChange={(e) => dispatch(setKillsEnabled(e.target.checked))}
            />
            <Form.Group controlId="kills-channel" className="py-2">
              <Form.Label>Notification Channel</Form.Label>
              <ChannelInput
                aria-label="Kills channel"
                disabled={!kills.enabled}
                availableChannels={channels}
                value={kills.channel}
                onChannelChange={(channelId) =>
                  dispatch(setKillsChannel(channelId))
                }
              />
            </Form.Group>
            <Form.Group controlId="kills-mode" className="py-2">
              <Form.Label>Mode</Form.Label>
              <Form.Select
                aria-label="Language select"
                disabled={!kills.enabled}
                value={kills.mode}
                onChange={(e) => dispatch(setKillsMode(e.target.value))}
              >
                {killModes.map(renderKillModeOptions)}
              </Form.Select>
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="battles">
          <Accordion.Header>Battles</Accordion.Header>
          <Accordion.Body>
            <Form.Check
              type="checkbox"
              label="Enabled"
              checked={battles.enabled}
              onChange={(e) => dispatch(setBattlesEnabled(e.target.checked))}
            />
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
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="rankings">
          <Accordion.Header>Rankings</Accordion.Header>
          <Accordion.Body>
            <Form.Check
              type="checkbox"
              label="Enabled"
              checked={rankings.enabled}
              onChange={(e) => dispatch(setRankingsEnabled(e.target.checked))}
            />
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
                    onChange={(e) =>
                      dispatch(setRankingsPvpRanking(e.target.value))
                    }
                  >
                    {rankingModes.map(renderRankingModeOptions)}
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
                    {rankingModes.map(renderRankingModeOptions)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <div className="p-3">
        <div className="d-flex justify-content-end">
          <Button
            variant="secondary"
            onClick={() => {
              if (server?.data?.settings)
                dispatch(loadSettings(server.data.settings));
            }}
          >
            Reset
          </Button>
          <div className="px-2" />
          <Button
            variant="primary"
            onClick={async () => {
              await dispatchUpdateSettings({ serverId, settings });
            }}
          >
            Save
          </Button>
        </div>
      </div>

      <Toast bg="success" show={updateSettings.isSuccess}>
        Settings saved.
      </Toast>
      <Toast bg="danger" show={updateSettings.isError}>
        Failed to save settings. Please try again later.
      </Toast>
    </Form>
  );
};

export default Settings;
