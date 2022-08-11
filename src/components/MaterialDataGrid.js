import React from "react";

import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./MaterialDataGrid.css";

import ColumnSelector from "./ColumnSelector";

function floatFormatter(params) {
  if (params.value === null) {
    return "-";
  }
  return params.value.toFixed(2);
}

function getColumnDefs() {
  return [
    {
      field: "id",
      headerName: "ID",
      pinned: "left",
      cellRenderer: function (params) {
        return (
          <a
            href={"https://www.materialscloud.org"}
            target={"_blank"}
            style={{ textDecoration: "none", color: "mediumblue" }}
          >
            {params.value}
          </a>
        );
      },
    },
    {
      field: "formula",
      headerName: "Formula",
      width: 180,
    },
    {
      field: "n_elem",
      headerName: "Num. of elements",
      hide: true,
      filter: "agNumberColumnFilter",
      type: "numericColumn",
    },
    {
      field: "spg_int",
      headerName: "Spacegroup int.",
    },
    {
      field: "spg_num",
      headerName: "Spacegroup nr.",
      filter: "agNumberColumnFilter",
      type: "numericColumn",
    },
    {
      field: "tot_mag",
      headerName: "Total magn.",
      filter: "agNumberColumnFilter",
      type: "numericColumn",
      valueFormatter: floatFormatter,
    },
    {
      field: "abs_mag",
      headerName: "Abs. magn.",
      filter: "agNumberColumnFilter",
      type: "numericColumn",
      valueFormatter: floatFormatter,
    },
  ];
}

const defaultColDef = {
  width: 150,
  filter: "agTextColumnFilter",
  sortable: true,
  //resizable: true,
};

class MaterialDataGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: getColumnDefs(),
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

  handleColumnToggle = (e) => {
    const columnDefs = getColumnDefs();
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
        node.data.elem_array.length == this.props.ptable_filter.length;
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
            colDefs={getColumnDefs().slice(1)}
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
