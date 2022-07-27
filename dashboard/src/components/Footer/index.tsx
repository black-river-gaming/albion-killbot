import { faDiscord, faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Paper from "components/Paper";
import { DISCORD_SERVER_URL } from "helpers/discord";
import StyledFooter from "./styles";

const Footer = () => {
  return (
    <Paper elevation={0} className="d-flex justify-content-center">
      <StyledFooter>
        <div className="footer-spacing" />
        <div className="footer-copyright">
          <div>© 2022 Black River Gaming</div>
          <div>All rights reserved</div>
        </div>
        <div className="footer-icons">
          <a
            href={DISCORD_SERVER_URL}
            target="_blank"
            className="navbar-link"
            rel="noreferrer"
          >
            <FontAwesomeIcon icon={faDiscord} size="2x" />
          </a>
          <a
            href="https://github.com/black-river-gaming/albion-killbot"
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon icon={faGithub} size="2x" />
          </a>
        </div>
      </StyledFooter>
    </Paper>
  );
};

export default Footer;
