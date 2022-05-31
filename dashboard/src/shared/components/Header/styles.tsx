import styled from "styled-components";

const Container = styled.div`
  color: ${({ theme }) => theme.text};

  nav {
    padding: 0rem 4rem;

    &.navbar-expand-lg {
      justify-content: space-between;
    }

    .logo {
      width: auto;
      height: 5rem;
      max-width: 100%;
    }

    .navbar-items {
      flex-basis: 100%;
      display: flex;
      align-items: center;
      justify-content: end;

      .navbar-link:not(.btn),
      svg.loader {
        padding: 0 1.5rem;
        display: flex;
        align-items: center;

        img,
        svg {
          padding: 0 0.5rem;

          &.user-avatar {
            border-radius: 50%;
            margin-left: 0.75rem;
            padding: 0;
            height: 50px;
            width: 50px;
            box-shadow: 0px 0px 10px ${({ theme }) => theme.text}60;
          }
        }
      }

      a.btn {
        margin-left: 1.5rem;
        padding: 0.5rem 1.5rem;
      }

      .dropdown {
        .dropdown-menu {
          margin-top: 0.5rem;
          margin-right: 1.5rem;
        }

        .dropdown-toggle::after {
          display: none;
        }
      }
    }
  }

  @media (max-width: 992px) {
    nav {
      padding: 0 1rem 0rem;

      &.navbar-expand-lg {
        justify-content: space-between;
      }

      .navbar-brand {
        flex-basis: 60%;
        margin: 0;
      }

      .navbar-items {
        flex-direction: column;
        padding-bottom: 0.75rem;
        align-items: end;

        a:not(.btn) {
          padding: 0.85rem 0;
          display: flex;
          justify-content: end;
          width: 100%;
        }

        a.btn {
          margin: 0.35rem 0;
          padding: 0.5rem;
          width: 25%;
        }

        .desktop {
          display: none;
        }
      }
    }
  }
`;

export default Container;
