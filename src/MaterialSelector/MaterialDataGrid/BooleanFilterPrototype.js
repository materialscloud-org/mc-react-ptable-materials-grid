import React, { useState, useImperativeHandle, forwardRef } from "react";

/*
  NOTE: this is a prototype on how to potentially implement custom column
  filters. Currently not used.
*/

const BooleanFilter = forwardRef((props, ref) => {
  const [filterValue, setFilterValue] = useState("");

  useImperativeHandle(ref, () => ({
    isFilterActive() {
      return filterValue !== "";
    },
    doesFilterPass(params) {
      const value = params.data[props.colDef.field];
      if (filterValue === "true") {
        return value === true;
      } else if (filterValue === "false") {
        return value === false;
      }
      return true;
    },
    getModel() {
      if (filterValue === "") {
        return null;
      }
      return { value: filterValue };
    },
    setModel(model) {
      setFilterValue(model ? model.value : "");
    },
    onParentModelChanged(parentModel) {
      setFilterValue(parentModel ? parentModel.value : "");
    },
  }));

  const applyFilter = () => {
    props.filterChangedCallback();
  };

  const resetFilter = () => {
    setFilterValue("");
    props.filterChangedCallback();
  };

  return (
    <div style={{ padding: 10 }}>
      <select
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
      >
        <option value="">All</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
      <div style={{ marginTop: 10 }}>
        <button onClick={applyFilter}>Apply</button>
        <button onClick={resetFilter} style={{ marginLeft: 5 }}>
          Reset
        </button>
      </div>
    </div>
  );
});

export default BooleanFilter;
