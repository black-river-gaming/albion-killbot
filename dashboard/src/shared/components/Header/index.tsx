import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "assets/logo_dark.svg";
import { Button, Image, Navbar } from "react-bootstrap";
import ContentLoader from "react-content-loader";
import { NavLink } from "react-router-dom";
import Dropdown from "shared/components/Dropdown";
import Paper from "shared/components/Paper";
import {
  DISCORD_OAUTH_URL,
  DISCORD_SERVER_URL,
  getUserPictureUrl,
} from "shared/discord";
import theme from "shared/theme";
import { useFetchUserQuery, useLogoutMutation } from "store/api";
import Container from "./styles";

const Header = () => {
  const user = useFetchUserQuery();
  const [logout] = useLogoutMutation();

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
              src={getUserPictureUrl(data)}
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

    return <Button href={DISCORD_OAUTH_URL}>Login</Button>;
  };

  return (
    <Paper>
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
              <a
                href={DISCORD_SERVER_URL}
                target="_blank"
                className="navbar-link"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faDiscord} />
                <div>Join Server</div>
              </a>
              <div className="desktop">{renderLogin(user)}</div>
            </div>
          </Navbar.Collapse>
        </Navbar>
      </Container>
    </Paper>
  );
};

export default Header;
