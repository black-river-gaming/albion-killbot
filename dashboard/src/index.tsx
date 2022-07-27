import theme from "helpers/theme";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import MainRoutes from "routes";
import { ThemeProvider } from "styled-components";
import GlobalStyles from "styles/global-styles";
import { store } from "./store";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <GlobalStyles />
        <MainRoutes />
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);
