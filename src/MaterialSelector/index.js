import React from "react";

import PTable from "./PTable";

import MaterialDataGrid from "./MaterialDataGrid";

import "./index.css";

class MaterialSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ptableFilter: { mode: "include", elements: {} },
    };
    /* ptableFilter:
      mode - "exact", "include"
      elements - {Ag: num_clicked} (e.g. 1 - one click, 2 - two clicks)
    */

    this.handlePTableChange = this.handlePTableChange.bind(this);
  }

  handlePTableChange(filter_change) {
    // filter_change = {mode: new_mode, element: clicked_element}

    // console.log(filter_change);

    let filter_mode = this.state.ptableFilter["mode"];

    let new_filter = structuredClone(this.state.ptableFilter);
    if ("mode" in filter_change) {
      new_filter["mode"] = filter_change["mode"];
      filter_mode = filter_change["mode"];
      // if filter mode changes from "include" to "exact",
      // deselect all the excluded elements
      if (filter_change["mode"] == "exact") {
        for (const [el, sel] of Object.entries(new_filter["elements"])) {
          if (sel > 1) delete new_filter["elements"][el];
        }
      }
    }

    if ("element" in filter_change) {
      let el = filter_change["element"];
      if (!(filter_change["element"] in new_filter["elements"])) {
        new_filter["elements"][el] = 1;
      } else {
        new_filter["elements"][el] += 1;
      }
      // if selection crosses the number of states, deselect
      if (filter_mode == "exact") {
        if (new_filter["elements"][el] == 2) delete new_filter["elements"][el];
      } else if (filter_mode == "include") {
        if (new_filter["elements"][el] == 3) delete new_filter["elements"][el];
      }
    }

    this.setState({ ptableFilter: new_filter });
  }

  render() {
    let is_loaded = this.props.columns.length > 0;
    return (
      <div className="material_selector_container">
        <PTable
          onSelectionChange={this.handlePTableChange}
          filter={this.state.ptableFilter}
          rows={this.props.rows}
        />
        <div style={{ marginTop: "5px" }}></div>
        {is_loaded ? (
          <MaterialDataGrid
            columns={this.props.columns}
            rows={this.props.rows}
            ptable_filter={this.state.ptableFilter}
          />
        ) : (
          <div
            style={{
              marginTop: "50px",
              border: "solid 2px rgb(220, 220, 220)",
              height: "600px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            Loading...
          </div>
        )}
      </div>
    );
  }
}

export default MaterialSelector;
