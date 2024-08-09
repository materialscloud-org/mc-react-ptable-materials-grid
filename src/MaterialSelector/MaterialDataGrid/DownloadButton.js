import React from "react";
import { saveAs } from "file-saver";

function DownloadButton({ gridApi }) {
  const handleDownload = () => {
    const filteredData = [];
    gridApi.forEachNodeAfterFilter((node) => {
      let row = { ...node.data };
      if ("elem_array" in row) {
        delete row.elem_array;
      }
      filteredData.push(row);
    });

    const json = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    saveAs(blob, "materials_grid_data.json");
  };

  return (
    <button onClick={handleDownload} className="aggrid-style-button">
      Download
    </button>
  );
}

export default DownloadButton;
