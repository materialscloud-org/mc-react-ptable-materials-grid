import React from "react";

import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import "./index.css";

import ColumnSelector from "./ColumnSelector";

import CustomHeader from "./CustomHeader";

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
  if (params.value === null) {
    return "-";
  }
  return params.value.toFixed(2);
}

function formulaCellRenderer(params) {
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

const defaultColDef = {
  width: 150,
  sortable: true,
  //resizable: true,
  icons: {
    menu: '<i class="ag-icon ag-icon-filter"/>',
    // filter: '<i class="fa fa-long-arrow-alt-down"/>',
  },
};

const components = {
  agColumnHeader: CustomHeader,
};

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
          filterParams: { buttons: ["apply", "reset"], closeOnApply: true },
        });
      } else if (col["colType"] === "integer") {
        Object.assign(formatted_col, {
          // type: "numericColumn",
          filter: "agNumberColumnFilter",
          filterParams: { buttons: ["apply", "reset"], closeOnApply: true },
        });
      } else if (col["colType"] === "float") {
        Object.assign(formatted_col, {
          // type: "numericColumn",
          filter: "agNumberColumnFilter",
          filterParams: { buttons: ["apply", "reset"], closeOnApply: true },
          valueFormatter: floatFormatter,
        });
      }

      if (col["field"] === "id") {
        formatted_col["pinned"] = "left";
        formatted_col["cellRenderer"] = idCellRenderer;
      }
      if (col["field"] === "formula") {
        formatted_col["cellRenderer"] = formulaCellRenderer;
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
      headerHeight: 50,
    };
    return (
      <div>
        <div className="grid_header_row">
          <span className="rows_text">
            Showing {this.state.numRows} entries out of {this.props.rows.length}
          </span>
          <ColumnSelector
            onColumnToggle={this.handleColumnToggle}
            colDefs={this.getColumnDefs().slice(1)}
          />
        </div>
        <div className="ag-theme-alpine">
          <div className="ag-icon ag-icon-filter" />
          <div style={{ width: "200px" }}>
            Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem
            ipsum Lorem ipsum Lorem ipsum Lorem ipsum
          </div>
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
