import React from "react";
import ReactDOM from "react-dom/client";
import MainRoutes from "routes";
import theme from "shared/theme";
import { ThemeProvider } from "styled-components";
import GlobalStyles from "styles/global-styles";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <MainRoutes />
    </ThemeProvider>
  </React.StrictMode>
);
