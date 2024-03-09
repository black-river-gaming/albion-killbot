import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import guildTags from "assets/settings/guildTags.png";
import showAttunement from "assets/settings/showAttunement.png";
import splitLootValue from "assets/settings/splitLootValue.png";
import LoadError from "components/LoadError";
import Settings from "components/Settings";
import Loader from "components/common/Loader";
import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { getLocaleName } from "helpers/utils";
import { Button, Form, OverlayTrigger, Stack, Tooltip } from "react-bootstrap";
import { useGetConstantsQuery } from "store/api";
import {
  setGeneralGuildTags,
  setGeneralLocale,
  setGeneralShowAttunement,
  setGeneralSplitLootValue,
} from "store/settings";

const SettingsPage = () => {
  const constants = useGetConstantsQuery();
  const general = useAppSelector((state) => state.settings.general);
  const dispatch = useAppDispatch();

  if (constants.isFetching) return <Loader />;
  if (!constants.data) return <LoadError />;

  const { languages } = constants.data;

  return (
    <Settings>
      <Stack gap={2}>
        <Form.Group controlId="language">
          <Form.Label>Language</Form.Label>
          <Form.Select
            aria-label="Language select"
            value={general.locale}
            onChange={(e) => dispatch(setGeneralLocale(e.target.value))}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {getLocaleName(lang)}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="showAttunement">
          <Form.Switch>
            <Form.Switch.Input
              checked={general.showAttunement}
              type="checkbox"
              onChange={(e) =>
                dispatch(setGeneralShowAttunement(e.target.checked))
              }
            />
            <Form.Switch.Label>
              <Stack
                direction="horizontal"
                gap={1}
                className="align-items-center"
              >
                <div>Show Attunement</div>
                <OverlayTrigger
                  placement="auto-end"
                  overlay={
                    <Tooltip>
                      <Stack gap={2} className="align-items-start">
                        <div>
                          Display awakened weapon attributes on kill reports
                        </div>
                        <img
                          src={showAttunement}
                          alt="Example of Show Attunement"
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
                  placement="auto-end"
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

        <Form.Group controlId="splitLootValue">
          <Form.Switch>
            <Form.Switch.Input
              checked={general.splitLootValue}
              type="checkbox"
              onChange={(e) =>
                dispatch(setGeneralSplitLootValue(e.target.checked))
              }
            />
            <Form.Switch.Label>
              <Stack
                direction="horizontal"
                gap={1}
                className="align-items-center"
              >
                <div>Split Loot Value</div>
                <OverlayTrigger
                  placement="auto-end"
                  overlay={
                    <Tooltip>
                      <Stack gap={2} className="align-items-start">
                        <div>
                          Split the loot value between gear and inventory:
                        </div>
                        <img
                          src={splitLootValue}
                          alt="Example of Split Loot"
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
    </Settings>
  );
};

export default SettingsPage;
