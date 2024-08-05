import React, { useEffect, useState } from "react";
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import {
  Form,
  Button,
  Row,
  Col,
  Alert,
  Container,
  Card,
  Navbar,
  Nav,
} from "react-bootstrap";
import SearchBox from "./SearchBox";
import Visualization from "./Visualization";

function DataTable() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [compareInput, setCompareInput] = useState({
    state1: "",
    state2: "",
    location1: "",
    location2: "",
    parameter: "",
    secondary_parameter: "",
  });
  const [locations1, setLocations1] = useState([]);
  const [locations2, setLocations2] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparisonError, setComparisonError] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [uniqueStates, setUniqueStates] = useState([]);
  const [parameters] = useState([
    "TEMP",
    "DO",
    "pH",
    "CONDUCTIVITY",
    "BOD",
    "NITRATE_N_NITRITE_N",
    "FECAL_COLIFORM",
    "TOTAL_COLIFORM",
  ]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/data")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setData(response.data);
          setFilteredData(response.data);
        } else {
          throw new Error("Data is not an array");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
      });

    axios
      .get("http://127.0.0.1:5000/api/unique_states")
      .then((response) => {
        setUniqueStates(response.data);
      })
      .catch((error) => {
        console.error("Error fetching unique states:", error);
      });
  }, []);

  useEffect(() => {
    setFilteredData(
      data.filter((item) =>
        item.STATE.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, data]);

  const handleStateChange = (e) => {
    const { name, value } = e.target;
    setCompareInput({ ...compareInput, [name]: value });

    if (name === "state1") {
      axios
        .post("http://127.0.0.1:5000/api/locations_in_state", { state: value })
        .then((response) => {
          setLocations1(response.data);
        })
        .catch((error) => {
          console.error("Error fetching locations:", error);
        });
    } else if (name === "state2") {
      axios
        .post("http://127.0.0.1:5000/api/locations_in_state", { state: value })
        .then((response) => {
          setLocations2(response.data);
        })
        .catch((error) => {
          console.error("Error fetching locations:", error);
        });
    }
  };

  const handleCompareInputChange = (e) => {
    const { name, value } = e.target;
    setCompareInput({ ...compareInput, [name]: value });
  };

  const handleCompare = () => {
    axios
      .post("http://127.0.0.1:5000/api/compare", compareInput)
      .then((response) => {
        setComparisonResult(response.data);
        setComparisonError(null);
        handleAIQuery(response.data); // Trigger AI query with the comparison result
      })
      .catch((error) => {
        console.error("Error comparing data:", error);
        setComparisonError("Error comparing data");
        setComparisonResult(null);
      });
  };

  const handleAIQuery = (comparisonData) => {
    const query = `
      Provide a detailed comparison between ${compareInput.location1} and ${
      compareInput.location2
    } for ${compareInput.parameter} and ${
      compareInput.secondary_parameter
    } based on the following data:
      ${JSON.stringify(comparisonData)}

      Format the response with the following sections:
      1. Reason why it is more polluted: (Provide detailed reasoning)
      2. Causes: (List all potential causes)
      3. Consequences: (Explain the consequences in detail)
      4. Suggested Solution: (Give comprehensive solutions)
    `;
    console.log("AI Query:", query);
    axios
      .post("http://127.0.0.1:5000/api/ai_query", { query })
      .then((response) => {
        console.log("AI Response received:", response.data);
        const content = response.data.candidates[0].content.parts
          .map((part) => part.text)
          .join("\n");
        setAiResponse(formatAIResponse(content));
      })
      .catch((error) => {
        console.error("Error querying AI:", error);
        setAiResponse("Error fetching AI response");
      });
  };

  const formatAIResponse = (response) => {
    return response.split("\n").map((line, index) => {
      if (line.startsWith("##")) {
        return (
          <h4 key={index}>
            <strong>{line.replace("##", "").trim()}</strong>
          </h4>
        );
      }
      if (line.startsWith("**")) {
        return (
          <p key={index}>
            <strong>{line.replace(/\*\*/g, "").trim()}</strong>
          </p>
        );
      }
      if (line.startsWith("* ")) {
        return <p key={index}>{line.replace("* ", "").trim()}</p>;
      }
      return <p key={index}>{line}</p>;
    });
  };

  const handleGenerateReport = () => {
    axios
      .post("http://127.0.0.1:5000/api/generate_report", { data: filteredData })
      .then((response) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(
          new Blob([response.data], { type: "application/pdf" })
        );
        link.download = "AI_Water_Quality_Report.pdf";
        link.click();
      })
      .catch((err) => {
        console.error("Error generating report:", err);
      });
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  const columns = [
    {
      dataField: "STATION CODE",
      text: "Station Code",
      sort: true,
      headerStyle: { width: "100px" },
    },
    {
      dataField: "LOCATIONS",
      text: "Location",
      sort: true,
      headerStyle: { width: "200px" },
    },
    {
      dataField: "STATE",
      text: "State",
      sort: true,
      headerStyle: { width: "150px" },
    },
    {
      dataField: "TEMP",
      text: "Temp",
      sort: true,
      headerStyle: { width: "60px" },
    },
    { dataField: "DO", text: "DO", sort: true, headerStyle: { width: "60px" } },
    { dataField: "pH", text: "pH", sort: true, headerStyle: { width: "60px" } },
    {
      dataField: "CONDUCTIVITY",
      text: "Cond.",
      sort: true,
      headerStyle: { width: "100px" },
    },
    {
      dataField: "BOD",
      text: "BOD",
      sort: true,
      headerStyle: { width: "60px" },
    },
    {
      dataField: "NITRATE_N_NITRITE_N",
      text: "Nitrate",
      sort: true,
      headerStyle: { width: "80px" },
    },
    {
      dataField: "FECAL_COLIFORM",
      text: "F. Coliform",
      sort: true,
      headerStyle: { width: "100px" },
    },
    {
      dataField: "TOTAL_COLIFORM",
      text: "T. Coliform",
      sort: true,
      headerStyle: { width: "100px" },
    },
  ];

  const defaultSorted = [{ dataField: "STATE", order: "asc" }];

  const pagination = paginationFactory({
    page: 1,
    sizePerPage: 10,
    lastPageText: ">>",
    firstPageText: "<<",
    nextPageText: ">",
    prePageText: "<",
    showTotal: true,
    alwaysShowAllBtns: true,
    onPageChange: function (page, sizePerPage) {
      console.log("page", page);
      console.log("sizePerPage", sizePerPage);
    },
    onSizePerPageChange: function (page, sizePerPage) {
      console.log("page", page);
      console.log("sizePerPage", sizePerPage);
    },
  });

  return (
    <Container className="mt-3">
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#">Water Quality Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link href="#visualization">Data Visualization</Nav.Link>
            <Nav.Link href="#comparison">Water Quality Comparison</Nav.Link>
            <Nav.Link href="#" onClick={handleGenerateReport}>
              Generate AI Report
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <SearchBox
        className="search-box mb-4"
        value={search}
        onChange={setSearch}
      />
      <div style={{ overflowX: "auto" }}>
        <BootstrapTable
          keyField="id"
          data={filteredData}
          columns={columns}
          pagination={pagination}
          defaultSorted={defaultSorted}
          striped
          hover
          condensed
          headerClasses="table-header"
          rowClasses="table-row"
          wrapperClasses="table-wrapper"
          bordered={false}
          tableStyle={{ tableLayout: "fixed" }}
        />
      </div>
      {filteredData.length > 0 && (
        <Visualization
          key="visualization"
          data={filteredData}
          search={search}
        />
      )}
      <Card id="comparison" className="compare-form mt-5">
        <Card.Header>
          <h3 className="text-center">Compare Water Quality Data</h3>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>State 1</Form.Label>
                  <Form.Control
                    as="select"
                    name="state1"
                    onChange={handleStateChange}
                  >
                    <option value="">Select State</option>
                    {uniqueStates.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Location 1</Form.Label>
                  <Form.Control
                    as="select"
                    name="location1"
                    onChange={handleCompareInputChange}
                    disabled={!compareInput.state1}
                  >
                    <option value="">Select Location</option>
                    {locations1.map((location, index) => (
                      <option key={index} value={location}>
                        {location}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>State 2</Form.Label>
                  <Form.Control
                    as="select"
                    name="state2"
                    onChange={handleStateChange}
                  >
                    <option value="">Select State</option>
                    {uniqueStates.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Location 2</Form.Label>
                  <Form.Control
                    as="select"
                    name="location2"
                    onChange={handleCompareInputChange}
                    disabled={!compareInput.state2}
                  >
                    <option value="">Select Location</option>
                    {locations2.map((location, index) => (
                      <option key={index} value={location}>
                        {location}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Primary Parameter</Form.Label>
                  <Form.Control
                    as="select"
                    name="parameter"
                    onChange={handleCompareInputChange}
                  >
                    <option value="">Select Parameter</option>
                    {parameters.map((param, index) => (
                      <option key={index} value={param}>
                        {param}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Secondary Parameter</Form.Label>
                  <Form.Control
                    as="select"
                    name="secondary_parameter"
                    onChange={handleCompareInputChange}
                  >
                    <option value="">Select Parameter</option>
                    {parameters
                      .filter((param) => param !== compareInput.parameter)
                      .map((param, index) => (
                        <option key={index} value={param}>
                          {param}
                        </option>
                      ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <div className="text-center">
              <Button
                variant="primary"
                onClick={handleCompare}
                className="mt-3"
              >
                Compare
              </Button>
            </div>
          </Form>
          {comparisonError && (
            <Alert variant="danger" className="mt-3">
              {comparisonError}
            </Alert>
          )}
          {comparisonResult && (
            <div className="mt-4">
              <h4 className="text-center">Comparison Results</h4>
              <Card className="mt-3">
                <Card.Header>Location 1 Data:</Card.Header>
                <Card.Body>
                  <BootstrapTable
                    keyField="id"
                    data={comparisonResult.location1_data}
                    columns={[
                      { dataField: "LOCATIONS", text: "Location" },
                      {
                        dataField: compareInput.parameter,
                        text: compareInput.parameter,
                      },
                      {
                        dataField: compareInput.secondary_parameter,
                        text: compareInput.secondary_parameter,
                      },
                    ]}
                    striped
                    hover
                    condensed
                    headerClasses="table-header"
                    rowClasses="table-row"
                    wrapperClasses="table-wrapper"
                    bordered={false}
                  />
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Header>Location 2 Data:</Card.Header>
                <Card.Body>
                  <BootstrapTable
                    keyField="id"
                    data={comparisonResult.location2_data}
                    columns={[
                      { dataField: "LOCATIONS", text: "Location" },
                      {
                        dataField: compareInput.parameter,
                        text: compareInput.parameter,
                      },
                      {
                        dataField: compareInput.secondary_parameter,
                        text: compareInput.secondary_parameter,
                      },
                    ]}
                    striped
                    hover
                    condensed
                    headerClasses="table-header"
                    rowClasses="table-row"
                    wrapperClasses="table-wrapper"
                    bordered={false}
                  />
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Header>
                  More Polluted Location: {comparisonResult.more_polluted}
                </Card.Header>
                <Card.Body>
                  <p>
                    <strong>Reason why it is more polluted:</strong>{" "}
                    {comparisonResult.detailed_analysis.reason}
                  </p>
                  <p>
                    <strong>Causes:</strong>{" "}
                    {comparisonResult.detailed_analysis.causes}
                  </p>
                  <p>
                    <strong>Consequences:</strong>{" "}
                    {comparisonResult.detailed_analysis.consequences}
                  </p>
                  <p>
                    <strong>Suggested Solution:</strong>{" "}
                    {comparisonResult.detailed_analysis.solution}
                  </p>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Header>AI Detailed Comparison</Card.Header>
                <Card.Body>{aiResponse}</Card.Body>
              </Card>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default DataTable;
