import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "components/Loader";
import { DISCORD_OAUTH_URL } from "helpers/discord";
import { Button } from "react-bootstrap";
import { Navigate, Outlet } from "react-router-dom";
import { useFetchUserQuery } from "store/api";

interface AuthGuardProps {
  redirectTo?: string;
  children?: JSX.Element;
}

const AuthGuard = ({ redirectTo, children }: AuthGuardProps) => {
  const user = useFetchUserQuery();

  if (user.isFetching) return <Loader />;
  if (!user.data) {
    if (redirectTo) return <Navigate to={redirectTo} />;
    else
      return (
        <div className="h-100 d-flex flex-column justify-content-center align-items-center">
          <div className="py-2">{children}</div>
          <Button variant="primary" href={DISCORD_OAUTH_URL}>
            <FontAwesomeIcon icon={faDiscord} />
            <div>Login</div>
          </Button>
        </div>
      );
  }

  return <Outlet />;
};

export default AuthGuard;
