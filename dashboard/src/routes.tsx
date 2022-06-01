import App from "App";
import Auth from "pages/Auth";
import Dashboard from "pages/Dashboard";
import Home from "pages/Home";
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
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<h1>404 - Not found</h1>}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default MainRoutes;
