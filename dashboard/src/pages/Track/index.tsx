import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Button, Card, Form, InputGroup } from "react-bootstrap";

const Track = () => {
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    console.log(`Perform search for: ${search}`);
  };

  return (
    <Card className="p-2">
      <h4 className="d-flex justify-content-center">Track</h4>
      <Form onSubmit={handleSearch}>
        <Form.Group controlId="search-albion" className="p-3">
          <Form.Label>Search</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              aria-describedby="search-help"
              placeholder="Search in Albion Online for name or id"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
    </Card>
  );
};

export default Track;
