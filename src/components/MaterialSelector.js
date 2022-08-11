import React from "react";

import PTable from "./PTable";

import MaterialDataGrid from "./MaterialDataGrid";

const compounds_link =
  "https://dev-www.materialscloud.org/mcloud/api/v2/discover/mc3d/compounds";

function calcElementArray(formula) {
  var formula_no_numbers = formula.replace(/[0-9]/g, "");
  var elements = formula_no_numbers.split(/(?=[A-Z])/);
  return elements;
}

function calcRows(compounds) {
  var rows = [];
  //var compounds = { Ag5O4Si: compounds_["Ag5O4Si"] };
  Object.keys(compounds).map((i) => {
    Object.keys(compounds[i]).map((j) => {
      var comp = compounds[i][j];
      var elemArr = calcElementArray(i);
      var row = {
        id: comp["id"],
        formula: i,
        spg_int: comp["spg"],
        spg_num: comp["spgn"],
        tot_mag: "tm" in comp ? comp["tm"] : null,
        abs_mag: "am" in comp ? comp["am"] : null,
        n_elem: elemArr.length,
        elem_array: elemArr,
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
      ptable_filter: [],
    };
    this.handlePTableChange = this.handlePTableChange.bind(this);
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

  handlePTableChange(filter_change) {
    /* filter_change = { element: new_state } */

    var new_filter = this.state.ptable_filter.slice(0);
    Object.keys(filter_change).map((i) => {
      if (filter_change[i] == 1 && !new_filter.includes(i)) {
        new_filter.push(i);
      }
      if (filter_change[i] != 1 && new_filter.includes(i)) {
        new_filter.splice(new_filter.indexOf(i), 1);
      }
    });

    if (new_filter !== this.state.ptable_filter) {
      this.setState({ ptable_filter: new_filter });
    }
  }

  render() {
    return (
      <div>
        <PTable onSelectionChange={this.handlePTableChange} />
        <div style={{ marginTop: "5px" }}></div>
        <MaterialDataGrid
          rows={this.state.rows}
          ptable_filter={this.state.ptable_filter}
        />
      </div>
    );
  }
}

export default MaterialSelector;
