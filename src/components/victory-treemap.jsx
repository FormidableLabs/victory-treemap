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
  drawStatic () {
    return this.drawCells(cells)
  }
  drawZoomable () {

  }
  render() {
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
      <svg>
      <g
        height="this.props.height"
        width="this.props.width"
        >
        {this.props.zoomable ? this.drawZoomable() : this.drawStatic(cells)}
      </g>
      </svg>
    );
  }
}

VictoryTreemap.propTypes = {
  colorScale: React.PropTypes.func,
  width: React.React.PropTypes.number,
  height: React.PropTypes.number,
  sticky: React.React.PropTypes.bool,
  cellSVG: React.PropTypes.func
};

VictoryTreemap.defaultProps = {
  colorScale: d3.scale.category20c(),
  width: 2000,
  height: 2000,
  sticky: true,
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


/* ========== MARGIN, WIDTH, HEIGHT, ?, ? ========== *\/

/* ========== MARGIN TOP IS FOR GRANDPARENT :) ========== *\/

var margin = {top: 20, right: 0, bottom: 0, left: 0},
    width = 960,
    height = 500 - margin.top - margin.bottom,
    formatNumber = d3.format(",d"),
    transitioning;

var x = d3.scale.linear()
    .domain([0, width])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, height])
    .range([0, height]);

/* ========== SETUP THE TREEMAP FUNCTION ========== *\/

var treemap = d3.layout.treemap()
    .children(function(d, depth) { return depth ? null : d._children; })
    .sort(function(a, b) { return a.value - b.value; })
    .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
    .round(false);

/* ========== APPEND THE SVG ========== *\/

var svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .style("margin-left", -margin.left + "px")
    .style("margin.right", -margin.right + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("shape-rendering", "crispEdges");

/* ========== CREATE THE GRANDPARENT G ELEMENT ========== *\/

var grandparent = svg.append("g")
    .attr("class", "grandparent");

/* ========== THIS IS THE LONG RECTANGLE ACROSS THE TOP ========== *\/

grandparent.append("rect")
    .attr("y", -margin.top)
    .attr("width", width)
    .attr("height", margin.top);

grandparent.append("text")
    .attr("x", 6)
    .attr("y", 6 - margin.top)
    .attr("dy", ".75em");

/* ========== LET'S FETCH SOME DATA ========== *\/

d3.json("flare.json", function(root) {


  /* ========== INITIALIZE ========== *\/

  // This adds x, y, dx, dy and depth properties

  function initialize(root) {
    root.x = root.y = 0;
    root.dx = width;
    root.dy = height;
    root.depth = 0;
  }

  /* ========== ACCUMULATE ========== *\/

  // this adds the property value by recursively calculating the value for all children

  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  // We also take a snapshot of the original children (_children) to avoid
  // the children being overwritten when when layout is computed.
  function accumulate(d) {
    return (d._children = d.children)
        ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
        : d.value;
  }

  /* ========== LAYOUT ========== *\/

  // Compute the treemap layout recursively such that each group of siblings
  // uses the same size (1×1) rather than the dimensions of the parent cell.
  // This optimizes the layout for the current zoom state. Note that a wrapper
  // object is created for the parent node for each group of siblings so that
  // the parent’s dimensions are not discarded as we recurse. Since each group
  // of sibling was laid out in 1×1, we must rescale to fit using absolute
  // coordinates. This lets us use a viewport to zoom.
  function layout(d) {
    if (d._children) {
      treemap.nodes({_children: d._children});
      d._children.forEach(function(c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }

  /* ========== DISPLAY ========== *\/

  function display(d) {
    grandparent
        .datum(d.parent)
        .on("click", transition)
      .select("text")
        .text(name(d));

    var g1 = svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d._children)
      .enter().append("g");

    g.filter(function(d) { return d._children; })
        .classed("children", true)
        .on("click", transition);

    g.selectAll(".child")
        .data(function(d) { return d._children || [d]; })
      .enter().append("rect")
        .attr("class", "child")
        .call(rect);

    g.append("rect")
        .attr("class", "parent")
        .call(rect)
      .append("title")
        .text(function(d) { return formatNumber(d.value); });

    g.append("text")
        .attr("dy", ".75em")
        .text(function(d) { return d.name; })
        .call(text);

    /* ========== TRANSITION ========== *\/

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view. https://github.com/mbostock/d3/wiki/Selections#call
      t1.selectAll("text").call(text).style("fill-opacity", 0);
      t2.selectAll("text").call(text).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        svg.style("shape-rendering", "crispEdges");
        transitioning = false;
      });
    }

    return g;
  }

  /* ========== HELPERS ========== *\/

  function text(text) {
    text.attr("x", function(d) { return x(d.x) + 6; })
        .attr("y", function(d) { return y(d.y) + 6; });
  }

  function rect(rect) {
    rect.attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
  }

  function name(d) {
    return d.parent
        ? name(d.parent) + "." + d.name
        : d.name;
  }

  /* ========== INVOCATIONS ========== *\/

  initialize(root);
  accumulate(root);
  layout(root);
  display(root);

});

*/
