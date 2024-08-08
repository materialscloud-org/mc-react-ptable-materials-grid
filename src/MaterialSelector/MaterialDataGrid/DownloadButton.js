import React from "react";
import { saveAs } from "file-saver";

function DownloadButton({ gridApi }) {
  const handleDownload = () => {
    const filteredData = [];
    gridApi.forEachNodeAfterFilter((node) => {
      if ("elem_array" in node.data) {
        delete node.data.elem_array;
      }
      filteredData.push(node.data);
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
