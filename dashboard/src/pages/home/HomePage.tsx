import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import {
  faCrown,
  faEarthAsia,
  faGear,
  faLandmarkFlag,
  faRankingStar,
  faSackDollar,
  faSkull,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import screenshot1 from "assets/screenshots/970551093-event.png";
import screenshot2 from "assets/screenshots/971842546-event.png";
import screenshot3 from "assets/screenshots/971900762-event.png";
import screenshot4 from "assets/screenshots/971905670-event.png";
import wallpapper from "assets/wallpappers/call_to_arms.jpeg";
import Paper from "components/Paper";
import { getServerInviteUrl } from "helpers/discord";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Row,
  Stack,
} from "react-bootstrap";

const screenshots = [screenshot1, screenshot2, screenshot3, screenshot4];

const features = [
  {
    new: true,
    premium: true,
    name: "Juicy Kills",
    icon: faSackDollar,
    description:
      "Juicy kills allows you to get a feed of the most expensive kills in Albion Online.",
  },
  {
    new: true,
    name: "Awakened Weapons",
    icon: faWandMagicSparkles,
    description: "Our reports now display information about awakened weapons",
  },
  {
    name: "East Server Support",
    icon: faEarthAsia,
    description: "You can track entities from the new Albion East server.",
  },
  {
    name: "Kills",
    icon: faSkull,
    description:
      "Receive a notification on your discord whenever a kill happens in Albion Online.",
  },
  {
    name: "Battles",
    icon: faLandmarkFlag,
    description:
      "Receive a summary of battles with a link to a more detailed report.",
  },
  {
    name: "Rankings",
    icon: faRankingStar,
    description:
      "A ranking of the most famed killers and victims on a daily basis.",
  },
  {
    name: "Settings",
    icon: faGear,
    description:
      "A full functional dashboard where you can configure and checkout subscription for each server the bot runs.",
  },
  {
    name: "Premium",
    icon: faCrown,
    description:
      "With the premium subscription, you can enable exclusive guild features for your server.",
  },
];

const HomePage = () => {
  const screenshot =
    screenshots[Math.floor(Math.random() * screenshots.length)];

  return (
    <div className="pb-3">
      <Paper
        elevation={6}
        className="d-flex justify-content-around align-items-center p-4"
        style={{
          backgroundImage: `url(${wallpapper})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundBlendMode: "multiply",
        }}
      >
        <img src={screenshot} alt="Screenshot" className="d-none d-md-block" />
        <div className="d-flex flex-column align-items-center">
          <h5 className="p-2 d-flex">
            A Discord bot for displaying kills in Albion Online.
          </h5>
          <div className="p-2">
            <a
              href={getServerInviteUrl()}
              className="navbar-link"
              rel="noreferrer"
            >
              <Button variant="primary">
                <FontAwesomeIcon icon={faDiscord} />
                <div>Invite</div>
              </Button>
            </a>
          </div>
        </div>
      </Paper>

      <Container>
        <h4 className="d-flex justify-content-center p-3 pb-0">Features</h4>
        <Row className="px-2">
          {features.map((feature) => (
            <Col key={feature.name} sm={6} lg={4} className="g-4">
              <Card className="p-2 d-flex flex-column justify-content-center hover">
                <div className="p-4 d-flex justify-content-center">
                  <FontAwesomeIcon icon={feature.icon} size="3x" />
                </div>
                <Card.Title>
                  <Stack gap={2} className="align-items-center">
                    <Stack
                      direction="horizontal"
                      gap={2}
                      className="align-self-center"
                    >
                      {feature.new && <Badge bg="primary">NEW</Badge>}
                      {feature.premium && <Badge bg="primary">PREMIUM</Badge>}
                    </Stack>
                    <div>{feature.name}</div>
                  </Stack>
                </Card.Title>
                <Card.Body className="text-muted">
                  {feature.description}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;
