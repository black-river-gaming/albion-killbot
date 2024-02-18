import { capitalize } from "helpers/utils";
import { Badge } from "react-bootstrap";

interface Props {
  status: string;
}

const SubscriptionStatusBadge = ({ status }: Props) => {
  const bg =
    {
      active: "success",
      canceled: "danger",
      incomplete: "danger",
      incomplete_expired: "secondary",
      past_due: "warning",
      trialing: "success",
      unpaid: "danger",
    }[status] || "primary";

  return <Badge bg={bg}>{capitalize(status, { splitWords: true })}</Badge>;
};

export default SubscriptionStatusBadge;
