import wallpapper from "assets/wallpappers/call_to_arms.jpeg";
import styled from "styled-components";

const StyledHome = styled.div`
  width: 100%;

  padding-bottom: 2rem;

  .home-card {
    background-image: url(${wallpapper});
    background-repeat: no-repeat;
    background-size: cover;
    background-blend-mode: multiply;
  }
  .home-text {
    text-align: center;
  }

  .feature-card {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .feature-description {
      color: ${({ theme }) => theme.mutedText};

      text-align: center;
    }
  }
`;

export default StyledHome;
