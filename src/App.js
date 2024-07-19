import React, { useEffect, useState } from "react";

import "./App.css";
import MaterialSelector from "./MaterialSelector";
import example_data from './example_data.json';

/*
  The MaterialsSelector needs two inputs:
    1) column definitions; and
    2) the rows data.
*/

/*
  The column definitions of the MaterialsSelector need to follow the format of
  
  {
    field: str,        // Internal label for the column
    headerName: str,   // Column title displayed in header
    unit: str,         // unit displayed in header
    colType: str,      // type that determines formatting & filtering, see below
    infoText: str,     // info text in the header menu
    hide: bool,        // whether to hide the column by default
  },

  and any additional input is passed to ag-grid column definitions.

  Possible colTypes are the following (specific ones first, more general later):
    * "id" - always on the left; and href to the detail page;
    * "formula" - special formatting with subscripts
    * "spg_symbol" - special formatting
    * "text"
    * "integer"
    * "float"
    * ...
  
  There are two mandatory columns: 'id' and 'formula'.
*/
const COLUMNS = [
  {
    field: "id",
    headerName: "ID",
    colType: "id",
    infoText: "The unique MC3D identifier of each structure.",
  },
  {
    field: "formula",
    headerName: "Formula",
    colType: "formula",
    infoText: "The full formula in Hill notation.",
  },
  {
    field: "spg_int",
    headerName: "Space group international",
    colType: "spg_symbol",
    infoText: "International short symbol for the space group.",
    //hide: true,
  },
  {
    field: "spg_num",
    headerName: "Space group number",
    colType: "integer",
  },
  {
    field: "bravais_lat",
    headerName: "Bravais lattice",
    colType: "text",
  },
  {
    field: "is_theoretical",
    headerName: "Is source theoretical?",
    colType: "boolean",
    infoText:
      "Does the source database report the structure origin as theoretical?",
  },
  {
    field: "tot_mag",
    headerName: "Total magnetization",
    unit: "μB/cell",
    colType: "float",
    infoText:
      "Total magnetization of the ferromagnetic solution, if it exists.",
  },
]

/*
  The row data for the MaterialsSelector needs to contain
    * key-value for each column definition (with matching the "field" of the column);
    * 'href' - this link is added to the id column;
*/
function formatRows() {

  // the example data contains everything except for href
  // add a link to the current page for each entry.

  let rows = example_data.map(entry => {
    return { ...entry, href: "."}
  })

  return rows;
}

async function loadData() {
  return {
    columns: COLUMNS,
    rows: formatRows(),
  };
}

function App() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadData().then((loadedData) => {
      setColumns(loadedData.columns);
      setRows(loadedData.rows);
    });
  }, []);

  return (
    <div className="App">
      <MaterialSelector columns={columns} rows={rows} />
    </div>
  );
}

export default App;
