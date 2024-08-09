import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import PTable from "./PTable";
import MaterialDataGrid from "./MaterialDataGrid";
import "./index.css";

function calcElementArray(formula) {
  let formula_no_numbers = formula.replace(/[0-9]/g, "");
  let elements = formula_no_numbers.split(/(?=[A-Z])/);
  return elements;
}

function modifyRows(rows, columns) {
  /*
    The raw rows need slight modification for the data grid:
      * elem_array needs to be added, that is used for ptable filtering;
      * boolean values need to be converted to 'yes'/'no'/null.
        - todo: this probably should be automatically handled by a custom bool column.
  */

  let booleanFields = columns
    .filter((col) => col.colType === "boolean")
    .map((col) => col.field);

  const modifiedRows = rows.map((row) => {
    const newRow = { ...row, elem_array: calcElementArray(row["formula"]) };
    booleanFields.forEach((field) => {
      if (field in newRow) {
        newRow[field] = newRow[field] ? "yes" : "no";
      }
    });
    return newRow;
  });
  return modifiedRows;
}

const MaterialSelector = forwardRef((props, ref) => {
  /* 
    ptableFilter:
      mode - "exact", "include"
      elements - {Ag: num_clicked} (e.g. 1 - one click, 2 - two clicks)
  */
  const [ptableFilter, setPtableFilter] = useState({
    mode: "include",
    elements: {},
  });
  const [modifiedRows, setModifiedRows] = useState([]);

  useEffect(() => {
    let modifiedRows = modifyRows(props.rows, props.columns);
    setModifiedRows(modifiedRows);
  }, [props.rows, props.columns]);

  const handlePTableChange = useCallback(
    (filter_change) => {
      let filter_mode = ptableFilter["mode"];
      let new_filter = structuredClone(ptableFilter);

      if ("mode" in filter_change) {
        new_filter["mode"] = filter_change["mode"];
        filter_mode = filter_change["mode"];
        if (filter_change["mode"] === "exact") {
          for (const [el, sel] of Object.entries(new_filter["elements"])) {
            if (sel > 1) delete new_filter["elements"][el];
          }
        }
      }

      if ("element" in filter_change) {
        let el = filter_change["element"];
        if (!(filter_change["element"] in new_filter["elements"])) {
          new_filter["elements"][el] = 1;
        } else {
          new_filter["elements"][el] += 1;
        }
        if (filter_mode === "exact") {
          if (new_filter["elements"][el] === 2)
            delete new_filter["elements"][el];
        } else if (filter_mode === "include") {
          if (new_filter["elements"][el] === 3)
            delete new_filter["elements"][el];
        }
      }

      setPtableFilter(new_filter);
    },
    [ptableFilter]
  );

  const isLoaded = props.columns.length > 0;

  return (
    <div className="material_selector_container">
      <PTable
        onSelectionChange={handlePTableChange}
        filter={ptableFilter}
        rows={modifiedRows}
      />
      <div style={{ marginTop: "5px" }}></div>
      {isLoaded ? (
        <MaterialDataGrid
          ref={ref}
          columns={props.columns}
          rows={modifiedRows}
          ptable_filter={ptableFilter}
        />
      ) : (
        <div
          style={{
            marginTop: "50px",
            border: "solid 2px rgb(220, 220, 220)",
            height: "600px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
});

export default MaterialSelector;
