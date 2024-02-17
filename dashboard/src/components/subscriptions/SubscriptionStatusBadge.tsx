import { Badge } from "react-bootstrap";

interface Props {
  status: string;
}

const SubscriptionStatusBadge = ({ status }: Props) => {
  return <Badge>{status}</Badge>;
};

export default SubscriptionStatusBadge;
