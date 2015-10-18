import React from 'react';
import Ecology from 'ecology';
import Radium, { Style } from 'radium';
import superagent from 'superagent';
import d3 from 'd3';


import theme from './theme';

@Radium
class Docs extends React.Component {
  render() {
    return (
      <div className="container">
        <Ecology
          overview={require('!!raw!./ecology.md')}
          source={require('json!./victory-treemap.json')}
          scope={{
            React,
            VictoryTreemap: require('../src/components/victory-treemap'),
            d3,
            superagent,
            dataFromDemo: require('../demo/flare')
          }}/>
        <Style rules={theme}/>
      </div>
    )
  }
}

const content = document.getElementById("content");
React.render(<Docs/>, content);