import React from "react";

import Popover from "react-bootstrap/Popover";

import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import "./index.css";

import ColumnSelector from "./ColumnSelector";

import CustomHeader from "./CustomHeader";

import HelpButton from "../HelpButton";

import ResetButton from "./ResetButton";

import DownloadButton from "../Download";

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
  if (params.value >= 1e5 || (params.value < 0.01 && params.value !== 0)) {
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
        if (v == "_") {
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

const defaultColDef = {
  width: 150,
  sortable: true,
  //resizable: true,
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

class MaterialDataGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: this.getColumnDefs(),
      numRows: null,
      filteredRows: [], 
    };
    this.gridApi = null;
    this.gridColumnApi = null; 
  }

  componentDidUpdate(prevProps) {
    if (prevProps.ptable_filter !== this.props.ptable_filter) {
      // external filter changed
      this.gridApi.onFilterChanged();
    }
  }

  onGridReady = (params) => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.onFilterChanged();
    this.setState({ filteredRows: this.props.rows });
    params.api.addEventListener('filterChanged', () => {
      const filteredRows = this.getFilteredRows(params.api);
      this.setState({ filteredRows });
    });
  };

  getFilteredRows = (gridApi) => {
    const filteredRows = [];
    const count = gridApi.getDisplayedRowCount();
  
    for (let i = 0; i < count; i++) {
      const rowNode = gridApi.getDisplayedRowAtIndex(i);
      filteredRows.push(rowNode.data);
    }
  
    return filteredRows;
  };

  getColumnDefs() {
    // process the input column array to be compatible with ag-grid
    return this.props.columns.map((col) => {
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
        // more specific column types
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

  handleColumnToggle = (e) => {
    const columnDefs = this.getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.hide = false;
      if (colDef.field in e) {
        colDef.hide = !e[colDef.field];
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  };

  // -------------------------------
  // External filter handling

  isExternalFilterPresent = () => {

    return Object.keys(this.props.ptable_filter["elements"]).length > 0;
  };

  updateNumRows = () => {
    if (this.gridApi) {
      let nRows = this.gridApi.getDisplayedRowCount();
      if (this.state.numRows != nRows) this.setState({ numRows: nRows });
    }
  };
  
  doesExternalFilterPass = (node) => {
    if (node.data) {
      if (this.props.ptable_filter["mode"] == "exact") {
        let selectedElements = Object.keys(
          this.props.ptable_filter["elements"]
        );
        let len_match = node.data.elem_array.length === selectedElements.length;
        let incl = node.data.elem_array.every((e) =>
          selectedElements.includes(e)
        );
        return len_match && incl;
      }

      if (this.props.ptable_filter["mode"] == "include") {
        let include = [];
        let exclude = [];
        for (const [el, sel] of Object.entries(
          this.props.ptable_filter["elements"]
        )) {
          if (sel == 1) include.push(el);
          if (sel == 2) exclude.push(el);
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

  render() {
    const gridOptions = {
      pagination: true,
      paginationPageSize: 20,
      suppressMenuHide: true,
      enableCellTextSelection: true,
      ensureDomOrder: true,
      domLayout: "autoHeight",
      headerHeight: 54,
    };
    return (
      <div>
        <div className="grid_header_row">
          <span className="rows_text">
            Showing {this.state.numRows} entries out of {this.props.rows.length}
          </span>
          <div className="grid_header_row_right_side">
            <ResetButton gridApi={this.gridApi} doesExternalFilterPass={this.doesExternalFilterPass} rows={this.props.rows} filteredElements={this.state.filteredRows} />
            <div className="help-button-container">
              <HelpButton popover={helpPopover} placement="left" />
            </div>
            <ColumnSelector
              onColumnToggle={this.handleColumnToggle}
              colDefs={this.getColumnDefs().slice(1)}
            />
            <DownloadButton filteredElements={this.state.filteredRows} />
          </div>
        </div>
        <div className="ag-theme-alpine">
          <AgGridReact
            columnDefs={this.state.columnDefs}
            defaultColDef={defaultColDef}
            rowData={this.props.rows}
            gridOptions={gridOptions}
            onGridReady={this.onGridReady}
            isExternalFilterPresent={this.isExternalFilterPresent}
            doesExternalFilterPass={this.doesExternalFilterPass}
            onFilterChanged={this.updateNumRows}
            onRowDataUpdated={this.updateNumRows}
            components={components}
          />
        </div>
      </div>
    );
  }
}

export default MaterialDataGrid;
