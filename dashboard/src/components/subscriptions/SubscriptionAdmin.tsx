import { faUserGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useFetchUserQuery } from "store/api";
import { ISubscriptionBase } from "types/subscription";

interface Props {
  subscription: ISubscriptionBase;
}

const SubscriptionAdmin = ({ subscription }: Props) => {
  const user = useFetchUserQuery();

  if (!user.data?.admin) return null;

  return (
    <Link to={`/admin/subscriptions/${subscription.id}`}>
      <Button variant="primary">
        <FontAwesomeIcon icon={faUserGear} className="s-2" />
        <div>Admin</div>
      </Button>
    </Link>
  );
};

export default SubscriptionAdmin;
