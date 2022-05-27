import styled from "styled-components";

export default styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  .content {
    flex-grow: 1;
  }

  a {
    color: ${({ theme }) => theme.text};
    transition: color 0.25s ease-in-out;
    text-decoration: none;

    &:hover {
      color: ${({ theme }) => theme.primary};
    }
  }
`;
