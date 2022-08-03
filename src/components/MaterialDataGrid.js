import React from "react";

import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";

import "./MaterialDataGrid.css";

const columns = [
  {
    field: "id",
    headerName: "MC3D-ID",
    flex: 1,
    minWidth: 100,
    maxWidth: 200,
    type: "string",
  },
  {
    field: "formula",
    headerName: "Formula",
    flex: 1,
    minWidth: 100,
    maxWidth: 200,
    type: "string",
  },
  {
    field: "spg_int",
    headerName: "Spacegroup int.",
    flex: 1,
    minWidth: 100,
    maxWidth: 200,
    type: "string",
  },
  {
    field: "spg_num",
    headerName: "Spacegroup nr.",
    flex: 1,
    minWidth: 100,
    maxWidth: 200,
    type: "number",
  },
  {
    field: "tot_mag",
    headerName: "Total magn.",
    flex: 1,
    minWidth: 100,
    maxWidth: 200,
    type: "number",
  },
  {
    field: "abs_mag",
    headerName: "Abs. magn.",
    flex: 1,
    minWidth: 100,
    maxWidth: 200,
    type: "number",
  },
];

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarQuickFilter />
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
    </GridToolbarContainer>
  );
}

class MaterialDataGrid extends React.Component {
  constructor(props) {
    super(props);
    this.count = 0;
  }

  render() {
    return (
      <div className="MaterialDataGrid">
        <DataGrid
          rows={this.props.rows}
          columns={columns}
          autoHeight
          rowHeight={30}
          disableSelectionOnClick={true}
          disableColumnMenu={true}
          components={{
            Toolbar: CustomToolbar,
          }}
          componentsProps={{
            toolbar: {
              quickFilterProps: { debounceMs: 500 },
            },
          }}
        />
      </div>
    );
  }
}

export default MaterialDataGrid;
