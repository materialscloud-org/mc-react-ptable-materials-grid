import React from "react";
import { saveAs } from "file-saver";
import "./DownloadButton.css";

function DownloadButton({ gridApi }) {
  const handleDownload = () => {
    const filteredData = [];
    gridApi.forEachNodeAfterFilter((node) => {
      filteredData.push(node.data);
    });

    const json = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    saveAs(blob, "materials_grid_data.json");
  };

  return (
    <button onClick={handleDownload} className="download-button">
      Download
    </button>
  );
}

export default DownloadButton;
