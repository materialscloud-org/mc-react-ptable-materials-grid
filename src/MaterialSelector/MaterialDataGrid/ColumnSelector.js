import React, { useState, useEffect, useRef } from "react";

import "./ColumnSelector.css";

const ColumnSelector = (props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        if (showDropdown) {
          setShowDropdown(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleColumnToggle = (e) => {
    const { name, checked } = e.target;
    let updatedColDefs = props.columnDefs.map((colDef) => ({
      ...colDef,
      hide: colDef.field === name ? !checked : colDef.hide,
    }));
    props.setColumnDefs(updatedColDefs);
  };

  let dropdownClass = "column-dropdown-content";
  if (showDropdown) {
    dropdownClass += " show";
  }

  return (
    <div>
      <div ref={wrapperRef} className="column-dropdown">
        <button
          className="aggrid-style-button"
          onClick={() => setShowDropdown((prev) => !prev)}
        >
          Show columns
        </button>
        <div className={dropdownClass}>
          <ul>
            {props.columnDefs.map(
              (item) =>
                item.field !== "id" && (
                  <li key={item.field}>
                    <label>
                      <input
                        name={item.field}
                        type="checkbox"
                        checked={!item.hide}
                        onChange={handleColumnToggle}
                      />
                      <span>{item.headerName}</span>
                    </label>
                  </li>
                )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColumnSelector;
