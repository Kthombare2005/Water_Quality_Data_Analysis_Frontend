import React, { useEffect, useState } from "react";
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import SearchBox from "./SearchBox";
import Visualization from "./Visualization";

function DataTable() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [compareInput, setCompareInput] = useState({ state1: "", state2: "", location1: "", location2: "", parameter: "", secondary_parameter: "" });
  const [locations1, setLocations1] = useState([]);
  const [locations2, setLocations2] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparisonError, setComparisonError] = useState(null);
  const [uniqueStates, setUniqueStates] = useState([]);
  const [parameters] = useState(["TEMP", "DO", "pH", "CONDUCTIVITY", "BOD", "NITRATE_N_NITRITE_N", "FECAL_COLIFORM", "TOTAL_COLIFORM"]);

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
      })
      .catch((error) => {
        console.error("Error comparing data:", error);
        setComparisonError("Error comparing data");
        setComparisonResult(null);
      });
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  const columns = [
    { dataField: "STATION CODE", text: "Station Code", sort: true, headerStyle: { width: "100px" } },
    { dataField: "LOCATIONS", text: "Location", sort: true, headerStyle: { width: "200px" } },
    { dataField: "STATE", text: "State", sort: true, headerStyle: { width: "100px" } },
    { dataField: "TEMP", text: "Temp", sort: true, headerStyle: { width: "80px" } },
    { dataField: "DO", text: "DO", sort: true, headerStyle: { width: "60px" } },
    { dataField: "pH", text: "pH", sort: true, headerStyle: { width: "60px" } },
    { dataField: "CONDUCTIVITY", text: "Cond.", sort: true, headerStyle: { width: "100px" } },
    { dataField: "BOD", text: "BOD", sort: true, headerStyle: { width: "60px" } },
    { dataField: "NITRATE_N_NITRITE_N", text: "Nitrate", sort: true, headerStyle: { width: "80px" } },
    { dataField: "FECAL_COLIFORM", text: "F. Coliform", sort: true, headerStyle: { width: "100px" } },
    { dataField: "TOTAL_COLIFORM", text: "T. Coliform", sort: true, headerStyle: { width: "100px" } },
  ];

  const defaultSorted = [
    { dataField: "STATE", order: "asc" },
  ];

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
    <div className="container mt-3">
      <SearchBox className="search-box" value={search} onChange={setSearch} />
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
      />
      {filteredData.length > 0 && (
        <Visualization key="visualization" data={filteredData} search={search} />
      )}
      <div className="compare-form mt-5">
        <h3>Compare Water Quality Data</h3>
        <Form>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>State 1</Form.Label>
                <Form.Control as="select" name="state1" onChange={handleStateChange}>
                  <option value="">Select State</option>
                  {uniqueStates.map((state, index) => (
                    <option key={index} value={state}>{state}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Location 1</Form.Label>
                <Form.Control as="select" name="location1" onChange={handleCompareInputChange} disabled={!compareInput.state1}>
                  <option value="">Select Location</option>
                  {locations1.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>State 2</Form.Label>
                <Form.Control as="select" name="state2" onChange={handleStateChange}>
                  <option value="">Select State</option>
                  {uniqueStates.map((state, index) => (
                    <option key={index} value={state}>{state}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Location 2</Form.Label>
                <Form.Control as="select" name="location2" onChange={handleCompareInputChange} disabled={!compareInput.state2}>
                  <option value="">Select Location</option>
                  {locations2.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Primary Parameter</Form.Label>
                <Form.Control as="select" name="parameter" onChange={handleCompareInputChange}>
                  <option value="">Select Parameter</option>
                  {parameters.map((param, index) => (
                    <option key={index} value={param}>{param}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Secondary Parameter</Form.Label>
                <Form.Control as="select" name="secondary_parameter" onChange={handleCompareInputChange}>
                  <option value="">Select Parameter</option>
                  {parameters.filter(param => param !== compareInput.parameter).map((param, index) => (
                    <option key={index} value={param}>{param}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Button variant="primary" onClick={handleCompare} className="mt-3">Compare</Button>
        </Form>
        {comparisonError && <Alert variant="danger" className="mt-3">{comparisonError}</Alert>}
        {comparisonResult && (
          <div className="mt-3">
            <h4>Comparison Results</h4>
            <div>
              <h5>Location 1 Data:</h5>
              <BootstrapTable
                keyField="id"
                data={comparisonResult.location1_data}
                columns={[
                  { dataField: "LOCATIONS", text: "Location" },
                  { dataField: compareInput.parameter, text: compareInput.parameter }
                ]}
                striped
                hover
                condensed
                headerClasses="table-header"
                rowClasses="table-row"
                wrapperClasses="table-wrapper"
              />
            </div>
            <div>
              <h5>Location 2 Data:</h5>
              <BootstrapTable
                keyField="id"
                data={comparisonResult.location2_data}
                columns={[
                  { dataField: "LOCATIONS", text: "Location" },
                  { dataField: compareInput.parameter, text: compareInput.parameter }
                ]}
                striped
                hover
                condensed
                headerClasses="table-header"
                rowClasses="table-row"
                wrapperClasses="table-wrapper"
              />
            </div>
            <div className="mt-3">
              <h5>More Polluted Location: {comparisonResult.more_polluted}</h5>
              <p>{comparisonResult.reason}</p>
              <h5>Suggested Solution:</h5>
              <p>{comparisonResult.solution}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;

