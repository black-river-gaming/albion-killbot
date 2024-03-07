import { faChevronDown, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CHANNEL_TYPES } from "helpers/discord";
import { useEffect, useState } from "react";
import { Form, FormControlProps } from "react-bootstrap";
import styled from "styled-components";
import { IChannel } from "types/server";
import Paper from "../Paper";

const ChannelInputDiv = styled.div`
  position: relative;

  .form-control {
    padding-right: 2.25rem;

    border-color: ${({ theme }) => theme.background};
  }

  .input-overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0.5rem;

    display: flex;
    align-items: center;

    color: black;

    .input-overlay-category {
      color: inherit;

      padding: 0 0.5rem;
      font-size: 14px;
    }

    .input-overlay-menu-icon {
      width: 15px;
      height: 15px;
      padding: 0.35rem;

      cursor: pointer;
      user-select: none;

      border-radius: 50%;
    }
  }

  .input-menu {
    position: absolute;
    left: 0;
    right: 0;

    padding: 0.5rem;
    max-height: 10.5rem;
    overflow-y: auto;

    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;

    z-index: 99;

    .input-menu-option {
      padding: 0.5rem;

      cursor: pointer;
      user-select: none;

      display: flex;
      justify-content: space-between;
      align-items: center;

      .category-name {
        font-size: 14px;
      }

      &:hover {
        color: ${({ theme }) => theme.primary};
      }
    }
  }

  &.disabled {
    .input-overlay {
      color: rgba(0, 0, 0, 0.5);

      .input-overlay-menu-icon {
        cursor: default;
        opacity: 0.5;
      }
    }
  }
`;

interface ChannelInputProps extends FormControlProps {
  availableChannels?: IChannel[];
  onChannelChange?: { (channel: string): void };
}

const ChannelInput = (props: ChannelInputProps) => {
  const {
    availableChannels = [],
    value,
    onChannelChange,
    ...formControlProps
  } = props;

  const [matchedChannels, setMatchedChannels] = useState<IChannel[]>(
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

  const setSelectedChannel = (channel?: IChannel) => {
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

  const handleMenuOptionClick = (channel: IChannel) => {
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
    <ChannelInputDiv className={formControlProps.disabled ? "disabled" : ""}>
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
    </ChannelInputDiv>
  );
};

export default ChannelInput;
