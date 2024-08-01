import React, { useState } from "react";

function SolutionDesignForm() {
  const [solution, setSolution] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Solution Design:", solution);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="solution">Solution Design:</label>
        <input
          type="text"
          id="solution"
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

export default SolutionDesignForm;
