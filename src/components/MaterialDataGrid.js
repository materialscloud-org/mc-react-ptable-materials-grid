import React from "react";

import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./MaterialDataGrid.css";

import ColumnSelector from "./ColumnSelector";

function idCellRenderer(params) {
  return (
    <a
      href={"https://www.materialscloud.org"}
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
};

class MaterialDataGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: this.getColumnDefs(),
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
          type: "numericColumn",
          filter: "agNumberColumnFilter",
        });
      } else if (col["colType"] === "float") {
        Object.assign(formatted_col, {
          type: "numericColumn",
          filter: "agNumberColumnFilter",
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
    return this.props.ptable_filter.length > 0;
  };

  doesExternalFilterPass = (node) => {
    if (node.data) {
      // option 1: check if formula and filter elements match exactly
      let len_match =
        node.data.elem_array.length === this.props.ptable_filter.length;
      let incl = node.data.elem_array.every((e) =>
        this.props.ptable_filter.includes(e)
      );
      return len_match && incl;
      // option 2: check if all formula elements are in the filter
      //return node.data.elem_array.every((e) =>
      //  this.props.ptable_filter.includes(e)
      //);
      // option 3: check if all filter elements are in the formula
      //return this.props.ptable_filter.every((e) =>
      //  node.data.elem_array.includes(e)
      //);
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
    };
    return (
      <div>
        <div style={{ textAlign: "right" }}>
          <ColumnSelector
            onColumnToggle={this.handleColumnToggle}
            colDefs={this.getColumnDefs().slice(1)}
          />
        </div>
        <div className="ag-theme-alpine" style={{ width: 960 }}>
          <AgGridReact
            columnDefs={this.state.columnDefs}
            defaultColDef={defaultColDef}
            rowData={this.props.rows}
            gridOptions={gridOptions}
            onGridReady={this.onGridReady}
            isExternalFilterPresent={this.isExternalFilterPresent}
            doesExternalFilterPass={this.doesExternalFilterPass}
          />
        </div>
      </div>
    );
  }
}

export default MaterialDataGrid;
