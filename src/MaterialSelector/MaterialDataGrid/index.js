import React from "react";

import Popover from "react-bootstrap/Popover";

import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import "./index.css";

import ColumnSelector from "./ColumnSelector";

import CustomHeader from "./CustomHeader";

import HelpButton from "../HelpButton";

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
  return params.value.toFixed(2);
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
    };
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
  };

  getColumnDefs() {
    // process the input column array to be compatible with ag-grid
    return this.props.columns.map((col) => {
      // clone input column
      let formatted_col = structuredClone(col);

      // convert colType to ag-grid related entries
      delete formatted_col["colType"];
      if (col["colType"] === "text") {
        Object.assign(formatted_col, {
          filter: "agTextColumnFilter",
        });
      } else if (col["colType"] === "integer") {
        Object.assign(formatted_col, {
          // type: "numericColumn",
          filter: "agNumberColumnFilter",
        });
      } else if (col["colType"] === "float") {
        Object.assign(formatted_col, {
          // type: "numericColumn",
          filter: "agNumberColumnFilter",
          valueFormatter: floatFormatter,
        });
      }
      Object.assign(formatted_col, {
        filterParams: { buttons: ["reset", "apply"], closeOnApply: true },
      });

      if (col["field"] === "id") {
        formatted_col["pinned"] = "left";
        formatted_col["cellRenderer"] = idCellRenderer;
      }
      if (col["field"] === "formula") {
        formatted_col["cellRenderer"] = formulaCellRenderer;
      }
      if (col["field"] === "spg_int") {
        formatted_col["cellRenderer"] = spaceGroupSymbolRenderer;
      }

      if ("unit" in col) {
        formatted_col["headerComponentParams"] = { unit: col["unit"] };
        delete formatted_col["unit"];
      }
      if ("infoText" in col) {
        formatted_col["headerComponentParams"] = { infoText: col["infoText"] };
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
            <div className="help-button-container">
              <HelpButton popover={helpPopover} placement="left" />
            </div>
            <ColumnSelector
              onColumnToggle={this.handleColumnToggle}
              colDefs={this.getColumnDefs().slice(1)}
            />
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
