import chevronUp from "assets/chevron-up-solid.svg";
import { ThemeProps } from "helpers/theme";
import { createGlobalStyle } from "styled-components";

const globalStyle = createGlobalStyle<{ theme: ThemeProps }>`
  :root {
    --bs-primary: ${({ theme }) => theme.primary};
    --bs-secondary: ${({ theme }) => theme.secondary};
    --bs-danger: ${({ theme }) => theme.danger};

    --bs-primary-rgb: ${({ theme }) => theme.rgb?.primary};
    --bs-secondary-rgb: ${({ theme }) => theme.rgb?.secondary};
    --bs-danger-rgb: ${({ theme }) => theme.rgb?.danger};
  }

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

  *:focus {
    box-shadow: 0 0 0 0.15rem ${({ theme }) => theme.primary}7c !important;
    outline: none;
    transition: 0.25s ease-in-out box-shadow !important;
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

  .id-text {
    font-size: 10px;
    line-height: 10px;
    color: ${({ theme }) => theme.mutedText};
  }

  .cancelled-text {
    font-size: 12px;
    padding-left: 0.25rem;
    font-weight: 500;
    color: ${({ theme }) => theme.danger};
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
    border-radius: 0.5rem;

      a {
        color: ${({ theme }) => theme.contrastText};
        font-weight: 500;

        &:hover {
          color: ${({ theme }) => theme.primary};
        }
      }
  }
  
  /* Bootstrap Badge overrides */
  .badge {
    user-select: none;

    ${({ theme }) =>
      Object.keys(theme.servers).map((server) => ({
        [`&.bg-${server.toLowerCase().replace(" ", "-")}`]: {
          backgroundColor: theme.servers[server],
        },
      }))}
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
    border-radius: 0.5rem;
    color: ${({ theme }) => theme.text};

    .card-header {
      background: none;
      padding-top: 0.7rem;
      padding-bottom: 0.7rem;

      font-size: 1.15rem;
      font-weight: 500;
    }

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

      &:first-child {
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
      }

      &:last-child {
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
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

      &.list-group-item-secondary {
        color: ${({ theme }) => theme.text};
        background-color: ${({ theme }) => theme.secondary};

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

      .modal-body {
      background-image: linear-gradient(
        rgba(255, 255, 255, 0.05),
        rgba(255, 255, 255, 0.05)
      );
      }
    }
  }

  /* Bootstrap Pagination overrides */
  .pagination {
    margin: 0;

    display: flex;
    justify-content: center;
    flex-flow: row wrap;

    .page-item {
      color: ${({ theme }) => theme.text};

      background-color: ${({ theme }) => theme.background};
      background-image: linear-gradient(
        rgba(255, 255, 255, 0.09),
        rgba(255, 255, 255, 0.09)
      );
      box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%),
        0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);

      min-width: 2.7rem;

      display: flex;
      justify-content: center;
      align-items: center;

      border-radius: 0.5rem;

      &:not(:last-child) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right-width: 0px;

        .page-link {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
      }

      &:not(:first-child) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left-width: 0px;

        .page-link {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
      }

      &.active {
        .page-link {
          background-image: linear-gradient(
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.05)
          );

          color: ${({ theme }) => theme.primary};

          z-index: 1;
        }
      }

      .page-link {
        border: 1px solid ${({ theme }) => theme.background}77;
        border-radius: 0.5rem;

        background: inherit;
        color:  ${({ theme }) => theme.text};

        cursor: pointer;
        user-select: none;
        user-drag: none;

        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          border: none;
          color: ${({ theme }) => theme.primary};
        }

      }
    }
  }

  /* Bootstrap Tabs overrides */
  .nav-tabs {
    border-bottom: 1px solid;
    border-color: ${({ theme }) => theme.background}77;

    .nav-item {
      .nav-link {
        border: none;
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        color:  ${({ theme }) => theme.text};
        margin-bottom: 0;

        &.active {
          background: none;
          background-image: linear-gradient(
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.05)
          );
        }

        &:hover {
          border: none;
          color: ${({ theme }) => theme.primary};
        }
      }
    }
  }

  /* Bootstrap Toast overrides */
  .toast-container {
    position: fixed;
    left: 0;
    bottom: 1rem;

    transform: translateX(calc(50vw - 50%));

    z-index: 1100;
  }

  .toast {
    animation: 1s slideUp ease-in-out;

    .toast-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      color: ${({ theme }) => theme.background}
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(1rem);
      opacity: 0;
    }

    to {
      transform: translateY(0rem);
      opacity: 1;
    }
  }
`;

export default globalStyle;
