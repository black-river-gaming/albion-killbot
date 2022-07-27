import chevronUp from "assets/chevron-up-solid.svg";
import { ThemeProps } from "helpers/theme";
import { createGlobalStyle } from "styled-components";

const globalStyle = createGlobalStyle<{ theme: ThemeProps }>`
  html,
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow: overlay
  }
  
  .fill {
    width: 100%;
    height: 100%;
  }

  .fullscreen {
    width: 100vw;
    height: 100vh;
  }

  .rounded {
    border-radius: 0.75rem;
  }

  .s-1 {
    width: 1rem;
    height: 1rem;
  }

  .s-2 {
    width: 1.5rem;
    height: 1.5rem;
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 0.5rem;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.primary}aa;
    border: 2px solid ${({ theme }) => theme.primary}cc;
    border-radius: 0.25rem;
  }

  ::-webkit-scrollbar-button {
    display: none;
  }

  a {
    color: ${({ theme }) => theme.text};
    transition: color 0.25s ease-in-out;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      color: ${({ theme }) => theme.primary};
    }

    &.btn {
      background-color: ${({ theme }) => theme.secondary};
      border: none;
    }
  }

  .paper {
    background-image: linear-gradient(
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.05)
    );

    box-shadow: rgb(0 0 0 / 20%) 0px 2px 1px -1px,
      rgb(0 0 0 / 14%) 0px 1px 1px 0px, rgb(0 0 0 / 12%) 0px 1px 3px 0px;
  }

  /* Bootstrap Accordion overrides */
  .accordion {
    .accordion-item {
      background-color: inherit;
      color: inherit;
      border: 0;

      &:focus {
        border-color: ${({ theme }) => theme.primary};
        box-shadow: 0 0 0 0.25rem ${({ theme }) => theme.primary}1c;
      }

      .accordion-header {
        background-color: inherit;
        border-radius: 0.75rem;
        color: ${({ theme }) => theme.primary};
        font-weight: 500;

        &:hover {
          background-image: linear-gradient(
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.05)
          );
        }

        .accordion-button {
          background-color: inherit;
          box-shadow: none;
          color: ${({ theme }) => theme.primary};
          font-weight: inherit;

          ::after {
            background-color: ${({ theme }) => theme.primary};
            content: "";
            mask: url(${chevronUp}) no-repeat 50% 50%;
            mask-size: cover;
            background-image: none;
          }

          &:focus-visible {
            border-color: ${({ theme }) => theme.primary};
            box-shadow: 0 0 0 0.25rem ${({ theme }) => theme.primary}1c;
          }
        }
      }

      .accordion-collapse {
        .accordion-body {
          padding: 0rem 0.75rem;
        }
      }
    }
  }

  /* Bootstrap Alert overrides */
  .alert {
    border-radius: 0.75rem;

      a {
        color: ${({ theme }) => theme.contrastText};
        font-weight: 500;

        &:hover {
          color: ${({ theme }) => theme.primary};
        }
      }
  }

  /* Bootstrap Button overrides */
  .btn {
    display: flex;
    justify-content: center;
    align-items: center;

    &.btn-icon {
      border-radius: 50%;
      width: 2rem;
      height: 2rem;
    }

    &.btn-primary {
      color: ${({ theme }) => theme.text};
      background-color: ${({ theme }) => theme.primary};
      border-color: ${({ theme }) => theme.primary};

      &:focus {
        box-shadow: 0 0 0 0.25rem ${({ theme }) => theme.primary}1a;
      }
    }

    &.btn-secondary {
      color: ${({ theme }) => theme.text};
      background-color: ${({ theme }) => theme.secondary};
      border-color: ${({ theme }) => theme.secondary};

      &:focus {
        box-shadow: 0 0 0 0.25rem ${({ theme }) => theme.secondary}1a;
      }
    }

    svg {
      &:not(:only-child) {
        padding: 0rem 0.5rem;
      }

      &:first-child {
        padding-left: 0;
      }

      &:last-child {
        padding-right: 0;
      }
    }
  }

  /* Bootstrap Button Group overrides */
  .btn-group {
    .btn:not(:first-child):not(.dropdown-toggle) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;

      border-left: 1px solid ${({ theme }) => theme.text}2f;
    }

    .btn:not(:last-child):not(.dropdown-toggle) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;

      border-right: 1px solid ${({ theme }) => theme.text}2f;
    }
  }

  /* Bootstrap Card overrides */
  .card {
    background-color: ${({ theme }) => theme.background};
    background-image: linear-gradient(
      rgba(255, 255, 255, 0.09),
      rgba(255, 255, 255, 0.09)
    );
    box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%),
      0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
    border-radius: 0.6rem;
    color: ${({ theme }) => theme.text};

    .list-group {
      border-radius: inherit;
      background-color: transparent;
      background-image: none;
      box-shadow: none;
    }
  }

  /* Bootstrap Form overrides */
  form {
    label.form-label {
      margin: 0;
      padding-left: 0.5rem;
      padding-right: 0.65rem;
      border-top-right-radius: 0.5rem;

      font-size: 14px;

      background-color: ${({ theme }) => theme.background};
      background-image: linear-gradient(
        rgba(255, 255, 255, 0.05),
        rgba(255, 255, 255, 0.05)
      );
      color: ${({ theme }) => theme.text};
    }

    select.form-select {
      background-size: 16px 16px;
      border-color: ${({ theme }) => theme.background};
      outline: none;

      &:disabled {
        opacity: 0.8;
        color: rgba(0, 0, 0, 0.5);
        background-color: rgba(255, 255, 255, 0.7);
      }

      &:focus {
        border-color: ${({ theme }) => theme.primary};
        box-shadow: 0 0 0 0.25rem ${({ theme }) => theme.primary}1c;
      }
    }

    input.form-check-input,
    input.form-control {
      color: ${({ theme }) => theme.contrastText};

      &:disabled {
        opacity: 0.8;
        color: rgba(0, 0, 0, 0.5);
        background-color: rgba(255, 255, 255, 0.7);
      }

      &:checked {
        border-color: ${({ theme }) => theme.primary};
        background-color: ${({ theme }) => theme.primary};
      }

      &:focus {
        border-color: ${({ theme }) => theme.primary};
        box-shadow: 0 0 0 0.25rem ${({ theme }) => theme.primary}1c;
      }
    }
  }

  /* Bootstrap ListGroup overrides */
  .list-group {
    background-color: ${({ theme }) => theme.background};
    background-image: linear-gradient(
      rgba(255, 255, 255, 0.09),
      rgba(255, 255, 255, 0.09)
    );
    box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%),
      0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
    border-radius: 0.75rem;
    color: ${({ theme }) => theme.text};

    .list-group-item {
      background-color: inherit;
      color: inherit;
      border: 0px solid ${({ theme }) => theme.background}77;
      margin: 0;

      a {
        background-color: inherit;
        color: inherit;
      }

      &:not(:last-child) {
        border-bottom-width: 1px;
      }

      &.list-group-item-action {
        &:hover {
          color: ${({ theme }) => theme.primary};
        }

        &.active,
        &:active {
          background-image: linear-gradient(
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.05)
          );
        }
      }

      &.list-group-item-primary {
        color: ${({ theme }) => theme.text};
        background-color: ${({ theme }) => theme.primary};

        &.list-group-item-action {
          &:hover {
            color: ${({ theme }) => theme.contrastText};
          }
        }
      }
    }
  }

  /* Bootstrap Modal overrides */
  .modal-dialog {
    .modal-content {
      background-color: ${({ theme }) => theme.background};
      background-image: linear-gradient(
        rgba(255, 255, 255, 0.11),
        rgba(255, 255, 255, 0.11)
      );
      color: ${({ theme }) => theme.text};

      .modal-header,
      .modal-body,
      .modal-footer {
        border-color: ${({ theme }) => theme.background}66;
      }
    }
  }
`;

export default globalStyle;
