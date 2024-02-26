import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import {
  faCrown,
  faRightFromBracket,
  faRightToBracket,
  faStar,
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
import { useMediaQuery } from "helpers/hooks";
import theme from "helpers/theme";
import {
  NavLink as BsNavLink,
  Button,
  Dropdown,
  Image,
  Nav,
  Navbar,
  Stack,
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useFetchUserQuery, useLogoutMutation } from "store/api";
import Loader from "../Loader";

const HeaderNavItem = ({
  to,
  href,
  target,
  onClick,
  icon,
  label,
  className,
}: any) => {
  return (
    <Nav.Link
      as={to ? NavLink : Nav.Link}
      to={to}
      href={href}
      target={target}
      onClick={onClick}
      eventKey={label}
      className={`nav-link ${className}`}
      style={{
        color: theme.text,
      }}
    >
      <Stack
        direction="horizontal"
        gap={2}
        className="justify-content-end align-items-center"
      >
        <FontAwesomeIcon
          icon={icon}
          style={{ width: "1.75rem", textAlign: "center" }}
        />
        <div>{label}</div>
      </Stack>
    </Nav.Link>
  );
};

const Header = () => {
  const user = useFetchUserQuery();
  const [logout] = useLogoutMutation();
  const isMobile = useMediaQuery("(max-width: 992px)");

  const doLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (e) {
      console.log(`Error on logout: ${e}`);
    }
  };

  const renderDesktopNav = ({ data, isFetching }: typeof user) => {
    const ICON_WIDTH = 25;

    return (
      <Nav className="d-sm-none d-lg-flex align-items-center">
        <HeaderNavItem
          href={DISCORD_SERVER_URL}
          target="_blank"
          icon={faDiscord}
          label="Join Server"
          className="px-4"
        />
        <HeaderNavItem
          to="/premium"
          icon={faCrown}
          label="Premium"
          className="px-4"
        />

        {isFetching ? (
          <Loader width={200} height={60} foregroundColor={theme.secondary}>
            <rect x="0" y="21" rx="3" ry="3" width="120" height="20" />
            <circle cx="170" cy="30" r="30" />
          </Loader>
        ) : data ? (
          <Dropdown>
            <Dropdown.Toggle
              as={BsNavLink}
              id="dropdown-header"
              className="d-flex align-items-center"
            >
              <Stack
                direction="horizontal"
                gap={3}
                className="px-4"
                style={{
                  color: theme.text,
                }}
              >
                <div>{data.username}</div>
                <Image
                  className="p-0"
                  roundedCircle
                  src={getUserPictureUrl(data)}
                  width={50}
                  height={50}
                  style={{
                    boxShadow: `0px 0px 10px ${theme.text}60`,
                  }}
                />
              </Stack>
            </Dropdown.Toggle>

            <Dropdown.Menu variant="dark" align="end">
              {data?.admin && (
                <Dropdown.Item as={NavLink} to="/admin">
                  <Stack
                    direction="horizontal"
                    gap={2}
                    className="align-items-center"
                  >
                    <FontAwesomeIcon icon={faUserGear} width={ICON_WIDTH} />
                    <div>Admin</div>
                  </Stack>
                </Dropdown.Item>
              )}
              <Dropdown.Item as={NavLink} to="/dashboard">
                <Stack
                  direction="horizontal"
                  gap={2}
                  className="align-items-center"
                >
                  <FontAwesomeIcon icon={faTableColumns} width={ICON_WIDTH} />
                  <div>My Servers</div>
                </Stack>
              </Dropdown.Item>
              <Dropdown.Item as={NavLink} to="/subscriptions">
                <Stack
                  direction="horizontal"
                  gap={2}
                  className="align-items-center"
                >
                  <FontAwesomeIcon icon={faStar} width={ICON_WIDTH} />
                  <div>My Subscriptions</div>
                </Stack>
              </Dropdown.Item>
              <Dropdown.Item as="a" onClick={doLogout} href="#">
                <Stack
                  direction="horizontal"
                  gap={2}
                  className="align-items-center text-danger"
                >
                  <FontAwesomeIcon
                    icon={faRightFromBracket}
                    width={ICON_WIDTH}
                  />
                  <div>Logout</div>
                </Stack>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <Button href={DISCORD_OAUTH_URL}>Login</Button>
        )}
      </Nav>
    );
  };

  const renderMobileNav = ({ data, isFetching }: typeof user) => {
    return (
      <Nav className="d-sm-flex d-lg-none">
        {data?.admin && (
          <HeaderNavItem to="/admin" icon={faUserGear} label="Admin" />
        )}
        <HeaderNavItem to="/premium" icon={faCrown} label="Premium" />
        <HeaderNavItem
          href={DISCORD_SERVER_URL}
          target="_blank"
          icon={faDiscord}
          label="Join Server"
        />
        {isFetching ? (
          <Loader
            width={500}
            height={15}
            foregroundColor={theme.secondary}
            className="py-2"
          >
            <rect x="15" y="0" rx="3" ry="3" width="70" height="15" />
          </Loader>
        ) : data ? (
          <>
            <HeaderNavItem
              to="/dashboard"
              icon={faTableColumns}
              label="My Servers"
            />
            <HeaderNavItem
              to="/subscriptions"
              icon={faStar}
              label="My Subscriptions"
            />
            <HeaderNavItem
              href="#"
              onClick={doLogout}
              icon={faRightFromBracket}
              label="Logout"
              className="text-danger"
            />
          </>
        ) : (
          <HeaderNavItem
            href={DISCORD_OAUTH_URL}
            icon={faRightToBracket}
            label="Login"
            className="text-primary"
          />
        )}
      </Nav>
    );
  };

  return (
    <Paper elevation={0}>
      <Navbar
        collapseOnSelect
        expand="lg"
        variant="dark"
        style={{
          padding: isMobile ? "0 1rem 0" : "0rem 4rem",
        }}
      >
        <Navbar.Brand style={{ flexBasis: isMobile ? "60%" : "40%" }}>
          <Nav.Link as={NavLink} to="/" eventKey="home" className="p-0">
            <img
              src={logo}
              alt="Albion Killbot"
              style={{
                height: "5rem",
              }}
            />
          </Nav.Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav">
          {user.data && (
            <Image
              roundedCircle
              src={getUserPictureUrl(user.data)}
              style={{ width: 50, height: 50 }}
            />
          )}
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          {isMobile ? renderMobileNav(user) : renderDesktopNav(user)}
        </Navbar.Collapse>
      </Navbar>
    </Paper>
  );
};

export default Header;
