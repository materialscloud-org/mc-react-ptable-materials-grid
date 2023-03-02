import OverlayTrigger from "react-bootstrap/OverlayTrigger";

import "./HelpButton.css";

/* Note, you should put this element in a div with specified width, height and font-size */
function HelpButton(props) {
  return (
    <OverlayTrigger trigger="click" placement="right" overlay={props.popover}>
      <div className="help-button">?</div>
    </OverlayTrigger>
  );
}

export default HelpButton;