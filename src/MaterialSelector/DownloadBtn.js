import React, { useState } from "react";
import { saveAs } from "file-saver";
import "./DownloadBtn.css"

function DownloadButton({ filteredElements }) {
  const [downloadText, setDownloadText] = useState("");

  const handleDownload = () => {
    const filteredIds = filteredElements ? filteredElements.map((elem) => elem.id) : [];
    const downloadString = filteredIds.join("\n");
    setDownloadText(downloadString);

    const blob = new Blob([downloadString], { type: "text/plain" });
    saveAs(blob, "filtered_ids.txt"); 
  };

  return (
    <button onClick={handleDownload} className="download-button">
      Download IDs
      <span className="notification">{filteredElements.length}</span>
    </button>
  );
}

export default DownloadButton;
