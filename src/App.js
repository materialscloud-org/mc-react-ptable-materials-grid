import "./App.css";
import MaterialSelector from "./MaterialSelector";

/* The MaterialsSelector needs two inputs:
 1) column definitions
 2) async function that loads data

 The data needs to be an array of row objects, whereas each row needs contain
 * entries for all the columns, with the key matching the 'field' string of the column.
 * 'elem_array', which is used in the periodic table filtering.
 */

/* Define the columns
 some columns are special: id, formula (see the implementation)
 * colType: "text", "integer", "float" - defines formatting & filters
 * hide: true if the column is hidden initially
 * unit
 * infoText
 any additional input is passed to ag-grid column definitions (e.g. width) 
 */
const columns = [
  {
    field: "id",
    headerName: "ID",
    colType: "text",
    infoText: "The unique MC3D identifier of a structure.",
  },
  {
    field: "formula",
    headerName: "Formula",
    colType: "text",
    // width: 180,
    infoText: "The full formula in Hill notation.",
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
    colType: "text",
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
    infoText: "Does the source database report the structure as theoretical?",
  },
  {
    field: "is_high_pressure",
    headerName: "Is high (exp.) pressure?",
    colType: "text",
    infoText:
      "Does the source database report the experimental pressure higher than X KPa?",
  },
  {
    field: "is_high_temperature",
    headerName: "Is high (exp.) temperature?",
    colType: "text",
    infoText:
      "Does the source database report the experimental temperature higher than X °C?",
  },
  {
    field: "tot_mag",
    headerName: "Total magnetization",
    unit: "μB/cell",
    colType: "float",
  },
  {
    field: "abs_mag",
    headerName: "Absolute magnetization",
    unit: "μB/cell",
    colType: "float",
  },
];

function calcElementArray(formula) {
  var formula_no_numbers = formula.replace(/[0-9]/g, "");
  var elements = formula_no_numbers.split(/(?=[A-Z])/);
  return elements;
}

function formatRows(entries) {
  var rows = [];

  // for testing a small subset:
  // var entries = {
  //   "mc3d-10": entries["mc3d-10"],
  //   "mc3d-228": entries["mc3d-228"],
  //   "mc3d-10010": entries["mc3d-10010"],
  //   "mc3d-10019": entries["mc3d-10019"],
  //   "mc3d-10802": entries["mc3d-10802"],
  //   "mc3d-75049": entries["mc3d-75049"],
  // };

  Object.keys(entries).forEach((i) => {
    var comp = entries[i];
    var elemArr = calcElementArray(comp["formula"]);
    var exp_obs = true;
    if ("flg" in comp && comp["flg"].includes("th")) exp_obs = false;

    Object.keys(comp["xc"]).forEach((func) => {
      var mc3d_id = `${i}/${func}`;
      var row = {
        id: mc3d_id,
        formula: comp["formula"],
        spg_num: comp["sg"],
        tot_mag: comp["xc"][func]["tm"] ?? null,
        abs_mag: comp["xc"][func]["am"] ?? null,
        n_elem: elemArr.length,
        elem_array: elemArr,
        href: "https://www.materialscloud.org",
      };
      rows.push(row);
    });
  });
  return rows;
}

async function loadDataMc3d() {
  let compounds_url =
    "https://dev-www.materialscloud.org/mcloud/api/v2/discover/mc3d/compounds";

  const response = await fetch(compounds_url, { method: "get" });
  const json = await response.json();

  // return a Promise of the correctly formatted data
  return formatRows(json.data);
}

function App() {
  return (
    <div className="App">
      <MaterialSelector columns={columns} loadData={loadDataMc3d} />
    </div>
  );
}

export default App;
