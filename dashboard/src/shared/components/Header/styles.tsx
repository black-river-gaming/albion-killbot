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

      a:not(.btn) {
        padding: 0 1.5rem;
        display: flex;
        align-items: center;

        img,
        svg {
          padding: 0 0.5rem;
        }
      }

      a.btn {
        margin-left: 1.5rem;
        padding: 0.5rem 1.5rem;
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
        flex-basis: 80%;
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
      }
    }
  }
`;

export default Container;
