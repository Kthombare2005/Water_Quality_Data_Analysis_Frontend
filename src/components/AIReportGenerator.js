import React, { useState } from 'react';
import axios from 'axios';

function AIReportGenerator() {
    const [query, setQuery] = useState('');
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);

    const handleQueryChange = (event) => {
        setQuery(event.target.value);
    };

    const generateReport = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/ai_query', { query });
            setReport(response.data);
            setError(null);
        } catch (error) {
            setError('Error generating report');
            setReport(null);
        }
    };

    return (
        <div>
            <h2>AI Report Generator</h2>
            <textarea
                value={query}
                onChange={handleQueryChange}
                placeholder="Enter your query here"
            />
            <button onClick={generateReport}>Generate Report</button>
            {report && (
                <div>
                    <h3>AI Response:</h3>
                    <pre>{JSON.stringify(report, null, 2)}</pre>
                </div>
            )}
            {error && <p>{error}</p>}
        </div>
    );
}

export default AIReportGenerator;
