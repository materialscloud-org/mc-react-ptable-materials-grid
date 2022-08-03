import React from "react";

import PTable from "./PTable";

import MaterialDataGrid from "./MaterialDataGrid";

const compounds_link =
  "https://dev-www.materialscloud.org/mcloud/api/v2/discover/mc3d/compounds";

function calcRows(compounds) {
  var rows = [];
  Object.keys(compounds).map((i) => {
    Object.keys(compounds[i]).map((j) => {
      var comp = compounds[i][j];
      var row = {
        id: comp["id"],
        formula: i,
        spg_int: comp["spg"],
        spg_num: comp["spgn"],
        tot_mag: "tm" in comp ? comp["tm"] : 0.0,
        abs_mag: "am" in comp ? comp["am"] : 0.0,
      };
      rows.push(row);
    });
  });
  return rows;
}

class MaterialSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: [],
    };
  }

  componentDidMount() {
    fetch(compounds_link, { method: "get" })
      .then((res) => res.json())
      .then((r) => {
        this.setState({
          rows: calcRows(r.data.compounds),
        });
      });
  }

  render() {
    return (
      <div>
        <PTable />
        <MaterialDataGrid rows={this.state.rows} />
      </div>
    );
  }
}

export default MaterialSelector;
