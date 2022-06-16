import App from "App";
import Auth from "pages/Auth";
import AuthGuard from "pages/AuthGuard";
import Dashboard from "pages/Dashboard";
import Home from "pages/Home";
import Premium from "pages/Premium";
import Server from "pages/Server";
import Settings from "pages/Settings";
import Subscription from "pages/Subscription";
import Track from "pages/Track";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function MainRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route element={<AuthGuard redirectTo="/" />}>
            <Route path="dashboard">
              <Route index element={<Dashboard />} />
              <Route path=":serverId" element={<Server />}>
                <Route
                  index
                  element={<Navigate to="settings" replace={true} />}
                />
                <Route path="settings" element={<Settings />} />
                <Route path="track" element={<Track />} />
                <Route path="subscription" element={<Subscription />} />
              </Route>
            </Route>
          </Route>
          <Route
            element={
              <AuthGuard>
                <h5>Please login to see the available plans</h5>
              </AuthGuard>
            }
          >
            <Route path="premium" element={<Premium />} />
          </Route>
          <Route path="*" element={<h1>404 - Not found</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default MainRoutes;
