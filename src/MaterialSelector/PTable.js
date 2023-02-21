import React from "react";

import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";

import Popover from "react-bootstrap/Popover";

import { element_symbols } from "./ptable_data";

import "./PTable.css";

class Element extends React.Component {
  // state.selection:
  // 0 - deselected
  // 1 - include
  // 2 - exclude

  constructor(props) {
    super(props);

    this.handleOnClick = this.handleOnClick.bind(this);
    this.symbol = element_symbols[this.props.num];
  }

  handleOnClick() {
    if (this.props.disabled && this.props.selection == 0) return;
    if (this.props.onSelectionChange == null) return;
    this.props.onSelectionChange({ element: this.symbol });
  }

  render() {
    let e_class = `pt_element pt_element-${this.props.num}`;

    if (this.props.disabled && this.props.selection == 0) {
      e_class += " pt_element-disabled";
    } else {
      e_class += ` pt_element-state${this.props.selection}`;
    }

    if (!this.props.doc) {
      e_class += " nondoc";
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

const popover = (
  <Popover id="popover-basic">
    <Popover.Header as="h3">Filtering mode help</Popover.Header>
    <Popover.Body>
      <b>Exact</b>
      <br />
      Only the selected elements are allowed in the resulting chemical formula.
      For example
      <div className="doc-elements">
        <Element
          num={14}
          disabled={false}
          onSelectionChange={null}
          selection={1}
          doc={true}
        />
        <Element
          num={8}
          disabled={false}
          onSelectionChange={null}
          selection={1}
          doc={true}
        />
      </div>
      only allows for formulas in the form of Si<sub>x</sub>O<sub>y</sub>
      .
      <br />
      <b>Include/exclude</b>
      <br />
      The green selected elements must be included, while the red elements must
      not be included in the formula. For example
      <div className="doc-elements">
        <Element
          num={14}
          disabled={false}
          onSelectionChange={null}
          selection={1}
          doc={true}
        />
        <Element
          num={8}
          disabled={false}
          onSelectionChange={null}
          selection={2}
          doc={true}
        />
      </div>
      filters for materials that contain Si and any other elements except O.
    </Popover.Body>
  </Popover>
);

class SelectionMode extends React.Component {
  constructor(props) {
    super(props);
  }
  // this.props.onSelectionChange({ mode: e.currentTarget.checked })
  render() {
    return (
      <div className="selection_mode_outer">
        <OverlayTrigger trigger="click" placement="right" overlay={popover}>
          <div className="help_button">
            <span className="help_text">?</span>
          </div>
        </OverlayTrigger>
        <div
          className="selection_mode_inner"
          onChange={(e) =>
            this.props.onSelectionChange({ mode: e.target.value })
          }
        >
          <div style={{ marginBottom: "0px" }}>Filtering mode:</div>
          <label className="selection_mode_control">
            <input type="radio" name="sel_mode" value="exact" defaultChecked />
            Exact
          </label>
          <label className="selection_mode_control">
            <input type="radio" name="sel_mode" value="include" />
            Include/exclude
          </label>
        </div>
      </div>
    );
  }
}

// ------------------------------------------------------------
// Functions to determine what elements to enable/disable
function fitsFilter(elem_array, include, exclude) {
  // every element specified in "include" needs to be present
  let incl = include.every((e) => elem_array.includes(e));
  // none of the elem_array elements can be in the excluded list
  let excl = true;
  if (exclude.length != 0) excl = elem_array.every((e) => !exclude.has(e));
  return incl && excl;
}

function enabledElements(rows, filter) {
  var enabledElem = new Set();

  // for filter["mode"] == "exact"), only include is used
  let include = [];
  let exclude = new Set();
  for (const [el, sel] of Object.entries(filter["elements"])) {
    if (sel == 1) include.push(el);
    if (sel == 2) exclude.add(el);
  }

  rows.forEach((row) => {
    if (fitsFilter(row.elem_array, include, exclude)) {
      enabledElem = new Set([...enabledElem, ...row.elem_array]);
    }
    // enabledElem = new Set([...enabledElem, ...row.elem_array]);
  });
  return enabledElem;
}
// ------------------------------------------------------------

class PTable extends React.Component {
  constructor(props) {
    super(props);
  }

  makeElements = (start, end) => {
    let items = [];
    for (let i = start; i <= end; i++) {
      let symbol = element_symbols[i];
      let selection = 0;
      if (symbol in this.props.filter["elements"])
        selection = this.props.filter["elements"][symbol];

      items.push(
        <Element
          key={i}
          num={i}
          disabled={!this.enabledElems.has(symbol)}
          onSelectionChange={this.props.onSelectionChange}
          selection={selection}
          doc={false}
        />
      );
    }
    return items;
  };

  render() {
    this.enabledElems = enabledElements(this.props.rows, this.props.filter);

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
