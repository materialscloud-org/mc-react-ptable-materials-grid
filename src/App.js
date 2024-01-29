import React, { useEffect, useState } from "react";

import "./App.css";
import MaterialSelector from "./MaterialSelector";

/* The MaterialsSelector needs two inputs:
 1) column definitions
 2) the rows data, that contains
  * entries for all the columns, with the key matching the 'field' string of the column.
  * 'elem_array', which is used in the periodic table filtering.
  * ...
 */

/* Define the columns
 some columns are special: id, formula (see the implementation)
 * colType: "text", "integer", "float" - defines formatting & filters
 * hide: true if the column is hidden initially
 * unit
 * infoText
 any additional input is passed to ag-grid column definitions (e.g. width) 
 */
function columns(info) {
  return [
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
      // width: 180,
      infoText: "The full formula in Hill notation.",
    },
    {
      field: "s",
      headerName: "test",
      colType: "float",
      hide: true,
    },
    {
      field: "n_elem",
      headerName: "Num. of elements",
      colType: "integer",
      hide: true,
    },
    {
      field: "spg_int",
      headerName: "Space group international",
      colType: "spg_symbol",
      infoText: "International short symbol for the space group.",
    },
    {
      field: "spg_num",
      headerName: "Space group number",
      colType: "integer",
    },
    {
      field: "is_theoretical",
      headerName: "Is theoretical?",
      colType: "text",
      infoText:
        "Does the source database report the structure origin as theoretical?",
      hide: true,
    },
    {
      field: "is_high_pressure",
      headerName: "Is high (exp.) pressure?",
      colType: "text",
      infoText:
        "Does the source database report the experimental pressure higher than " +
        `${info["high_pressure_threshold"]["value"]} ${info["high_pressure_threshold"]["units"]}?`,
      hide: true,
    },
    {
      field: "is_high_temperature",
      headerName: "Is high (exp.) temperature?",
      colType: "text",
      infoText:
        "Does the source database report the experimental temperature higher than " +
        `${info["high_temperature_threshold"]["value"]} ${info["high_temperature_threshold"]["units"]}?`,
      hide: true,
    },
    {
      field: "tot_mag",
      headerName: "Total magnetization",
      unit: info["total_magnetization"]["units"],
      colType: "float",
      infoText:
        "Total magnetization of the ferromagnetic solution, if it exists.",
    },
    {
      field: "abs_mag",
      headerName: "Absolute magnetization",
      unit: info["absolute_magnetization"]["units"],
      colType: "float",
    },
  ];
}

function calcElementArray(formula) {
  let formula_no_numbers = formula.replace(/[0-9]/g, "");
  let elements = formula_no_numbers.split(/(?=[A-Z])/);
  return elements;
}

function formatRows(entries) {
  let rows = [];

  // for testing a small subset:
  // entries = {
  //   "mc3d-10": entries["mc3d-10"],
  //   "mc3d-228": entries["mc3d-228"],
  //   "mc3d-10010": entries["mc3d-10010"],
  //   "mc3d-10019": entries["mc3d-10019"],
  //   "mc3d-10802": entries["mc3d-10802"],
  //   "mc3d-75049": entries["mc3d-75049"],
  // };

  Object.keys(entries).forEach((i) => {
    let comp = entries[i];
    let elemArr = calcElementArray(comp["formula"]);

    let is_theoretical = false;
    let is_high_pressure = false;
    let is_high_temperature = false;
    if ("flg" in comp) {
      if (comp["flg"].includes("th")) is_theoretical = true;
      if (comp["flg"].includes("hp")) is_high_pressure = true;
      if (comp["flg"].includes("ht")) is_high_temperature = true;
    }

    Object.keys(comp["xc"]).forEach((func) => {
      let mc3d_id = `${i}/${func}`;
      let row = {
        id: mc3d_id,
        formula: comp["formula"],
        spg_num: comp["sg"],
        tot_mag: 12345.9476,
        abs_mag: comp["xc"][func]["am"] ?? null,
        n_elem: elemArr.length,
        elem_array: elemArr,
        href: "https://www.materialscloud.org",
        is_theoretical: is_theoretical ? "yes" : "no",
        is_high_pressure: is_high_pressure ? "yes" : "no",
        is_high_temperature: is_high_temperature ? "yes" : "no",
      };
      rows.push(row);
    });
  });
  return rows;
}

async function loadDataMc3d() {
  let index_url =
    "https://dev-www.materialscloud.org/mcloud/api/v2/discover/mc3d/compounds";
  const index_response = await fetch(index_url, { method: "get" });
  const index_json = await index_response.json();

  let metadata_url =
    "https://dev-www.materialscloud.org/mcloud/api/v2/discover/mc3d/metadata";
  const metadata_response = await fetch(metadata_url, { method: "get" });
  const metadata_json = await metadata_response.json();

  // return a Promise of the correctly formatted data
  return {
    columns: columns(metadata_json.data),
    rows: formatRows(index_json.data),
  };
}

function App() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadDataMc3d().then((loadedData) => {
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
