import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  html,body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .fill {
    width: 100%;
    height: 100%;
  }

  .fullscreen {
    width: 100vw;
    height: 100vh;
  }

  .toast {
    position: fixed;
    bottom: 1rem;
  }
`;
