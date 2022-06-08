import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  ListGroup,
  Row,
} from "react-bootstrap";
import Loader from "shared/components/Loader";
import { SearchResults, useLazySearchQuery } from "store/api";

const Track = () => {
  const [query, setQuery] = useState("");
  const [search, searchResults] = useLazySearchQuery();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    search(query, true);
  };

  const renderSearchResultsList = (
    title: string,
    list:
      | SearchResults["players"]
      | SearchResults["guilds"]
      | SearchResults["alliances"]
  ) => {
    return (
      <div className="px-4">
        <div className="py-2">{title}:</div>
        <ListGroup>
          {list.slice(0, 5).map((item) => (
            <ListGroup.Item key={item.id}>{item.name}</ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    );
  };

  const renderSearchResults = () => {
    if (searchResults.isUninitialized) return;
    if (searchResults.isFetching) return <Loader className="p-2" />;
    if (!searchResults.data)
      return (
        <span className="d-flex justify-content-center p-2">
          Nothing was found. Please use a different search term.
        </span>
      );

    const { players, guilds, alliances } = searchResults.data;

    return (
      <>
        {players.length > 0 && renderSearchResultsList("Players", players)}
        {guilds.length > 0 && renderSearchResultsList("Guilds", guilds)}
        {alliances.length > 0 &&
          renderSearchResultsList("Alliances", alliances)}
      </>
    );
  };

  return (
    <Row className="g-3">
      <Col sm={12}>
        <Card>
          <h4 className="d-flex justify-content-center p-2">Tracking List</h4>
        </Card>
      </Col>
      <Col sm={12}>
        <Card className="p-2">
          <h4 className="d-flex justify-content-center p-2">Search</h4>
          <Form onSubmit={handleSearch}>
            <Form.Group controlId="search-albion" className="p-3">
              <Form.Label>Search</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  aria-describedby="search-help"
                  placeholder="Search in Albion Online for name or id"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button variant="primary" type="submit">
                  <FontAwesomeIcon icon={faSearch} />
                </Button>
              </InputGroup>
              <Form.Text id="search-help" muted>
                For alliances, input the alliance id
              </Form.Text>
            </Form.Group>
          </Form>
          {renderSearchResults()}
        </Card>
      </Col>
    </Row>
  );
};

export default Track;
