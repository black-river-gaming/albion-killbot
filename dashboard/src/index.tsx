import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import MainRoutes from "routes";
import theme from "shared/theme";
import { ThemeProvider } from "styled-components";
import GlobalStyles from "styles/global-styles";
import { store } from "./store";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Provider store={store}>
        <MainRoutes />
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);
