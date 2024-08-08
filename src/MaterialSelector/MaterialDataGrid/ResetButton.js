import React from "react";
import "./ResetButton.css";

function resetFilters(gridApi) {
  if (gridApi) {
    const filterModel = gridApi.getFilterModel();
    if (Object.keys(filterModel).length > 0) {
      gridApi.setFilterModel({});
    }
  }
}

function ResetButton({ gridApi, anyColFilterActive }) {
  const handleResetFilters = () => {
    resetFilters(gridApi);
  };

  return (
    <button
      className={`reset-button ${anyColFilterActive ? "" : "disabled"}`}
      onClick={handleResetFilters}
      disabled={!anyColFilterActive}
    >
      Reset column filters
    </button>
  );
}

export default ResetButton;
