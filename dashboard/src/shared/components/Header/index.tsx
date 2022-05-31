import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "assets/logo_dark.svg";
import { Button, Image, Navbar } from "react-bootstrap";
import ContentLoader from "react-content-loader";
import { NavLink } from "react-router-dom";
import Dropdown from "shared/components/Dropdown";
import Paper from "shared/components/Paper";
import theme from "shared/theme";
import { useFetchUserQuery, useLogoutMutation } from "store/api";
import Container from "./styles";

const Header = () => {
  const user = useFetchUserQuery();
  const [logout] = useLogoutMutation();

  const { REACT_APP_DISCORD_CLIENT_ID, REACT_APP_DISCORD_REDIRECT_URI = "" } =
    process.env;
  const encodedRedirectUri = encodeURIComponent(REACT_APP_DISCORD_REDIRECT_URI);
  const discordOAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${REACT_APP_DISCORD_CLIENT_ID}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=identify%20guilds`;

  const doLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (e) {
      console.log(`Error on logout: ${e}`);
    }
  };

  const renderLogin = ({ data, isFetching }: typeof user) => {
    if (isFetching) {
      return (
        <ContentLoader
          className="loader"
          viewBox="0 0 325 100"
          height={50}
          foregroundColor={theme.secondary}
        >
          <rect x="10" y="40" rx="3" ry="3" width="180" height="30" />
          <circle cx="275" cy="50" r="50" />
        </ContentLoader>
      );
    }

    if (data) {
      return (
        <Dropdown>
          <Dropdown.Toggle as="a" className="navbar-link">
            <div>
              {data.username}#{data.discriminator}
            </div>
            <Image
              className="user-avatar"
              roundedCircle
              src={`https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`}
            />
          </Dropdown.Toggle>

          <Dropdown.Menu variant="dark" align="end">
            <Dropdown.Item as={NavLink} to="/dashboard">
              Dashboard
            </Dropdown.Item>
            <Dropdown.Item as="a" onClick={doLogout}>
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    }

    return <Button href={discordOAuthUrl}>Login</Button>;
  };

  return (
    <Paper className="elevation-2">
      <Container>
        <Navbar expand="lg" variant="dark">
          <Navbar.Brand as={NavLink} to="/">
            <img src={logo} alt="Albion Killbot" className="logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <div className="navbar-items">
              <NavLink to="/premium" className="navbar-link">
                <FontAwesomeIcon icon={faCrown} style={{ paddingBottom: 4 }} />
                <div>Premium</div>
              </NavLink>
              <NavLink to="/discord" className="navbar-link">
                <FontAwesomeIcon icon={faDiscord} />
                <div>Join Server</div>
              </NavLink>
              <div className="desktop">{renderLogin(user)}</div>
            </div>
          </Navbar.Collapse>
        </Navbar>
      </Container>
    </Paper>
  );
};

export default Header;
