import React from "react";
import { BrowserRouter } from "react-router-dom";
import MainRoutes from "routes";

export const App = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <MainRoutes />
      </BrowserRouter>
    </React.StrictMode>
  );
};

export default App;
