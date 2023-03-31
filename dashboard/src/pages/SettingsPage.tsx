import Loader from "components/Loader";
import SettingsBattles from "components/SettingsBattles";
import SettingsDeaths from "components/SettingsDeaths";
import SettingsGeneral from "components/SettingsGeneral";
import SettingsKills from "components/SettingsKills";
import SettingsRankings from "components/SettingsRankings";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { useEffect } from "react";
import { Button, Card, Form, Tab, Tabs } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useFetchServerQuery, useUpdateSettingsMutation } from "store/api";
import { loadSettings } from "store/settings";

const SettingsPage = () => {
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

  if (server.isFetching || updateSettings.isLoading) return <Loader />;
  if (!server.data || !server.data.settings)
    return (
      <div className="p-2 d-flex justify-content-center">No data found</div>
    );

  const { channels } = server.data;

  return (
    <Card>
      <Form
        onSubmit={async () => {
          await dispatchUpdateSettings({ serverId, settings });
        }}
      >
        <Tabs fill={true}>
          <Tab eventKey="general" title="General" className="p-3">
            <SettingsGeneral />
          </Tab>

          <Tab eventKey="kills" title="Kills" className="p-3">
            <SettingsKills channels={channels} />
          </Tab>

          <Tab eventKey="deaths" title="Deaths" className="p-3">
            <SettingsDeaths channels={channels} />
          </Tab>

          <Tab eventKey="battles" title="Battles" className="p-3">
            <SettingsBattles channels={channels} />
          </Tab>

          <Tab eventKey="rankings" title="Rankings" className="p-3">
            <SettingsRankings channels={channels} />
          </Tab>
        </Tabs>

        <div className="p-3 pt-0 d-flex justify-content-end">
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
          <Button variant="primary" type="submit">
            Save
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default SettingsPage;
