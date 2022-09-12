import React from "react";

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
    this.state = {
      selection: 0,
    };
    this.handleOnClick = this.handleOnClick.bind(this);

    this.symbol = element_symbols[this.props.num];
  }

  handleOnClick() {
    if (this.props.disabled) return;

    let new_sel = (this.state.selection + 1) % 4;
    this.setState({ selection: new_sel });

    this.props.onSelectionChange({ [this.symbol]: new_sel });
  }

  render() {
    let e_class = `element element-${this.props.num}`;

    if (this.props.disabled) {
      e_class += " element-disabled";
    } else {
      e_class += ` element-state${this.state.selection}`;
    }

    if (this.props.num >= 58 && this.props.num <= 71) {
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

class PTable extends React.Component {
  constructor(props) {
    super(props);
  }

  makeElements = (start, end) => {
    let items = [];
    for (let i = start; i <= end; i++) {
      var disabled = false;
      if (i === 2 || i > 86) {
        disabled = true;
      }
      items.push(
        <Element
          key={i}
          num={i}
          disabled={disabled}
          onSelectionChange={this.props.onSelectionChange}
        />
      );
    }
    return items;
  };

  render() {
    return (
      <div className="ptable_outer">
        <div className="ptable">
          {this.makeElements(1, 57)}
          {this.makeElements(72, 89)}
          {this.makeElements(104, 118)}
          {this.makeElements(58, 71)}
          {this.makeElements(90, 103)}
        </div>
      </div>
    );
  }
}

export default PTable;
