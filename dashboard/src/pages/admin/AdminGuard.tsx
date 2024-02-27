import Loader from "components/common/Loader";
import { Navigate, Outlet } from "react-router-dom";
import { useFetchUserQuery } from "store/api";

interface AdminGuardProps {
  redirectTo: string;
  children?: JSX.Element;
}

const AdminGuard = ({ redirectTo, children }: AdminGuardProps) => {
  const user = useFetchUserQuery();

  if (user.isFetching) return <Loader />;
  if (!user.data?.admin) return <Navigate to={redirectTo} />;
  return <Outlet />;
};

export default AdminGuard;
