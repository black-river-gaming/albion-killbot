import App from "App";
import Auth from "pages/Auth";
import Dashboard from "pages/Dashboard";
import Home from "pages/Home";
import Server from "pages/Server";
import Settings from "pages/Settings";
import Subscription from "pages/Subscription";
import Track from "pages/Track";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import Loader from "shared/components/Loader";
import { useFetchUserQuery } from "store/api";

interface IRedirectTo {
  redirectTo: string;
}

function AuthenticatedRoutes({ redirectTo }: IRedirectTo) {
  const user = useFetchUserQuery();
  if (user.isFetching) return <Loader />;
  return user.data ? <Outlet /> : <Navigate to={redirectTo} />;
}

function MainRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route element={<AuthenticatedRoutes redirectTo="/" />}>
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
          <Route path="*" element={<h1>404 - Not found</h1>}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default MainRoutes;
