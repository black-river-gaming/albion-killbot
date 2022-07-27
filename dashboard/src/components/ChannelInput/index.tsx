import { faChevronDown, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CHANNEL_TYPES } from "helpers/discord";
import { useEffect, useState } from "react";
import { Form, FormControlProps } from "react-bootstrap";
import { Channel } from "store/api";
import Paper from "../Paper";
import StyledChannelInput from "./styles";

interface ChannelInputProps extends FormControlProps {
  availableChannels: Channel[];
  onChannelChange?: { (channel: string): void };
}

const ChannelInput = (props: ChannelInputProps) => {
  const { availableChannels, value, onChannelChange, ...formControlProps } =
    props;

  const [matchedChannels, setMatchedChannels] = useState<Channel[]>(
    availableChannels.filter((channel) => channel.type === CHANNEL_TYPES.TEXT)
  );
  const [inputText, setInputText] = useState("");
  const [category, setCategory] = useState("");
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    const channel = availableChannels.find((c) => c.id === value);
    if (channel) {
      setInputText(`#${channel.name}`);
    }
    if (channel?.parentId) {
      setCategory(
        availableChannels.find((c) => c.id === channel.parentId)?.name || ""
      );
    }
  }, [value, availableChannels]);

  const setSelectedChannel = (channel?: Channel) => {
    setInputText(channel ? `#${channel.name}` : ``);
    if (channel?.parentId) {
      setCategory(
        availableChannels.find((c) => c.id === channel.parentId)?.name || ""
      );
    } else {
      setCategory("");
    }

    setShowComplete(false);
    if (onChannelChange) onChannelChange(channel?.id || "");
  };

  const handleInputChange = (value: string) => {
    setInputText(value);
    setMatchedChannels(
      availableChannels.filter(
        (channel) =>
          channel.name.includes(value.replace(/^#/, "")) &&
          channel.type === CHANNEL_TYPES.TEXT
      )
    );
    setShowComplete(true);
  };

  const handleMenuClick = () => {
    if (formControlProps.disabled) return;
    setShowComplete(!showComplete);
  };

  const handleClearClick = () => {
    if (formControlProps.disabled) return;
    setSelectedChannel();
  };

  const handleMenuOptionClick = (channel: Channel) => {
    if (formControlProps.disabled) return;
    setSelectedChannel(channel);
  };

  const renderComplete = () => {
    return (
      <Paper elevation={6} className="input-menu">
        {matchedChannels.map((channel) => {
          const category = availableChannels.find(
            (c) => c.id === channel.parentId
          );

          return (
            <div
              key={channel.id}
              className="input-menu-option"
              onClick={() => handleMenuOptionClick(channel)}
            >
              <div>#{channel.name}</div>
              <div className="category-name">{category?.name}</div>
            </div>
          );
        })}
      </Paper>
    );
  };

  return (
    <StyledChannelInput className={formControlProps.disabled ? "disabled" : ""}>
      <Form.Control
        type="text"
        {...formControlProps}
        value={inputText}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      <div className="input-overlay">
        {category && <span className="input-overlay-category">{category}</span>}
        {inputText && (
          <FontAwesomeIcon
            className="input-overlay-menu-icon"
            icon={faClose}
            onClick={() => handleClearClick()}
          />
        )}
        <FontAwesomeIcon
          className="input-overlay-menu-icon"
          icon={faChevronDown}
          onClick={() => handleMenuClick()}
        />
      </div>
      {showComplete && renderComplete()}
    </StyledChannelInput>
  );
};

export default ChannelInput;
