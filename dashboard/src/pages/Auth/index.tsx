import { useEffect } from "react";
import ContentLoader from "react-content-loader";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthMutation } from "store/api";

const Auth = () => {
  const [auth] = useAuthMutation();
  const [search] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const doAuth = async () => {
      const code = search.get("code");
      if (code) {
        await auth(code);
        navigate("/", { replace: true });
      }
    };

    doAuth();
  }, [auth, navigate, search]);

  return (
    <ContentLoader
      viewBox="0 0 400 160"
      height="100%"
      width="100%"
      backgroundColor="transparent"
    >
      <circle cx="150" cy="86" r="8" />
      <circle cx="194" cy="86" r="8" />
      <circle cx="238" cy="86" r="8" />
    </ContentLoader>
  );
};

export default Auth;
