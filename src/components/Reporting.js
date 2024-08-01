import React from 'react';

function Reporting() {
  const downloadReport = () => {
    const link = document.createElement('a');
    link.href = 'http://127.0.0.1:5000/api/data'; // Assuming you have an endpoint for downloading reports
    link.setAttribute('download', 'water_quality_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mt-5">
      <h2>Water Quality Reporting</h2>
      <button className="btn btn-primary" onClick={downloadReport}>
        Download Report
      </button>
    </div>
  );
}

export default Reporting;
