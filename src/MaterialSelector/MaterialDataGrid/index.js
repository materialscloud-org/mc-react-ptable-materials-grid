import React, {
  forwardRef,
  useEffect,
  useState,
  useImperativeHandle,
} from "react";

import Popover from "react-bootstrap/Popover";

import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import "./index.css";

import ColumnSelector from "./ColumnSelector";

import CustomHeader from "./CustomHeader";

import { HelpButton } from "mc-react-library";

import ResetButton from "./ResetButton";

import DownloadButton from "./DownloadButton";

function idCellRenderer(params) {
  return (
    <a
      href={params.data.href}
      target={"_blank"}
      rel={"noreferrer"}
      style={{ textDecoration: "none", color: "mediumblue" }}
    >
      {params.value}
    </a>
  );
}

function floatFormatter(params) {
  if (params.value == null) {
    return "-";
  }
  if (
    Math.abs(params.value) >= 1e5 ||
    (Math.abs(params.value) < 0.01 && params.value !== 0)
  ) {
    return params.value.toExponential(2);
  }
  return params.value.toFixed(2);
}

function textFormatter(params) {
  if (params.value == null) {
    return "-";
  }
  return params.value;
}

function numberFormatter(params) {
  if (params.value == null) {
    return "-";
  }
  return params.value;
}

function formulaCellRenderer(params) {
  if (params.value == null) {
    return "-";
  }
  // split formula into array of elements and numbers
  let f_split = params.value.split(/(\d+)/);
  return (
    <span>
      {f_split.map((v, index) => {
        if (v.match(/\d+/)) {
          return <sub key={index}>{v}</sub>;
        }
        return v;
      })}
    </span>
  );
}

function spaceGroupSymbolRenderer(params) {
  if (params.value == null) {
    return "-";
  }
  let nextIsSub = false;
  return (
    <span>
      {params.value.split("").map((v, index) => {
        if (v === "_") {
          nextIsSub = true;
          return null;
        }
        if (nextIsSub) {
          nextIsSub = false;
          return <sub key={index}>{v}</sub>;
        }
        return v;
      })}
    </span>
  );
}

function getColumnDefs(columns) {
  // Convert the input columns to the component into a
  // column array that is compatible with ag-grid
  return columns.map((col) => {
    // clone input column
    let formatted_col = structuredClone(col);

    // convert colType to ag-grid related entries
    delete formatted_col["colType"];
    // basic column types
    if (col["colType"] === "text") {
      Object.assign(formatted_col, {
        filter: "agTextColumnFilter",
        valueFormatter: textFormatter,
      });
    } else if (col["colType"] === "integer") {
      Object.assign(formatted_col, {
        // type: "numericColumn",
        filter: "agNumberColumnFilter",
        valueFormatter: numberFormatter,
      });
    } else if (col["colType"] === "float") {
      Object.assign(formatted_col, {
        // type: "numericColumn",
        filter: "agNumberColumnFilter",
        valueFormatter: floatFormatter,
      });
    } else if (col["colType"] === "boolean") {
      Object.assign(formatted_col, {
        filter: "agTextColumnFilter",
        valueFormatter: textFormatter,
      });
      // more special column types
    } else if (col["colType"] === "id") {
      Object.assign(formatted_col, {
        filter: "agTextColumnFilter",
        valueFormatter: textFormatter,
        pinned: "left",
        cellRenderer: idCellRenderer,
      });
    } else if (col["colType"] === "formula") {
      Object.assign(formatted_col, {
        filter: "agTextColumnFilter",
        valueFormatter: textFormatter,
        cellRenderer: formulaCellRenderer,
      });
    } else if (col["colType"] === "spg_symbol") {
      Object.assign(formatted_col, {
        filter: "agTextColumnFilter",
        valueFormatter: textFormatter,
        cellRenderer: spaceGroupSymbolRenderer,
      });
    }

    Object.assign(formatted_col, {
      filterParams: { buttons: ["reset", "apply"], closeOnApply: true },
    });

    formatted_col["headerComponentParams"] = {};

    if ("unit" in col) {
      formatted_col["headerComponentParams"].unit = col["unit"];
      delete formatted_col["unit"];
    }
    if ("infoText" in col) {
      formatted_col["headerComponentParams"].infoText = col["infoText"];
      delete formatted_col["infoText"];
    }

    return formatted_col;
  });
}

const defaultColDef = {
  width: 160, // only applies to pinned columns (id)
  minWidth: 140,
  flex: 1,
  sortable: true,
  resizable: false,
};

const components = {
  agColumnHeader: CustomHeader,
};

const helpPopover = (
  <Popover id="popover-basic">
    <Popover.Header as="h3">Materials Grid help</Popover.Header>
    <Popover.Body style={{ textAlign: "justify" }}>
      <p>
        The Materials Grid, shown below, contains all the filtered materials.
      </p>
      <p>
        Selected properties are shown in columns. Click <b>Show columns</b> to
        hide/show available columns.
      </p>
      <p>
        The grid can be sorted based on any column by clicking on the
        corresponding label in the header. <b>Holding down shift</b> allows to
        sort based on multiple columns.
      </p>
      Each column has a menu that contains any additional information about the
      column, and allows to filter the list of materials. Active filters are
      indicated by the menu icon turning into a blue filter icon.
    </Popover.Body>
  </Popover>
);

const MaterialDataGrid = forwardRef((props, ref) => {
  const [gridApi, setGridApi] = useState(null);
  const [numRows, setNumRows] = useState(null);
  const [anyColFilterActive, setAnyColFilterActive] = useState(null);

  useImperativeHandle(ref, () => ({
    getFilteredRows: () => {
      const filteredData = [];
      if (gridApi) {
        gridApi.forEachNodeAfterFilter((node) => {
          let row = { ...node.data };
          // filter out internal, implementation-specific fields
          if ("elem_array" in row) {
            delete row.elem_array;
          }
          filteredData.push(row);
        });
      }
      return filteredData;
    },
  }));

  useEffect(() => {
    if (gridApi) {
      gridApi.onFilterChanged();
    }
  }, [props.ptable_filter]);

  const onGridReady = (params) => {
    setGridApi(params.api);
    params.api.onFilterChanged();
  };

  const handleColumnToggle = (e) => {
    let columnDefs = getColumnDefs(props.columns);
    columnDefs.forEach((colDef) => {
      colDef.hide = false;
      if (colDef.field in e) {
        colDef.hide = !e[colDef.field];
      }
    });
    if (gridApi) {
      gridApi.setGridOption("columnDefs", columnDefs);
    }
  };

  // -------------------------------
  // External filter handling

  const isExternalFilterPresent = () => {
    return Object.keys(props.ptable_filter["elements"]).length > 0;
  };

  const updateNumRows = () => {
    if (gridApi) {
      let nRows = gridApi.getDisplayedRowCount();
      if (numRows !== nRows) setNumRows(nRows);
    }
  };

  const doesExternalFilterPass = (node) => {
    if (node.data) {
      if (props.ptable_filter["mode"] === "exact") {
        let selectedElements = Object.keys(props.ptable_filter["elements"]);
        let len_match = node.data.elem_array.length === selectedElements.length;
        let incl = node.data.elem_array.every((e) =>
          selectedElements.includes(e)
        );
        return len_match && incl;
      }

      if (props.ptable_filter["mode"] === "include") {
        let include = [];
        let exclude = [];
        for (const [el, sel] of Object.entries(
          props.ptable_filter["elements"]
        )) {
          if (sel === 1) include.push(el);
          if (sel === 2) exclude.push(el);
        }
        // every element specified in "include" needs to be present
        let incl = include.every((e) => node.data.elem_array.includes(e));
        // none of the elem_array elements can be in the excluded list
        let excl = node.data.elem_array.every((e) => !exclude.includes(e));
        return incl && excl;
      }
    }
    return true;
  };

  // -------------------------------

  const onFilterChanged = () => {
    updateNumRows();

    if (gridApi) {
      const filterModel = gridApi.getFilterModel();
      setAnyColFilterActive(Object.keys(filterModel).length > 0);
    }
  };

  const onRowDataUpdated = () => {
    updateNumRows();
  };

  const gridOptions = {
    pagination: true,
    paginationPageSize: 20,
    suppressMenuHide: true,
    enableCellTextSelection: true,
    ensureDomOrder: true,
    domLayout: "autoHeight",
    headerHeight: 54,
  };

  let columnDefs = getColumnDefs(props.columns);

  return (
    <div>
      <div className="grid_header_row">
        <span className="rows_text">
          Showing {numRows} entries out of {props.rows.length}
        </span>
        <div className="grid_header_row_right_side">
          <HelpButton popover={helpPopover} placement="left" />
          {/* <DownloadButton gridApi={gridApi} /> */}
          <ResetButton
            gridApi={gridApi}
            anyColFilterActive={anyColFilterActive}
          />
          <ColumnSelector
            onColumnToggle={handleColumnToggle}
            colDefs={columnDefs.slice(1)}
          />
        </div>
      </div>
      <div className="ag-theme-alpine">
        <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={props.rows}
          gridOptions={gridOptions}
          onGridReady={onGridReady}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          onFilterChanged={onFilterChanged}
          onRowDataUpdated={onRowDataUpdated}
          components={components}
        />
      </div>
    </div>
  );
});

export default MaterialDataGrid;
