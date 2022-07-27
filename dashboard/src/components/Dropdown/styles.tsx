import { Dropdown } from "react-bootstrap";
import styled from "styled-components";

const StyledDropdown = styled(Dropdown)`
  .dropdown-menu {
    overflow: hidden;

    &.show {
      animation-duration: 0.5s;
      animation-timing-function: ease-in-out;
      animation-name: slideDown;
    }
  }

  .dropdown-menu-dark {
    background-color: ${({ theme }) => theme.background};
    border-radius: 10px;

    .dropdown-item {
      transition: color 0.25s ease-in-out;

      &.active {
        background-color: transparent;
      }

      &:hover {
        background-color: transparent;
        color: ${({ theme }) => theme.primary};
      }
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-1rem);
      opacity: 0;
    }

    to {
      transform: translateY(0rem);
      opacity: 1;
    }
  }
`;

export default StyledDropdown;
