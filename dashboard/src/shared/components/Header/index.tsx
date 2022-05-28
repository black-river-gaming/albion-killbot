import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "assets/logo_dark.svg";
import { Button, Navbar } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import Paper from "shared/components/Paper";
import Container from "./styles";

const Header = () => {
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
              <NavLink to="/premium">
                <FontAwesomeIcon icon={faCrown} style={{ paddingBottom: 4 }} />
                <div>Premium</div>
              </NavLink>
              <NavLink to="/discord">
                <FontAwesomeIcon icon={faDiscord} />
                <div>Join Server</div>
              </NavLink>
              <Button href="/dashboard">
                <div>Login</div>
              </Button>
            </div>
          </Navbar.Collapse>
        </Navbar>
      </Container>
    </Paper>
  );
};

export default Header;
