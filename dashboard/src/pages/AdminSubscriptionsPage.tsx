import Loader from "components/Loader";
import SubscriptionList from "components/SubscriptionList";
import { Stack } from "react-bootstrap";
import { useFetchAdminSubscriptionsQuery } from "store/api";

const AdminSubscriptionsPage = () => {
  const { data, isFetching } = useFetchAdminSubscriptionsQuery({});

  if (isFetching) {
    return (
      <Loader width={500} height={500}>
        <rect x="160" y="10" rx="0" ry="0" width="210" height="15" />
        <rect x="15" y="45" rx="5" ry="5" width="475" height="40" />
        <rect x="15" y="95" rx="5" ry="5" width="475" height="40" />
        <rect x="15" y="145" rx="5" ry="5" width="475" height="40" />
        <rect x="15" y="195" rx="5" ry="5" width="475" height="40" />
        <rect x="15" y="245" rx="5" ry="5" width="475" height="40" />
        <rect x="15" y="295" rx="5" ry="5" width="475" height="40" />
        <rect x="15" y="345" rx="5" ry="5" width="475" height="40" />
        <rect x="15" y="395" rx="5" ry="5" width="475" height="40" />
        <rect x="15" y="445" rx="5" ry="5" width="475" height="40" />
      </Loader>
    );
  }

  return (
    <Stack gap={3}>
      <SubscriptionList subscriptions={data} />
    </Stack>
  );
};

export default AdminSubscriptionsPage;
