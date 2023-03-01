import Loader from "components/Loader";
import Paper from "components/Paper";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthMutation, useLazyFetchUserQuery } from "store/api";

const Auth = () => {
  const [auth] = useAuthMutation();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [fetchUser] = useLazyFetchUserQuery();

  useEffect(() => {
    const doAuth = async () => {
      const code = search.get("code");
      if (code) {
        await auth(code);
        await fetchUser();
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    };

    doAuth();
  }, [auth, navigate, search, fetchUser]);

  return (
    <Paper className="fullscreen">
      <Loader />
    </Paper>
  );
};

export default Auth;
