import { Card } from "react-bootstrap";
import { getSubscriptionPriceBanner } from "shared/subscriptions";
import { getCurrency } from "shared/utils";
import { SubscriptionPrice } from "store/api";

interface SubscriptionPriceCardProps {
  price: SubscriptionPrice;
  children?: JSX.Element | string | number;
}

const SubscriptionPriceCard = ({
  price,
  children,
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
      {children}
    </Card>
  );
};

export default SubscriptionPriceCard;
