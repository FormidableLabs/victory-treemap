import React from "react";
import Radium from "radium";
import d3 from "d3";
// import _ from "lodash";

/* when they are modularized */
// import colorScale from "d3-color-scale";
// import d3Treemap from "d3-layout-treemap"

@Radium
class VictoryTreemap extends React.Component {
  handleCellClick(node) {
    return node;
  }
  /* ========== STATIC CELLS ========== */
  drawStaticCells(cells) {
    const cellComponents = cells.map((cell, index) => {
      const config = {
        cell,
        index,
        handleClick: this.handleCellClick.bind(this, cell),
        colorScale: this.props.colorScale,
        hideLabelForValuesLessThan: this.props.hideLabelForValuesLessThan
      };
      return (
        this.props.cellSVG(config)
      );
    });
    return cellComponents;
  }

  /* ========== STATIC MAIN ========== */
  drawStatic() {
    const treemap = d3.layout
                    .treemap()
                    .size([
                      this.props.width,
                      this.props.height
                    ])
                    .sticky(this.props.sticky)
                    .value((d) => {
                      return d.value;
                    });

    const cells = treemap.nodes(this.props.data);
    return this.drawStaticCells(cells);
  }

  render() {
    const m = this.props.styles.margin;

    return (
      <svg
        height={
          this.props.height +
          m.bottom +
          m.top
        }
        width={
          this.props.width +
          m.left +
          m.right
        }
        style={this.props.styles.svg}
        >
        <rect
          height="100%"
          width="100%"
          ></rect>
        <g
          transform={"translate(" + m.left + "," + m.top + ")"}
          style={{shapeRendering: "crispEdges"}}
          >
          {this.props.zoomable ? this.drawZoomable() : this.drawStatic()}
        </g>
      </svg>
    );
  }
}

VictoryTreemap.propTypes = {
  /**
   * Tree. For format, see: https://gist.githubusercontent.com/mbostock/1093025/raw/05621a578a66fba4d2cbf5a77e2d1bb3a27ac3d4/flare.json
   */
  data: React.PropTypes.object,
  /**
   * Function for choosing colors
   * @examples d3.scale.category10()
   */
  colorScale: React.PropTypes.func,
  /**
   * Width of SVG
   * @examples 900
   */
  width: React.PropTypes.number,
  /**
   * Height of SVG
   * @examples 600
   */
  height: React.PropTypes.number,
  /**
   * Sticky
   * See: https://github.com/mbostock/d3/wiki/Treemap-Layout#sticky
   */
  sticky: React.PropTypes.bool,
  /**
   * Some boxes will be too small for labels to be visible. Use this prop to hide the label.
   * @examples 100, 1000, 3453
   */
  hideLabelForValuesLessThan: React.PropTypes.number,
  /**
   * Styles
   * @examples "#ff0000", "rgba(255, 0, 0, 1", "red"
   */
  styles: React.PropTypes.object,
  /**
   * Cell SVG, a function that takes an item and returns SVG
   */
  cellSVG: React.PropTypes.func
};

VictoryTreemap.defaultProps = {
  colorScale: d3.scale.category20c(),
  /* bostock suggests this should be φ (1.618 : 1) */
  sticky: true,
  width: 1294.4,
  height: 800,
  hideLabelForValuesLessThan: 4000,
  styles: {
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    rect: {
      fill: "none",
      stroke: "white"
    }
  },
  // config: cell, index, clickHandler, colorScale, hideValuesLessThan
  cellSVG: (config) => {
    const {
      cell,
      index,
      clickHandler,
      colorScale,
      hideLabelForValuesLessThan
    } = config;
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
              "fontWeight": cell.children ? "700" : "300"
            }}
            textAnchor={cell.hasChildren ? "end" : "start"}>
          {cell.value > hideLabelForValuesLessThan ? cell.name : ""}
        </text>
      </g>
    );
  }
};


export default VictoryTreemap;
