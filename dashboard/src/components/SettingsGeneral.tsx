import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import guildTags from "assets/settings/guildTags.png";
import { LANGUAGES } from "helpers/constants";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { getLocaleName } from "helpers/utils";
import { Button, Form, OverlayTrigger, Stack, Tooltip } from "react-bootstrap";
import { setGeneralGuildTags, setGeneralLocale } from "store/settings";

const SettingsGeneral = () => {
  const general = useAppSelector((state) => state.settings.general);
  const dispatch = useAppDispatch();

  const renderLanguageOptions = (lang: string) => {
    return (
      <option key={lang} value={lang}>
        {getLocaleName(lang)}
      </option>
    );
  };

  return (
    <Stack gap={2}>
      <Form.Group controlId="language">
        <Form.Label>Language</Form.Label>
        <Form.Select
          aria-label="Language select"
          value={general.locale}
          onChange={(e) => dispatch(setGeneralLocale(e.target.value))}
        >
          {LANGUAGES.map(renderLanguageOptions)}
        </Form.Select>
      </Form.Group>

      <Form.Group controlId="guildTags">
        <Form.Switch>
          <Form.Switch.Input
            checked={general.guildTags}
            type="checkbox"
            onChange={(e) => dispatch(setGeneralGuildTags(e.target.checked))}
          />
          <Form.Switch.Label>
            <Stack
              direction="horizontal"
              gap={1}
              className="align-items-center"
            >
              <div>Show Guild Tags</div>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip>
                    <Stack gap={2} className="align-items-start">
                      <div>When bot mentions a player, show the guild:</div>
                      <img
                        src={guildTags}
                        alt="Example of Guild Tags"
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
          </Form.Switch.Label>
        </Form.Switch>
      </Form.Group>
    </Stack>
  );
};

export default SettingsGeneral;
