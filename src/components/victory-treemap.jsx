import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";

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
  /*
    this gives you a breadcrumb on the grandparent (nice!)
    each part could be a link
  */
  // getGrandparentText(d) {
  //   return d.parent ? getName(d.parent) + " > " + d.name : d.name;
  // }
  /* ========== ZOOMABLE MAIN ========== */
  drawZoomable() {

    const width = this.props.width;
    const height = this.props.height - this.props.grandparentHeight;
    const formatNumber = d3.format(",d");
    // let transitioning = false;

    const x = d3.scale.linear()
        .domain([0, width])
        .range([0, width]);

    const y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);


    /* ========== SET UP THE TREEMAP FUNCTION ========== */
    const treemap = d3.layout.treemap()
        .children((d, depth) => { return depth ? null : d._children; })
        .sort((a, b) => { return a.value - b.value; })
        .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
        .round(false);

    // Children will get stretched...
    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.

    /* FUNCTION EXPRESSION DOES NOT PASS CHECK - REFACTOR */
    function computeTreemapAndAdjustPerspective(parent) {
      if (parent._children) {
        treemap.nodes({_children: parent._children});
        parent._children.forEach((child) => {
          child.x = parent.x + child.x * parent.dx;
          child.y = parent.y + child.y * parent.dy;
          child.dx *= parent.dx;
          child.dy *= parent.dy;
          child.parent = parent;
          computeTreemapAndAdjustPerspective(child);
        });
      }
    }

    /* make a copy of data so that we're not mutating props */
    const data = _.cloneDeep(this.props.data);
    this.addSpecialPropertiesToZoomableTree(data);
    this.aggregateChildrenAndAddValueToParents(data);
    computeTreemapAndAdjustPerspective(data, treemap);

    /*
      todo how is _children being used -
      where do we need to reference that...
      when computeTreemapAndAdjustPerspective or drawCells or both

      also... how does datum(d.parent) work
      that call out to the name() function above
    */
    /*
      grandparent bar is across the top -
      TODO check if this aligned with orig ex.
      grandparent container is full width / height
      and has parents in it
      each parent has className parent and children in it
      each child has className child

      =========G===========
      ---------G-----------
      |-----|  |   P  |   |
      |  P  |----------   |
      |     |   P  c c|---|
      ---------------------
    */
    return (
      <g>
        <g className="_***_grandparent_***_" onClick={this.handleGrandparentClick}>
          <rect
            style={this.props.styles.grandparentRect}
            y={0/*-this.props.grandparentHeight*/}
            width={width}
            height={this.props.grandparentHeight}/>
          <text
            style={this.props.styles.getGrandparentText}
            y={2/*6-this.props.grandparentHeight*/}
            x={6}
            dy={".75em"}
            >
            {"Navigation goes here"/*this.getGrandparentText(d.parent)*/}
          </text>
        </g>
        <g
          className="_***_parentsContainer_***_"
          transform={
            "translate(" +
            this.props.styles.svg.margin.left +
            "," +
            this.props.grandparentHeight +
            ")"
          }
          >
        {

          this.props.drawZoomableParentCells(
            data,
            this.props.drawZoomableChildrenCells,
            x,
            y,
            formatNumber,
            this.props.styles
          )
        }
        </g>
      </g>
    );
  }
  /* goin' up a level or n... */
  handleGrandparentClick(d) {
    return d;
  }
  /* ========== INITIALIZE ========== */
  // This adds x, y, dx, dy and depth properties
  addSpecialPropertiesToZoomableTree(root) {
    root.x = root.y = 0;
    root.dx = this.props.width;
    root.dy = this.props.height;
    root.depth = 0;
  }
  /* ========== AGGREGATE ========== */
  /*

    Basically, figure out how deep / large each
    node is to figure out proportions for treemap.

    Aggregate the values of all internal
    nodes on tree and add # as property.

    This is normally done by the treemap layout,
    but not here because of our custom implementation for zooming.

    We also take a snapshot of the original children (_children) to avoid
    the children being overwritten when when layout is computed.

  */
  aggregateChildrenAndAddValueToParents(d) {
    return (d._children = d.children)
        ? d.value = d.children.reduce((p, v) => {
          return p + this.aggregateChildrenAndAddValueToParents(v);
        }, 0)
        : d.value;
  }
  render() {
    const margin = this.props.styles.svg.margin;

    return (
      <svg
        height={this.props.height + margin.bottom + margin.top + this.props.grandparentHeight}
        width={this.props.width + margin.left + margin.right}
        style={this.props.styles.svg}
        >
        <rect
          height="100%"
          width="100%"
          fill={this.props.backgroundColor}
          ></rect>
        <g
          transform={"translate(" + margin.left + "," + margin.top + ")"}
          style={{shapeRendering: "crispEdges"}}
          >
          {this.props.zoomable ? this.drawZoomable() : this.drawStatic()}
        </g>
      </svg>
    );
  }
}

VictoryTreemap.propTypes = {
  data: React.PropTypes.object,
  colorScale: React.PropTypes.func,
  width: React.PropTypes.number,
  height: React.PropTypes.number,
  sticky: React.PropTypes.bool,
  zoomable: React.PropTypes.bool,
  styles: React.PropTypes.object,
  drawZoomableChildrenCells: React.PropTypes.func,
  drawZoomableParentCells: React.PropTypes.func,
  backgroundColor: React.PropTypes.string,
  grandparentHeight: React.PropTypes.number,
  cellSVG: React.PropTypes.func
};

VictoryTreemap.defaultProps = {
  colorScale: d3.scale.category20c(),
  /* bostock suggests this should be φ (1.618 : 1) */
  width: 1294.4,
  height: 800,
  sticky: true,
  zoomable: false,
  styles: {
    svg: {
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    grandparentText: {
      fontWeight: "bold"
    },
    rect: {
      fill: "none",
      stroke: "white"
    },
    grandparentRect: {
      fill: "orange",
      stroke: "white",
      strokeWidth: "2px"
    },
    childrenRect: {
      fill: "rgb(230,230,230)",
      strokeWidth: "1px",
      stroke: "white",
      fillOpacity: .5
    },
    parentRect: {
      fill: "none",
      stroke: "white",
      strokeWidth: "2px",
      fillOpacity: .5
    }
  },
  backgroundColor: "rgb(230,230,230)",
  grandparentHeight: 20,
  cellSVG: (cell, index, clickHandler, colorScale) => {
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
              "border": "1px solid white"
            }}
            textAnchor={cell.hasChildren ? "end" : "start"}>
          {cell.name}
        </text>
      </g>
    );
  },
  /* this is a nested for loop and puts children in each parent */
  drawZoomableChildrenCells: (parent, x, y, styles) => {
    const children = parent._children.map((child) => {
      return (
        <rect
          style={styles.childrenRect}
          className="child"
          x={ x(child.x) }
          y={ y(child.y) }
          width={ x(child.x + child.x) - x(child.x) }
          height={ y(child.y + child.dy) - y(child.y) }
        >
        </rect>
      );
    });
    return children;
  },
  /* this is probably its own component, passed in as a child comp. to treemap */
  /* this is the first for loop that appends the first level past the root node */
  drawZoomableParentCells: (data, drawZoomableChildrenCells, x, y, formatNumber, styles) => {
    const parents = data._children.map((parent) => {

      return (
        <g>
          <rect
            className="parent"
            style={styles.parentRect}
            x={ x(parent.x) }
            y={ y(parent.y) }
            width={ x(parent.x + parent.x) - x(parent.x) }
            height={ y(parent.y + parent.dy) - y(parent.y) }
            >
          </rect>
          <text
            x={ x(parent.x) + 6 }
            y={ y(parent.y) + 6 }
            dy={".75em"}
            >
            {parent.name + " " + formatNumber(parent.value)}
          </text>
          {drawZoomableChildrenCells(parent, x, y, styles)}
        </g>
      );
    });
    return parents;
  }
};

export default VictoryTreemap;
