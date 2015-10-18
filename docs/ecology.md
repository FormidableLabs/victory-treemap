Victory Treemap
==================

`$ npm install victory-treemap`

`victory-treemap` draws an SVG treemap with [React](https://github.com/facebook/react) and [D3](https://github.com/mbostock/d3). Styles and data can be customized by passing in your own values as properties to the component. Data changes are animated with [victory-animation](https://github.com/FormidableLabs/victory-animation).

## Examples

The basics:
<!-- const url = "https://rawgit.com/mbostock/4063582/raw/2eff6a42ec630842575607396e980c56a06cc493/flare.json"; -->
<!-- superagent.get(url).end(function(err,res){
  console.log(JSON.parse(res.text));
  data={JSON.parse(res.text)}/
}); -->

```playground_norender
class App extends React.Component {
  render() {
    return (
      <VictoryTreemap data={dataFromDemo}/>
    )
  }
}
React.render(<App/>, mountNode);

```

Try manipulating some props:

```playground_norender
class App extends React.Component {
  render() {
    return (
      <VictoryTreemap
        data={dataFromDemo}
        colorScale={d3.scale.category20c()}
        width={1294.4}
        height={800}
        hideLabelForValuesLessThan={4000}
        styles={{
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
        }}
        />
    )
  }
}
React.render(<App/>, mountNode);

```
