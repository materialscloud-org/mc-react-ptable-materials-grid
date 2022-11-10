import React from "react";

import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";

import { element_symbols } from "./ptable_data";

import "./PTable.css";

class Element extends React.Component {
  // state.selection:
  // 0 - deselected
  // 1 - include
  // 2 - exclude
  // 3 - only

  constructor(props) {
    super(props);

    this.handleOnClick = this.handleOnClick.bind(this);
    this.symbol = element_symbols[this.props.num];
  }

  handleOnClick() {
    if (this.props.disabled) return;
    this.props.onSelectionChange({ element: this.symbol });
  }

  render() {
    let e_class = `element element-${this.props.num}`;

    let selection = 0;
    if (this.symbol in this.props.filter["elements"])
      selection = this.props.filter["elements"][this.symbol];

    if (this.props.disabled) {
      e_class += " element-disabled";
    } else {
      e_class += ` element-state${selection}`;
    }

    if (this.props.num >= 57 && this.props.num <= 71) {
      e_class += " lanthanide";
    }

    return (
      <div className={e_class} onClick={this.handleOnClick}>
        <div className="elem_num">{this.props.num}</div>
        <div className="elem_sym">{this.symbol}</div>
      </div>
    );
  }
}

class SelectionMode extends React.Component {
  constructor(props) {
    super(props);
  }
  // this.props.onSelectionChange({ mode: e.currentTarget.checked })
  render() {
    let mode = this.props.filter["mode"];
    return (
      <div className="selection_mode">
        <div style={{ marginBottom: "6px" }}>Filtering mode:</div>
        <ToggleButtonGroup
          type="radio"
          name="options"
          defaultValue={"exact"}
          onChange={(e) => this.props.onSelectionChange({ mode: e })}
        >
          <ToggleButton
            style={{ fontSize: "14px" }}
            id="tgl-btn-1"
            value={"exact"}
          >
            Exact
          </ToggleButton>
          <ToggleButton
            style={{ fontSize: "14px" }}
            id="tgl-btn-2"
            value={"include"}
          >
            Incl./excl.
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    );
  }
}

class PTable extends React.Component {
  constructor(props) {
    super(props);
  }

  makeElements = (start, end) => {
    let items = [];
    for (let i = start; i <= end; i++) {
      var disabled = false;
      if (i > 86) {
        disabled = true;
      }
      items.push(
        <Element
          key={i}
          num={i}
          disabled={disabled}
          onSelectionChange={this.props.onSelectionChange}
          filter={this.props.filter}
        />
      );
    }
    return items;
  };

  render() {
    return (
      <div className="ptable_outer">
        <div className="ptable">
          <SelectionMode
            onSelectionChange={this.props.onSelectionChange}
            filter={this.props.filter}
          />
          {this.makeElements(1, 56)}
          {this.makeElements(72, 88)}
          {this.makeElements(104, 118)}
          {this.makeElements(57, 71)}
          {this.makeElements(89, 103)}
        </div>
      </div>
    );
  }
}

export default PTable;
