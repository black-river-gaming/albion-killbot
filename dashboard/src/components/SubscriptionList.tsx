import { useEffect, useState } from "react";
import { Pagination, Stack } from "react-bootstrap";
import { ISubscription } from "types";
import SubscriptionListItem from "./SubscriptionListItem";

interface SubscriptionListProps {
  className?: string;
  pageSize?: number;
  subscriptions?: ISubscription[];
}

const SubscriptionList = ({
  subscriptions = [],
  className,
  pageSize = 10,
}: SubscriptionListProps) => {
  const [width, setWidth] = useState(window.innerWidth);
  const PAGE_GAP = 2 + Math.floor(width / 450);

  const [page, setPage] = useState(1);
  const pages = Math.ceil(subscriptions.length / pageSize);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setWidth]);

  useEffect(() => {
    if (page < 1) setPage(1);
    else if (page > pages && pages > 0) setPage(pages);
  }, [page, pages]);

  const items = subscriptions.slice(
    (page - 1) * pageSize,
    (page - 1) * pageSize + pageSize
  );

  let startPage = page - PAGE_GAP;
  let endPage = page + PAGE_GAP;

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

  if (subscriptions.length === 0)
    return (
      <h5 className="d-flex justify-content-center py-5">
        No subscriptions to display.
      </h5>
    );

  return (
    <Stack gap={3} className={className}>
      {items.map((subscription) => (
        <SubscriptionListItem
          key={subscription.id}
          subscription={subscription}
        />
      ))}

      <div className="mw-w100 d-flex justify-content-center">
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

export default SubscriptionList;
