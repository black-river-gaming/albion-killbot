import styled from "styled-components";

export default styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  .content {
    flex-grow: 1;

    display: flex;

    .container {
      width: 100%;
      margin-left: auto;
      margin-right: auto;

      @media (min-width: 576px) {
        max-width: calc(100% - (576px * 0.1));
      }

      @media (min-width: 768px) {
        max-width: calc(100% - (768px * 0.2));
      }

      @media (min-width: 992px) {
        max-width: calc(100% - 992px * 0.25);
      }

      @media (min-width: 1200px) {
        max-width: calc(100% - 1200px * 0.35);
      }

      @media (min-width: 1904px) {
        max-width: calc(100% - 1904px * 0.4);
      }
    }
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

  /* Bootstrap Button overrides */
  .btn {
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

  /* Bootstart ListGroup overrides */
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

      &:hover {
        color: ${({ theme }) => theme.primary};
      }

      &.active,
      &:active {
        background-image: linear-gradient(
          rgba(255, 255, 255, 0.03),
          rgba(255, 255, 255, 0.03)
        );
      }
    }
  }
`;
