import React from "react";

import "./CustomHeader.css";

export default class CustomHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sortMode: "none",
      multiSort: false,
      sortIndex: null,
      filterActive: false,
    };
  }

  componentDidMount() {
    this.props.column.addEventListener(
      "filterChanged",
      this.onFilterChanged.bind(this)
    );

    // note: same eventlistener can be applied to the column api
    // but the sortIndex is not updated correctly in that case
    this.props.api.addEventListener(
      "sortChanged",
      this.onSortChanged.bind(this)
    );

    this.onSortClicked.bind(this);

    this.onSortChanged();
    this.onFilterChanged();
  }

  render() {
    let menu = (
      <div
        ref={(menuButton) => {
          this.menuButton = menuButton;
        }}
        className="customHeaderMenuButton"
        onClick={this.onMenuClicked.bind(this)}
      >
        {this.state.filterActive ? (
          <div className="filter-div-active">
            <i className="ag-icon ag-icon-filter" />
          </div>
        ) : (
          <div className="filter-div-inactive">
            <i className="ag-icon ag-icon-filter" />
          </div>
        )}
      </div>
    );

    let sortSymbol = "";
    if (this.state.sortMode == "asc")
      sortSymbol = (
        <div style={{ display: "flex" }}>
          {this.state.multiSort && this.state.sortIndex + 1}
          <i className="ag-icon ag-icon-asc" />
        </div>
      );
    if (this.state.sortMode == "desc")
      sortSymbol = (
        <div style={{ display: "flex" }}>
          {this.state.multiSort && this.state.sortIndex + 1}
          <i className="ag-icon ag-icon-desc" />
        </div>
      );

    return (
      <div className="custom-header-container">
        <div
          className="custom-header-label-container"
          onClick={this.onSortClicked.bind(this)}
        >
          {sortSymbol}
          <div className="customHeaderLabel">
            <span>{this.props.displayName}</span>
            {"unit" in this.props && (
              <div className="unit-label">({this.props.unit})</div>
            )}
          </div>
        </div>
        {menu}
      </div>
    );
  }

  onMenuClicked() {
    this.props.showColumnMenu(this.menuButton);
  }

  onSortChanged() {
    if (!this.props.columnApi) {
      // note: for ag-grid <v28.2.0 the correct columnApi path was
      // this.props.column.columnApi
      console.log("COLUMNAPI undefined!");
      return;
    }

    let sortMode = "none";
    if (this.props.column.isSortAscending()) sortMode = "asc";
    if (this.props.column.isSortDescending()) sortMode = "desc";

    let numSortActive = this.props.columnApi
      .getColumnState()
      .filter((s) => s.sort !== null).length;

    let multiSort = numSortActive > 1;

    let sortIndex = this.props.column.getSortIndex();

    this.setState({
      sortMode: sortMode,
      multiSort: multiSort,
      sortIndex: sortIndex,
    });
  }

  onFilterChanged() {
    this.setState({
      filterActive: this.props.column.isFilterActive(),
    });
  }

  onSortClicked(event) {
    // multi sort if Shift key is pressed
    this.props.progressSort(event.shiftKey);
  }
}
