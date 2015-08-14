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
  /* ========== STATIC CELLS ========== */
  drawStaticCells (cells) {
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
  /* ========== STATIC MAIN ========== */
  drawStatic () {
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
    /* note that for the zoomable version, the equiv func is 'layout' */
    let cells = treemap.nodes(this.props.data);
    return this.drawStaticCells(cells)
  }
  /* ========== ZOOMABLE CELLS ========== */

  drawZoomableCells (cells) {
    /* looks like maybe this will be cells._children.map() for zoomable */
    var cellComponents = cells._children.map((cell, index) => {
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

  /* ========== ZOOMABLE MAIN ========== */
  drawZoomable () {

    let width = this.props.width;
    let height = 500 - this.props.grandparentHeight - this.props.margin.bottom;
    let formatNumber = d3.format(",d");
    let transitioning;

    let x = d3.scale.linear()
        .domain([0, width])
        .range([0, width]);

    let y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);

    /* this gives you a breadcrumb on the grandparent (nice!) each could be a link*/
    function getGrandparentText (d) {
      return d.parent ? getName(d.parent) + " > " + d.name : d.name;
    }

    /* ========== SET UP THE TREEMAP FUNCTION ========== */

    let treemap = d3.layout.treemap()
        .children(function(d, depth) { return depth ? null : d._children; })
        .sort(function(a, b) { return a.value - b.value; })
        .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
        .round(false);

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function createZoomableCells (d) {
      if (d._children) {
        treemap.nodes({_children: d._children});
        d._children.forEach(function(c) {
          c.x = d.x + c.x * d.dx;
          c.y = d.y + c.y * d.dy;
          c.dx *= d.dx;
          c.dy *= d.dy;
          c.parent = d;
          createZoomableCells(c);
        });
      }
    }

    let data = this.props.data;

    this.addSpecialPropertiesToZoomableTree(data)
    this.aggregateChildrenAndAddValueToParents(data);
    createZoomableCells(data);
    let cells = this.drawZoomableCells(data);

    /*
      todo how is _children being used -
      where do i need to reference that...
      when createZoomableCells or drawCells or both

      also... how does datum(d.parent) work
      that call out to the name() function above

    */
    return (
      <g>
        <g className="grandparent" onClick={this.handleGrandparentClick}>
          <rect
            y={-this.props.grandparentHeight}
            width={width}
            height={height}/>
          <text
            y={6-this.props.grandparentHeight}
            x={6}
            dy={".75em"}
            >
            {"TODO"/*getGrandparentText(d.parent)*/}
          </text>
        </g>
        {cells}
      </g>
    )

  }
  /* goin up a level or n... */
  handleGrandparentClick () {
    console.log("Hey! You clicked on the grandparent!")
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
  // Basically, figure out how deep / large each node is to figure out proportions for treemap
  // Aggregate the values of all internal nodes on tree and add # as property. This is normally done by the
  // treemap layout, but not here because of our custom implementation for zooming.
  // We also take a snapshot of the original children (_children) to avoid
  // the children being overwritten when when layout is computed.
  aggregateChildrenAndAddValueToParents(d) {
    return (d._children = d.children)
        ? d.value = d.children.reduce((p, v) => { return p + this.aggregateChildrenAndAddValueToParents(v); }, 0)
        : d.value;
  }
  render() {
    let margin = this.props.margin;

    return (
      <svg
        height={this.props.height + margin.bottom + margin.top}
        width={this.props.width + margin.left + margin.right}
        style={{
          marginLeft: -margin.left + "px",
          marginRight: -margin.right + "px",
        }}
        >
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
  colorScale: React.PropTypes.func,
  width: React.PropTypes.number,
  height: React.PropTypes.number,
  sticky: React.PropTypes.bool,
  zoomable: React.PropTypes.bool,
  margin: React.PropTypes.object,
  grandparentHeight: React.PropTypes.number,
  cellSVG: React.PropTypes.func
};

VictoryTreemap.defaultProps = {
  colorScale: d3.scale.category20c(),
  /* this should be φ (1.618 : 1) */
  width: 1294.4,
  height: 800,
  sticky: true,
  zoomable: true,
  margin: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
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


    /* zoomable cells */

    // var g1 = svg.insert("g", ".grandparent")
    //     .datum(d)
    //     .attr("class", "depth");

    // var g = g1.selectAll("g")
    //     .data(d._children)
    //   .enter().append("g");

    // g.filter(function(d) { return d._children; })
    //     .classed("children", true)
    //     .on("click", transition);

    // g.selectAll(".child")
    //     .data(function(d) { return d._children || [d]; })
    //   .enter().append("rect")
    //     .attr("class", "child")
    //     .attr("x", function(d) { return x(d.x); })
    //     .attr("y", function(d) { return y(d.y); })
    //     .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
    //     .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });

    // g.append("rect")
    //     .attr("class", "parent")
    //     .attr("x", function(d) { return x(d.x); })
    //     .attr("y", function(d) { return y(d.y); })
    //     .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
    //     .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
    //   .append("title")
    //     .text(function(d) { return formatNumber(d.value); });

    // g.append("text")
    //     .attr("dy", ".75em")
    //     .text(function(d) { return d.name; })
    //     .attr("x", function(d) { return x(d.x) + 6; })
    //     .attr("y", function(d) { return y(d.y) + 6; });

    /* ========== TRANSITION ========== */

    // transition (d) {
    //   if (transitioning || !d) return;
    //   transitioning = true;

    //   var g2 = display(d),
    //       t1 = g1.transition().duration(750),
    //       t2 = g2.transition().duration(750);

    //   // Update the domain only after entering new elements.
    //   x.domain([d.x, d.x + d.dx]);
    //   y.domain([d.y, d.y + d.dy]);

    //   // Enable anti-aliasing during the transition.
    //   svg.style("shape-rendering", null);

    //   // Draw child nodes on top of parent nodes.
    //   svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

    //   // Fade-in entering text.
    //   g2.selectAll("text").style("fill-opacity", 0);

    //   // Transition to the new view. https://github.com/mbostock/d3/wiki/Selections#call
    //   t1.selectAll("text")
    //     .attr("x", function(d) { return x(d.x) + 6; })
    //     .attr("y", function(d) { return y(d.y) + 6; })
    //     .style("fill-opacity", 0);
    //   t2.selectAll("text")
    //     .attr("x", function(d) { return x(d.x) + 6; })
    //     .attr("y", function(d) { return y(d.y) + 6; })
    //     .style("fill-opacity", 1);

    //   t1.selectAll("rect")
    //     .attr("x", function(d) { return x(d.x); })
    //     .attr("y", function(d) { return y(d.y); })
    //     .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
    //     .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });

    //   t2.selectAll("rect")
    //     .attr("x", function(d) { return x(d.x); })
    //     .attr("y", function(d) { return y(d.y); })
    //     .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
    //     .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });

    //   // Remove the old node when the transition is finished.
    //   t1.remove().each("end", function() {
    //     svg.style("shape-rendering", "crispEdges");
    //     transitioning = false;
    //   });
    // }

