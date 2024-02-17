import { ReactNode } from "react";
import { Alert, Container, Stack } from "react-bootstrap";

interface IAlert {
  show?: boolean;
  variant: string;
  message: ReactNode;
}

interface PageProps {
  alerts?: IAlert[];
  title: string;
  children: ReactNode;
}

const Page = ({ alerts, title, children }: PageProps) => {
  const renderAlert = (alert: IAlert) => {
    if (alert.show !== undefined && !alert.show) return;
    return <Alert variant={alert.variant}>{alert.message}</Alert>;
  };

  return (
    <Container fluid className="py-3">
      <Stack gap={2}>
        {alerts?.map(renderAlert)}
        <div className="d-flex justify-content-center">
          <h1>{title}</h1>
        </div>
        <div>{children}</div>
      </Stack>
    </Container>
  );
};

export default Page;
