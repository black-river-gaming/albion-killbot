import { useEffect, useState } from "react";
import { Button, Pagination, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ServerPartial } from "types";
import LeaveServer from "./LeaveServer";
import ServerCard from "./ServerCard";

interface ServerListProps {
  className: string;
  pageSize?: number;
  servers: ServerPartial[];
}

const ServerList = ({ servers, className, pageSize = 10 }: ServerListProps) => {
  const [page, setPage] = useState(1);
  const pages = Math.ceil(servers.length / pageSize);

  useEffect(() => {
    if (page < 1) setPage(1);
    else if (page > pages && pages > 0) setPage(pages);
  }, [page, pages]);

  const items = servers.slice(
    (page - 1) * pageSize,
    (page - 1) * pageSize + pageSize
  );

  let startPage = page - 5;
  let endPage = page + 5;

  while (startPage < 1) {
    startPage++;
    endPage++;
  }

  while (endPage > pages) {
    endPage--;
    startPage--;
  }

  if (startPage < 1) startPage = 1;
  if (endPage > pages) endPage = pages;

  const pageList = [];
  for (let i = startPage; i <= endPage; i++) {
    pageList.push(i);
  }

  if (servers.length === 0)
    return (
      <h5 className="d-flex justify-content-center py-5">
        No servers to display.
      </h5>
    );

  return (
    <Stack gap={3} className={className}>
      {items.map((server) => (
        <ServerCard key={server.id} server={server} list>
          <Stack gap={2} direction="horizontal">
            <Link to={`/admin/${server.id}`}>
              <Button variant="primary">Manage</Button>
            </Link>

            <Link to={`/dashboard/${server.id}`}>
              <Button variant="primary">Dashboard</Button>
            </Link>

            <LeaveServer server={server} />
          </Stack>
        </ServerCard>
      ))}

      <div className="d-flex justify-content-center">
        <Pagination>
          <Pagination.First onClick={() => setPage(1)} />

          {pageList.map((i) => (
            <Pagination.Item
              key={i}
              active={page === i}
              onClick={() => setPage(i)}
            >
              {i}
            </Pagination.Item>
          ))}

          <Pagination.Last onClick={() => setPage(pages)} />
        </Pagination>
      </div>
    </Stack>
  );
};

export default ServerList;
