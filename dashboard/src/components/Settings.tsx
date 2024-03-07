import Loader from "components/common/Loader";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import React, { ReactNode, useEffect } from "react";
import { Alert, Button, Card, Form, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useFetchServerQuery, useUpdateSettingsMutation } from "store/api";
import { loadSettings } from "store/settings";

interface PageAlert {
  show?: boolean;
  variant: string;
  message: ReactNode;
}

interface SettingsPageProps {
  alerts?: PageAlert[];
  children?: ReactNode;
}

const Settings = ({ alerts, children }: SettingsPageProps) => {
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

  if (updateSettings.isLoading) return <Loader />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatchUpdateSettings({ serverId, settings });
  };

  const renderAlert = (alert: Alert, index: number) => {
    if (alert.show !== undefined && !alert.show) return;
    return (
      <Alert key={index} variant={alert.variant}>
        {alert.message}
      </Alert>
    );
  };

  return (
    <Stack gap={2}>
      {alerts?.map(renderAlert)}
      <Card>
        <Form onSubmit={handleSubmit}>
          <Card.Body>{children}</Card.Body>

          <Card.Footer>
            <Stack
              direction="horizontal"
              gap={2}
              className="justify-content-end"
            >
              <Button
                variant="secondary"
                onClick={() => {
                  if (server?.data?.settings)
                    dispatch(loadSettings(server.data.settings));
                }}
              >
                Reset
              </Button>
              <Button variant="primary" type="submit">
                Save
              </Button>
            </Stack>
          </Card.Footer>
        </Form>
      </Card>
    </Stack>
  );
};

export default Settings;
