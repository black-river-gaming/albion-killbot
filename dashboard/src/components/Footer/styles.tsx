import styled from "styled-components";

const StyledFooter = styled.div`
  padding: 0.5rem;
  width: 100%;

  display: flex;
  justify-content: center;

  .footer-spacing {
    flex-basis: 30%;
  }

  .footer-copyright {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .footer-icons {
    flex-basis: 30%;
    display: flex;
    align-items: center;
    justify-content: start;

    * {
      padding: 0 0.5rem;
    }
  }
`;

export default StyledFooter;
