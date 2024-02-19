import { faStripe } from "@fortawesome/free-brands-svg-icons";
import {
  faCircleCheck,
  faCircleQuestion,
  faPeopleGroup,
  faPerson,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getSubscriptionPriceBanner } from "helpers/subscriptions";
import { getCurrency } from "helpers/utils";
import { Button, Card, ListGroup } from "react-bootstrap";
import { SubscriptionPrice } from "types/subscription";

interface SubscriptionPriceCardProps {
  price: SubscriptionPrice;
  onSelect?: (priceId: string) => void;
}

const SubscriptionStripePriceCard = ({
  price,
  onSelect,
}: SubscriptionPriceCardProps) => {
  return (
    <Card>
      <Card.Img variant="top" src={getSubscriptionPriceBanner(price)} />
      <Card.Body className="pb-0">
        <div className="d-flex justify-content-end align-items-baseline">
          <h4>
            {getCurrency(price.price / 100, {
              currency: price.currency,
            })}
          </h4>
          <div>/</div>
          <div>
            {price.recurrence.count} {price.recurrence.interval}
          </div>
        </div>
      </Card.Body>
      <hr className="mx-2" />
      <Card.Body className="pt-0">
        <ListGroup>
          <ListGroup.Item className="d-flex align-items-center">
            <FontAwesomeIcon icon={faCircleCheck} className="s-1" />
            <span className="ps-2">No ads</span>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex align-items-center">
            <FontAwesomeIcon icon={faPerson} className="s-1" />
            <span className="ps-2">10 Player slots</span>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex align-items-center">
            <FontAwesomeIcon icon={faPeopleGroup} className="s-1" />
            <span className="ps-2">1 Guild slot</span>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex align-items-center">
            <FontAwesomeIcon icon={faCircleQuestion} className="s-1" />
            <span className="ps-2">Premium support</span>
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>

      <Card.Footer>
        <div className="d-flex justify-content-stretch">
          <Button
            variant="primary"
            style={{ width: "100%" }}
            className="d-flex align-items-center"
            onClick={() => onSelect && onSelect(price.id)}
          >
            <FontAwesomeIcon icon={faStripe} className="s-2" />
            <div>Checkout</div>
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default SubscriptionStripePriceCard;
