import React from "react";

import "./ColumnSelector.css";

function parseInitTicks(colDefs) {
  var initTicks = {};
  colDefs.forEach((cd) => {
    initTicks[cd.field] = "hide" in cd ? !cd.hide : true;
  });
  return initTicks;
}

class ColumnSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ticks: parseInitTicks(this.props.colDefs),
      dropdown_show: false,
    };
    this.handleToggle = this.handleToggle.bind(this);
    this.showCheckboxes = this.showCheckboxes.bind(this);
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleToggle = (e) => {
    let newTicks = { ...this.state.ticks };
    newTicks[e.target.name] = e.target.checked;
    this.setState({ ticks: newTicks });
    this.props.onColumnToggle(newTicks);
  };

  showCheckboxes = (e) => {
    this.setState({ dropdown_show: !this.state.dropdown_show });
  };

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      if (this.state.dropdown_show) {
        this.setState({ dropdown_show: false });
      }
    }
  }

  render() {
    let dropdownClass = "column-dropdown-content";
    if (this.state.dropdown_show) {
      dropdownClass += " show";
    }

    return (
      <div>
        <div ref={this.setWrapperRef} className="column-dropdown">
          <button className="column-dropdown-btn" onClick={this.showCheckboxes}>
            Show columns
          </button>
          <div className={dropdownClass}>
            <ul>
              {this.props.colDefs.map((item) => (
                <li key={item.field}>
                  <label>
                    <input
                      name={item.field}
                      type="checkbox"
                      checked={this.state.ticks[item.field]}
                      onChange={this.handleToggle}
                    />
                    <span>{item.headerName}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default ColumnSelector;
