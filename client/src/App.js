import React, { Component } from "react";
import ManageNodes from "./manageNodes.jsx";

class App extends Component {
  state = {};

  render() {
    return (
      <div className="custom-root-container">
        <ManageNodes />
      </div>
    );
  }
}

export default App;
