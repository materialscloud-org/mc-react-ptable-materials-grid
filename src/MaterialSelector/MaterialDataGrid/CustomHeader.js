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
    let filterMenu = (
      <div
        ref={(menuButton) => {
          this.menuButton = menuButton;
        }}
        className="customHeaderMenuButton"
        onClick={this.onMenuClicked.bind(this)}
        onTouchEnd={this.onMenuClicked.bind(this)}
      >
        {this.state.filterActive ? (
          <div className="filter-div active">
            <i className="ag-icon ag-icon-filter" />
          </div>
        ) : (
          <div className="filter-div">
            <i className="ag-icon ag-icon-menu" />
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

    let columnTitle = (
      <div
        className="custom-header-label-container"
        onClick={this.onSortClicked.bind(this)}
        onTouchEnd={this.onSortClicked.bind(this)}
      >
        {sortSymbol}
        <div className="customHeaderLabel">
          <span>{this.props.displayName}</span>
          {"unit" in this.props && (
            <div className="unit-label">({this.props.unit})</div>
          )}
        </div>
      </div>
    );

    // wrap the column title in tooltip
    // let columnTitleWithTooltip = (
    //   <OverlayTrigger
    //     delay={500}
    //     overlay={
    //       <Tooltip
    //         style={{
    //           position: "fixed",
    //         }}
    //       >
    //         text <br /> Click to sort!
    //       </Tooltip>
    //     }
    //   >
    //     {columnTitle}
    //   </OverlayTrigger>
    // );

    return (
      <div className="custom-header-container">
        {columnTitle}
        {filterMenu}
      </div>
    );
  }

  onMenuClicked() {
    this.props.showColumnMenu(this.menuButton);

    // hacky way to add extra text in the filter menu:
    const targetDiv = document.querySelector(".ag-menu.ag-ltr.ag-popup-child");

    if (targetDiv) {
      targetDiv.style.maxWidth = "200px";

      const divApplyLabel = document.createElement("div");
      divApplyLabel.style.margin = "5px 10px 0px 10px";
      divApplyLabel.innerHTML = "<b>Apply filter:</b>";
      targetDiv.prepend(divApplyLabel);

      if (this.props.infoText != null) {
        const divInfo = document.createElement("div");
        divInfo.style.margin = "10px 10px 0px 10px";
        // divInfo.style.background = "red";
        divInfo.style.textAlign = "justify";
        divInfo.innerHTML = this.props.infoText;
        targetDiv.prepend(divInfo);
      }
    }
  }

  onSortChanged() {
    if (!this.props.api) {
      console.log("CustomHeader: api undefined!");
      return;
    }

    let sortMode = "none";
    if (this.props.column.isSortAscending()) sortMode = "asc";
    if (this.props.column.isSortDescending()) sortMode = "desc";

    let numSortActive = this.props.api
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
