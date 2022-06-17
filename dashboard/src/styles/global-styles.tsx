import { ThemeProps } from "shared/theme";
import { createGlobalStyle } from "styled-components";

export default createGlobalStyle<{ theme: ThemeProps }>`
  html,body {
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

  .toast {
    position: fixed;
    bottom: 1rem;
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
`;
