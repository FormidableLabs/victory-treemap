import React from "react";
import Radium from "radium";
import d3 from "d3";

/* when they are modularized */
// import colorScale from "d3-color-scale";
// import d3Treemap from "d3-layout-treemap"

@Radium
class VictoryTreemap extends React.Component {
  handleCellClick (node) {
    console.log(node);
  }
  drawCells (cells) {
    var cellComponents = cells.map((cell, index) => {
      return (
        this.props.cellSVG(
          cell,
          index,
          this.handleCellClick.bind(this, cell),
          this.props.colorScale
        )
      );
    });
    return cellComponents;
  }
  render() {
    console.log("props", this.props)
    /* move into functions to strategically recompute */
    let treemap = d3.layout
                    .treemap()
                    .size([
                      this.props.width,
                      this.props.height
                    ])
                    .sticky(this.props.sticky)
                    .value(function(d) {
                      return d.size;
                    });
    /* move into function, don't recreate this in render */
    let cells = treemap.nodes(this.props.data);
    return (
      <g>
        {this.drawCells(cells)}
      </g>
    );
  }
}

VictoryTreemap.propTypes = {
  color: React.PropTypes.string
};

VictoryTreemap.defaultProps = {
  colorScale: d3.scale.category20c(),
  width: 2000,
  height: 2000,
  sticky: true,
  cellSVG: (cell, index, clickHandler, colorScale) => {
    console.log(cell)
    return (
      <g
        transform={"translate(" + cell.x + "," + cell.y + ")"}
        key={index}
        onClick={clickHandler}
        >
        <rect
          width={cell.dx}
          height={cell.dy}
          style={{
            "fill": cell.children ? colorScale(cell.name) : "none",
            "stroke": "white",
            "strokeWidth": "1.5px"
          }}/>
        <text
          x={3}
          y={12}
            style={{
              "fontFamily": "Helvetica",
              "fontSize": "10px",
              "border": "1px solid white",
            }}
            textAnchor={cell.hasChildren ? "end" : "start"}>
          {cell.name}
        </text>
      </g>
    )
  }
}

export default VictoryTreemap;

/*

<Cell
  key={index}
  hasChildren={cell.children ? true : false}
  name={cell.name}
  x={cell.x}
  y={cell.y}
  dx={cell.dx}
  dy={cell.dy}/>

  constructor(props) {
    super(props);
  }

  getStyles() {
    return {
      base: {
        color: "#000",
        fontSize: 12,
        textDecoration: "underline"
      },
      red: {
        color: "#d71920",
        fontSize: 30
      }
    };
  }
  <div style={[styles.base, this.props.color === "red" && styles.red]}>
  </div>
  const styles = this.getStyles();
*/
