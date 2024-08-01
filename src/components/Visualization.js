import React from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { Container, Row, Col } from "react-bootstrap";

function Visualization({ data = [], search }) {
  const aggregateDataByField = (field) => {
    const result = {};
    data.forEach((item) => {
      const key = search ? item["STATION CODE"] : item.STATE;
      if (result[key]) {
        result[key].push(item[field]);
      } else {
        result[key] = [item[field]];
      }
    });
    return result;
  };

  const createChartData = (field) => {
    const aggregatedData = aggregateDataByField(field);
    const labels = Object.keys(aggregatedData);
    const values = labels.map((label) => {
      const labelData = aggregatedData[label];
      const total = labelData.reduce((acc, value) => acc + (value || 0), 0);
      return total / labelData.length;
    });

    return {
      labels: labels,
      datasets: [
        {
          label: field,
          data: values,
          backgroundColor: labels.map(
            () =>
              `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                Math.random() * 255
              )}, ${Math.floor(Math.random() * 255)}, 0.2)`
          ),
          borderColor: labels.map(
            () =>
              `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                Math.random() * 255
              )}, ${Math.floor(Math.random() * 255)}, 1)`
          ),
          borderWidth: 1,
        },
      ],
      tooltipLabels: labels, // Custom labels for tooltips
    };
  };

  const chartOptions = (title, yLabel, field) => {
    const aggregatedData = aggregateDataByField(field);
    const values = Object.values(aggregatedData).flat();
    const maxValue = Math.max(...values);

    return {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: title,
        },
        tooltip: {
          callbacks: {
            title: (context) => {
              const index = context[0]?.dataIndex;
              return context[0]?.dataset?.tooltipLabels?.[index] || "No data";
            },
            label: (context) => {
              const label = context.dataset.label || "";
              const value = context.raw;
              return `${label}: ${value}`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            font: {
              size: 14,
            },
          },
          title: {
            display: true,
            text: search ? "Station Codes" : "States",
            font: {
              size: 16,
              weight: "bold",
            },
          },
        },
        y: {
          beginAtZero: true,
          max: Math.ceil(maxValue * 1.1), // Add some padding to the maximum value
          ticks: {
            font: {
              size: 14,
            },
          },
          title: {
            display: true,
            text: yLabel,
            font: {
              size: 16,
              weight: "bold",
            },
          },
        },
      },
    };
  };

  const chartDataAndOptions = [
    {
      field: "TEMP",
      title: "Temperature",
      yLabel: "Temperature (°C)",
    },
    {
      field: "DO",
      title: "Dissolved Oxygen",
      yLabel: "DO (mg/L)",
    },
    {
      field: "pH",
      title: "pH",
      yLabel: "pH",
    },
    {
      field: "CONDUCTIVITY",
      title: "Conductivity",
      yLabel: "Conductivity (µS/cm)",
    },
    {
      field: "NITRATE_N_NITRITE_N",
      title: "Nitrate and Nitrite",
      yLabel: "Nitrate/Nitrite (mg/L)",
    },
  ];

  return (
    <Container className="visualization-container">
      <h2 className="visualization-heading mb-4">
        Data Visualization {search && `of ${data[0]?.STATE}`}
      </h2>
      <Row>
        {chartDataAndOptions.map(({ field, title, yLabel }) => (
          <Col md={6} className="mb-4" key={field}>
            <h3>{title}</h3>
            <Bar
              data={createChartData(field)}
              options={chartOptions(title, yLabel, field)}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Visualization;
