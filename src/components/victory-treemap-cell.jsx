import React from "react";
import Radium from "radium";


@Radium
class VictoryTreemapCell extends React.Component {
  static propTypes = {
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    name: React.PropTypes.string,
    dx: React.PropTypes.number,
    dy: React.PropTypes.number,
    styles: React.PropTypes.object,
    hasChildren: React.PropTypes.bool,
    value: React.PropTypes.number,
    clickHandler: React.PropTypes.func,
    colorScale: React.PropTypes.func,
    hideLabelForValuesLessThan: React.PropTypes.number
  }

  static defaultProps = {

  }

  render() {
    return (
      <g
        transform={"translate(" + this.props.x + "," + this.props.y + ")"}
        onClick={this.props.clickHandler}
        >
        <rect
          width={this.props.dx}
          height={this.props.dy}
          style={Object.assign(
            {},
            { "fill": this.props.hasChildren ? this.props.colorScale(this.props.name) : "none" },
            this.props.styles.cellRect
          )}/>
        <text
          x={3}
          y={12}
          style={Object.assign(
            {},
            {"fontWeight": this.props.hasChildren ? "700" : "300"},
            this.props.styles.cellText
          )}
          >
          {this.props.value > this.props.hideLabelForValuesLessThan ? this.props.name : ""}
        </text>
      </g>
    );
  }
}

export default VictoryTreemapCell;
