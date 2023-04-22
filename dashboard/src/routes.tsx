import App from "App";
import AdminGuard from "pages/AdminGuard";
import AdminPage from "pages/AdminPage";
import AdminServerPage from "pages/AdminServerPage";
import AdminServersPage from "pages/AdminServersPage";
import AdminSubscriptionsPage from "pages/AdminSubscriptionsPage";
import Auth from "pages/Auth";
import AuthGuard from "pages/AuthGuard";
import Dashboard from "pages/Dashboard";
import Home from "pages/Home";
import PremiumPage from "pages/PremiumPage";
import ServerPage from "pages/ServerPage";
import SettingsPage from "pages/SettingsPage";
import SubscriptionPage from "pages/Subscription";
import TrackPage from "pages/TrackPage";
import { createRoutesFromElements, Navigate, Route } from "react-router-dom";

const routes = createRoutesFromElements(
  <>
    <Route path="/auth" element={<Auth />} />
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route element={<AuthGuard redirectTo="/" />}>
        <Route path="dashboard">
          <Route index element={<Dashboard />} />
          <Route path=":serverId" element={<ServerPage />}>
            <Route index element={<Navigate to="settings" replace={true} />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="track" element={<TrackPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
          </Route>
        </Route>
      </Route>
      <Route element={<AdminGuard redirectTo="/" />}>
        <Route path="admin" element={<AdminPage />}>
          <Route index element={<Navigate to="servers" replace={true} />} />
          <Route path="servers" element={<AdminServersPage />} />
          <Route path="servers/:serverId" element={<AdminServerPage />} />
          <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
        </Route>
      </Route>
      <Route
        element={
          <AuthGuard>
            <h5>Please login to see the available plans</h5>
          </AuthGuard>
        }
      >
        <Route path="premium" element={<PremiumPage />} />
      </Route>
      <Route path="*" element={<h1>404 - Not found</h1>} />
    </Route>
  </>
);

export default routes;
