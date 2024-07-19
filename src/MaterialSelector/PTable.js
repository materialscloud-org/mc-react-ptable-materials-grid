import React from "react";

import Popover from "react-bootstrap/Popover";

import HelpButton from "./HelpButton";

import { elementsInfo, elementClassColors } from "./ptable_data";
import { RGB_Log_Blend } from "./utils";

import "./PTable.css";

export class Element extends React.Component {
  // state.selection:
  // 0 - deselected
  // 1 - include
  // 2 - exclude

  constructor(props) {
    super(props);

    this.handleOnClick = this.handleOnClick.bind(this);
    this.symbol = elementsInfo[this.props.num]["sym"];
    let elementClass = elementsInfo[this.props.num]["class"];
    this.color = elementClassColors[elementClass];
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
      <div
        className={e_class}
        style={{
          backgroundColor: RGB_Log_Blend(0.5, this.color, "rgb(220, 220, 220)"),
        }}
        onClick={this.handleOnClick}
      >
        <div className="elem_num">{this.props.num}</div>
        <div className="elem_sym">{this.symbol}</div>
      </div>
    );
  }
}

const helpPopover = (
  <Popover id="popover-basic">
    <Popover.Header as="h3">Filtering mode help</Popover.Header>
    <Popover.Body style={{ textAlign: "justify" }}>
      <b>Include/exclude elements</b>
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
      <br />
      <b>Only selected elements</b>
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
      only allows for formulas in the form of Si<sub>x</sub>O<sub>y</sub>.
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
        <div
          className="selection_mode_inner"
          onChange={(e) =>
            this.props.onSelectionChange({ mode: e.target.value })
          }
        >
          <div style={{ marginBottom: "2px" }}>Elements filtering mode:</div>
          <label className="selection_mode_control">
            <input
              type="radio"
              name="sel_mode"
              value="include"
              defaultChecked
            />
            Include/exclude
          </label>
          <label className="selection_mode_control">
            <input type="radio" name="sel_mode" value="exact" />
            Only selected
          </label>
        </div>
        <div className="help-button-container">
          <HelpButton popover={helpPopover} placement="right" />
        </div>
      </div>
    );
  }
}

// ------------------------------------------------------------
// Functions to determine what elements to enable/disable
function fitsFilter(elem_array, numClicked) {
  let elemSet = new Set(elem_array)
  let include = numClicked[1]
  let exclude = numClicked[2]
  // every element specified in "include" needs to be present in elemSet
  let incl = [...include].every(e => elemSet.has(e));
  // none of the elem_array elements can be in the excluded list
  let excl = [...elemSet].every(e => !exclude.has(e));
  return incl && excl;
}

function enabledElements(rows, filter) {
  /*
    For the exact filtering mode, the same logic as in the "include" mode also
    makes the most sense. It could be that when selecting elements, no rows are
    shown, but the remaining enabled elements can produce rows. 
  */
  let enabledElem = new Set();

  // turn filter into a set of elements based on number of times clicked
  let numClicked = {
    1: new Set(),
    2: new Set(),
  }
  for (const [el, sel] of Object.entries(filter["elements"])) {
    numClicked[sel].add(el)
  }

  rows.forEach((row) => {
    if (fitsFilter(row.elem_array, numClicked)) {
      enabledElem = new Set([...enabledElem, ...row.elem_array]);
    }
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
      let symbol = elementsInfo[i]["sym"];
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
