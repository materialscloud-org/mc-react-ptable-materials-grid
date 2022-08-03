import React from "react";

import { element_symbols } from "./data";

import "./PTable.css";

class ElementClickable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      symbol: element_symbols[this.props.num],
      link: "http://www.google.com",
    };
  }

  render() {
    return (
      <a className="element" href={this.state.link}>
        {this.state.symbol}
      </a>
    );
  }
}

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
  }

  render() {
    let symbol = element_symbols[this.props.num];
    let e_class = `element element-${this.props.num}`;
    let on_click = null;

    if (this.props.disabled) {
      e_class += " element-disabled";
    } else {
      e_class += ` element-state${this.state.selection}`;
      // Note, in react, functions beside arrow functions have to be "bound" in the constructor
      on_click = () => {
        this.setState({ selection: (this.state.selection + 1) % 4 });
      };
    }

    if (this.props.num >= 58 && this.props.num <= 71) {
      e_class += " lanthanide";
    }

    return (
      <div className={e_class} onClick={on_click}>
        <div className="elem_num">{this.props.num}</div>
        <div className="elem_sym">{symbol}</div>
      </div>
    );
  }
}

class PTable extends React.Component {
  makeElements = (start, end) => {
    let items = [];
    for (let i = start; i <= end; i++) {
      var disabled = false;
      if (i === 2 || i > 86) {
        disabled = true;
      }
      items.push(<Element key={i} num={i} disabled={disabled} />);
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
          {
            <div className="help_button">
              <div className="help_text">?</div>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default PTable;
