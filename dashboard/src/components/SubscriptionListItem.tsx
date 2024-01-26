import { Button, Card, Col, Row, Stack, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { SubscriptionPartial } from "types";

interface SubscriptionListItemProps {
  subscription: SubscriptionPartial;
}

const SubscriptionListItem = ({ subscription }: SubscriptionListItemProps) => (
  <Card className="p-3">
    <Row key={subscription.id} className="gy-2">
      <Col xs={12} xl={8} className="d-flex flex-column justify-content-center">
        <Table borderless responsive>
          <tbody>
            <tr>
              <td>ID</td>
              <td className="text-primary">{subscription.id}</td>
            </tr>
            <tr>
              <td>Owner</td>
              <td className="text-primary">{subscription.owner}</td>
            </tr>
            <tr>
              <td>Status</td>
              <td className="text-primary">
                {subscription.expires === "never"
                  ? `Free`
                  : `${
                      new Date(subscription.expires).getTime() >
                      new Date().getTime()
                        ? `Active until `
                        : `Expired at `
                    } ${new Date(subscription.expires).toLocaleString()}`}
              </td>
            </tr>
            {subscription.server && (
              <tr>
                <td>Server</td>
                <td className="text-primary">{subscription.server}</td>
              </tr>
            )}
            {subscription.stripe && (
              <tr>
                <td>Stripe</td>
                <td className="text-primary">{subscription.stripe}</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Col>

      <Col
        xs={12}
        xl={4}
        className="actions d-flex align-items-start justify-content-end"
      >
        <Stack gap={2} direction="horizontal">
          <Link to={`/admin/subscriptions/${subscription.id}`}>
            <Button variant="primary">Manage</Button>
          </Link>
          {subscription.server && (
            <Link to={`/dashboard/${subscription.server}`}>
              <Button variant="primary">Dashboard</Button>
            </Link>
          )}
        </Stack>
      </Col>
    </Row>
  </Card>
);

export default SubscriptionListItem;
