import App from "App";
import Home from "pages/Home";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

interface IRedirectTo {
  redirectTo: string;
}

function ProtectedRoutes({ redirectTo }: IRedirectTo) {
  const isAuthenticated = false;

  return isAuthenticated ? <Outlet /> : <Navigate to={redirectTo} />;
}

function MainRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route element={<ProtectedRoutes redirectTo="/" />} />
          <Route path="*" element={<h1>404 - Not found</h1>}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default MainRoutes;
