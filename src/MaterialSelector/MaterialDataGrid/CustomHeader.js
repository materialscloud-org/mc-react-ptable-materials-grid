import React from "react";

import "./CustomHeader.css";

export default class CustomHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sortMode: "none",
      filterActive: false,
    };

    props.column.addEventListener("sortChanged", this.onSortChanged.bind(this));
    props.column.addEventListener(
      "filterChanged",
      this.onFilterChanged.bind(this)
    );

    this.onSortClicked.bind(this);
  }

  componentDidMount() {
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

    // let sort = (
    //   <div style={{ display: "inline-block" }}>
    //     <div
    //       onClick={this.onSortRequested.bind(this, "asc")}
    //       onTouchEnd={this.onSortRequested.bind(this, "asc")}
    //       className={`customSortDownLabel ${this.state.ascSort}`}
    //     >
    //       {/* <i className="ag-icon ag-icon-menu"></i> */}D
    //     </div>
    //     <div
    //       onClick={this.onSortRequested.bind(this, "desc")}
    //       onTouchEnd={this.onSortRequested.bind(this, "desc")}
    //       className={`customSortUpLabel ${this.state.descSort}`}
    //     >
    //       {/* <i className="ag-icon ag-icon-menu"></i> */}U
    //     </div>
    //     <div
    //       onClick={this.onSortRequested.bind(this, "")}
    //       onTouchEnd={this.onSortRequested.bind(this, "")}
    //       className={`customSortRemoveLabel ${this.state.noSort}`}
    //     >
    //       {/* <i className="ag-icon ag-icon-menu"></i> */}R
    //     </div>
    //   </div>
    // );
    let sortSymbol = "";
    if (this.state.sortMode == "asc")
      sortSymbol = (
        <div style={{ display: "flex" }}>
          1
          <i className="ag-icon ag-icon-asc" />
        </div>
      );
    if (this.state.sortMode == "desc")
      sortSymbol = <i className="ag-icon ag-icon-desc" />;

    return (
      <div className="custom-header-container">
        <div
          className="customHeaderLabel"
          onClick={this.onSortClicked.bind(this)}
        >
          {this.props.displayName}
        </div>
        {sortSymbol}
        {menu}
      </div>
    );
  }

  onMenuClicked() {
    this.props.showColumnMenu(this.menuButton);
  }

  onSortChanged() {
    let sortMode = "none";
    if (this.props.column.isSortAscending()) sortMode = "asc";
    if (this.props.column.isSortDescending()) sortMode = "desc";
    this.setState({
      sortMode: sortMode,
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
    console.log(
      this.props.column.columnApi
        .getColumnState()
        .filter((s) => s.sort !== null).length
    );
  }
}
