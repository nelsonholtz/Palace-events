import React from "react";
import "../src/css/toolbar.css";

const Toolbar = ({ onDrawCircle }) => {
  return (
    <div className="toolbar">
      <h3>Toolbar</h3>
      <button onClick={onDrawCircle} style={{ marginBottom: "10px" }}>
        Make Circle
      </button>
    </div>
  );
};

export default Toolbar;
