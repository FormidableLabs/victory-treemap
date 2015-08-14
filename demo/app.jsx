/*global document:false*/
import React from "react";
import {VictoryTreemap} from "../src/index";
import flare from "./flare";

class App extends React.Component {
  render() {
    return (
      <div className="demo">
        <VictoryTreemap data={flare}/>
      </div>
    );
  }
}

const content = document.getElementById("content");

React.render(<App/>, content);
