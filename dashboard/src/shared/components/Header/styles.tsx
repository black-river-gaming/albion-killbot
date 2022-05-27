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

      a {
        padding: 0 1.5rem;
        display: flex;
        align-items: center;

        img,
        svg {
          padding: 0 0.5rem;
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
        flex-basis: 80%;
        margin: 0;
      }

      .navbar-items {
        flex-direction: column;
        padding-bottom: 0.75rem;

        a {
          padding: 0.75rem 0;
          display: flex;
          justify-content: end;
          width: 100%;
        }
      }
    }
  }
`;

export default Container;
