import React from "react";

function SearchBox({ value, onChange }) {
  return (
    <input
      type="text"
      className="search-box"
      placeholder="Search by state..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default SearchBox;
