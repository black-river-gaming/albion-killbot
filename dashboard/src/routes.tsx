import Home from "pages/Home";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

interface IRedirectTo {
  redirectTo: string;
}

function ProtectedRoutes({ redirectTo }: IRedirectTo) {
  const isAuthenticated = false;

  return isAuthenticated ? <Outlet /> : <Navigate to={redirectTo} />;
}

function MainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route element={<ProtectedRoutes redirectTo="/" />}>
        <Route path="/example" element={<div>Example</div>} />
      </Route>

      <Route path="*" element={<h1>404 - Not found</h1>}></Route>
    </Routes>
  );
}

export default MainRoutes;
