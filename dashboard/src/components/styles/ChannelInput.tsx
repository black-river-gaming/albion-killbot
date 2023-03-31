import styled from "styled-components";

const StyledChannelInput = styled.div`
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

export default StyledChannelInput;
