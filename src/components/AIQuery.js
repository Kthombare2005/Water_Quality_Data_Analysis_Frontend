import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";

function AIQuery() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleQuerySubmit = () => {
    console.log("Query submitted:", query);
    axios
      .post("http://127.0.0.1:5000/api/ai_query", { query })
      .then((response) => {
        console.log("Response received:", response.data);
        setResponse(response.data);
        setError(null);
      })
      .catch((error) => {
        console.error("Error querying AI:", error);
        setError("Error querying AI");
        setResponse(null);
      });
  };

  return (
    <Container className="mt-3">
      <Card>
        <Card.Header>
          <h3 className="text-center">Ask AI about Water Quality</h3>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group>
              <Form.Label>Enter your question</Form.Label>
              <Form.Control
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="e.g., Explain how AI works"
              />
            </Form.Group>
            <div className="text-center">
              <Button variant="primary" onClick={handleQuerySubmit}>
                Ask AI
              </Button>
            </div>
          </Form>
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
          {response &&
            response.candidates &&
            response.candidates[0] &&
            response.candidates[0].content && (
              <div className="mt-4">
                <h4 className="text-center">AI Response</h4>
                <Card className="mt-3">
                  <Card.Body>
                    {response.candidates[0].content.parts.map((part, index) => (
                      <div
                        key={index}
                        dangerouslySetInnerHTML={{ __html: part.text }}
                      />
                    ))}
                  </Card.Body>
                </Card>
              </div>
            )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AIQuery;
