import React from "react";

import PTable from "./PTable";

import MaterialDataGrid from "./MaterialDataGrid";

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
    this.props.loadData().then((loaded_rows) => {
      this.setState({
        rows: loaded_rows,
      });
    });
  }

  handlePTableChange(filter_change) {
    /* filter_change = { element: new_state } */

    var new_filter = this.state.ptable_filter.slice(0);
    Object.keys(filter_change).forEach((i) => {
      if (filter_change[i] === 1 && !new_filter.includes(i)) {
        new_filter.push(i);
      }
      if (filter_change[i] !== 1 && new_filter.includes(i)) {
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
          columns={this.props.columns}
          rows={this.state.rows}
          ptable_filter={this.state.ptable_filter}
        />
      </div>
    );
  }
}

export default MaterialSelector;
