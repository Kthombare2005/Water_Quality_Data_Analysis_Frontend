import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "../index.css"; // Import the custom CSS file

function Monitoring() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/data")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setData(response.data);
        } else {
          throw new Error("Data is not an array");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const aggregateByState = (data) => {
    const states = {};
    data.forEach((d) => {
      if (!states[d.STATE]) {
        states[d.STATE] = { pH: [], DO: [], BOD: [] };
      }
      states[d.STATE].pH.push(d.pH);
      states[d.STATE].DO.push(d.DO);
      states[d.STATE].BOD.push(d.BOD);
    });
    return states;
  };

  const aggregatedData = aggregateByState(data);

  const createChartData = (label, key) => ({
    labels: Object.keys(aggregatedData),
    datasets: [
      {
        label,
        data: Object.values(aggregatedData).map((values) => {
          const total = values[key].reduce((sum, value) => sum + value, 0);
          return total / values[key].length; // Average value for the state
        }),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
      },
    ],
  });

  const options = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          maxRotation: 90,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 20,
        },
        title: {
          display: true,
          text: "States",
        },
      },
      y: {
        title: {
          display: true,
          text: "Levels",
        },
      },
    },
  };

  return (
    <div className="container mt-5">
      <h2>Water Quality Monitoring by State</h2>
      <div className="graph-container">
        <div className="graph">
          <h4>pH Levels</h4>
          <Line data={createChartData("pH Levels", "pH")} options={options} />
        </div>
        <div className="graph">
          <h4>DO Levels</h4>
          <Line data={createChartData("DO Levels", "DO")} options={options} />
        </div>
        <div className="graph">
          <h4>BOD Levels</h4>
          <Line data={createChartData("BOD Levels", "BOD")} options={options} />
        </div>
      </div>
    </div>
  );
}

export default Monitoring;
