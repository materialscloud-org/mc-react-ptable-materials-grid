import React, { useState, useEffect } from 'react';
import "./ResetButton.css";

function ResetButton({ gridApi, doesExternalFilterPass, rows, filteredElements }) {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    setIsButtonDisabled(rows.length === filteredElements.length);
  }, [rows, filteredElements]);

  const handleResetFilters = () => {
    if (!isButtonDisabled) {
      resetFilters(gridApi, doesExternalFilterPass);
    }
  };

  return (
    <button
      className={`reset-button ${isButtonDisabled ? 'disabled' : ''}`}
      onClick={handleResetFilters}
      disabled={isButtonDisabled}
    >
      Reset column filters
    </button>
  );
}

// Function to reset filters across all columns
function resetFilters(gridApi, doesExternalFilterPass) {
  // Reset filters for each column
  gridApi.forEachNode((node) => {
    console.log(node.column);
    gridApi.destroyFilter(node.column, false);
  });

  // Retain any external filter
  if (doesExternalFilterPass) {
    gridApi.setFilterModel({
      model: [
        {
          type: 'externalFilter',
          filter: doesExternalFilterPass,
        },
      ],
    });
  } else {
    // Remove any existing filter model
    gridApi.setFilterModel(null);
  }
}

export default ResetButton;