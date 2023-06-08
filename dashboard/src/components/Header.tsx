import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import {
  faCrown,
  faRightFromBracket,
  faRightToBracket,
  faTableColumns,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "assets/logo_dark.svg";
import Paper from "components/Paper";
import {
  DISCORD_OAUTH_URL,
  DISCORD_SERVER_URL,
  getUserPictureUrl,
} from "helpers/discord";
import theme from "helpers/theme";
import {
  NavLink as BsNavLink,
  Button,
  Dropdown,
  Image,
  Nav,
  Navbar,
} from "react-bootstrap";
import ContentLoader from "react-content-loader";
import { NavLink } from "react-router-dom";
import { useFetchUserQuery, useLogoutMutation } from "store/api";
import StyledHeader from "./styles/Header";

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

  const renderDesktopNav = ({ data, isFetching }: typeof user) => (
    <Nav className="d-none d-lg-flex">
      <Nav.Link href={DISCORD_SERVER_URL} target="_blank" rel="noreferrer">
        <FontAwesomeIcon icon={faDiscord} />
        <div>Join Server</div>
      </Nav.Link>
      <Nav.Link as={NavLink} eventKey="premium" to="/premium">
        <FontAwesomeIcon icon={faCrown} />
        <div>Premium</div>
      </Nav.Link>

      {isFetching ? (
        <ContentLoader
          className="loader"
          viewBox="0 0 325 100"
          height={50}
          foregroundColor={theme.secondary}
        >
          <rect x="10" y="40" rx="3" ry="3" width="180" height="30" />
          <circle cx="275" cy="50" r="50" />
        </ContentLoader>
      ) : data ? (
        <Dropdown>
          <Dropdown.Toggle as={BsNavLink} id="dropdown-header">
            <div>{data.username}</div>
            <Image
              className="user-avatar"
              roundedCircle
              src={getUserPictureUrl(data)}
            />
          </Dropdown.Toggle>

          <Dropdown.Menu variant="dark" align="end">
            {data?.admin && (
              <Dropdown.Item as={NavLink} to="/admin">
                Admin
              </Dropdown.Item>
            )}
            <Dropdown.Item as={NavLink} to="/dashboard">
              Dashboard
            </Dropdown.Item>
            <Dropdown.Item as="a" onClick={doLogout} href="#">
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <Button href={DISCORD_OAUTH_URL}>Login</Button>
      )}
    </Nav>
  );

  const renderMobileNav = ({ data, isFetching }: typeof user) => (
    <Nav className="d-flex d-lg-none">
      {data?.admin && (
        <Nav.Link
          as={NavLink}
          eventKey="admin"
          to="/admin"
          className="nav-link"
        >
          <FontAwesomeIcon icon={faUserGear} />
          <div>Admin</div>
        </Nav.Link>
      )}
      <Nav.Link
        as={NavLink}
        eventKey="premium"
        to="/premium"
        className="nav-link"
      >
        <FontAwesomeIcon icon={faCrown} />
        <div>Premium</div>
      </Nav.Link>
      <Nav.Link href={DISCORD_SERVER_URL} target="_blank" rel="noreferrer">
        <FontAwesomeIcon icon={faDiscord} />
        <div>Join Server</div>
      </Nav.Link>
      {isFetching ? (
        <Nav className="d-flex d-lg-none">
          <ContentLoader
            className="loader d-lg-none"
            viewBox="0 0 150 50"
            height={50}
            foregroundColor={theme.secondary}
          >
            <rect x="15" y="15" rx="3" ry="3" width="150" height="20" />
          </ContentLoader>
        </Nav>
      ) : data ? (
        <>
          <Nav.Link
            as={NavLink}
            eventKey="dashboard"
            to="/dashboard"
            className="nav-link d-lg-none"
          >
            <FontAwesomeIcon icon={faTableColumns} />
            <div>Dashboard</div>
          </Nav.Link>
          <Nav.Link
            as={NavLink}
            eventKey="logout"
            to="#"
            className="nav-link d-lg-none"
            onClick={doLogout}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <div>Logout</div>
          </Nav.Link>
        </>
      ) : (
        <a href={DISCORD_OAUTH_URL} className="nav-link d-lg-none">
          <FontAwesomeIcon icon={faRightToBracket} />
          <div>Login</div>
        </a>
      )}
    </Nav>
  );

  return (
    <Paper elevation={0}>
      <StyledHeader>
        <Navbar collapseOnSelect expand="lg" variant="dark">
          <Navbar.Brand>
            <Nav.Link as={NavLink} to="/" eventKey="home">
              <img src={logo} alt="Albion Killbot" className="logo" />
            </Nav.Link>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav">
            {user.data && (
              <Image
                className="user-avatar"
                roundedCircle
                src={getUserPictureUrl(user.data)}
                style={{ width: 50, height: 50 }}
              />
            )}
          </Navbar.Toggle>
          <Navbar.Collapse id="basic-navbar-nav">
            {renderMobileNav(user)}
            {renderDesktopNav(user)}
          </Navbar.Collapse>
        </Navbar>
      </StyledHeader>
    </Paper>
  );
};

export default Header;
