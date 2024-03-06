import React from 'react';
import "./ResetButton.css"

function ResetButton({ gridApi, doesExternalFilterPass }) {
  return (
    <button className='reset-button' onClick={() => resetFilters(gridApi, doesExternalFilterPass)}>
      Reset Filters
    </button>
  );
}

function resetFilters(gridApi, doesExternalFilterPass) {
  // Reset filters for each column
  gridApi.forEachNode((node) => {
    gridApi.destroyFilter(node.column, false);
  });

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
