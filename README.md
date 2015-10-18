[![Travis Status][trav_img]][trav_site]

Victory Treemap
=============

`victory-treemap` draws an SVG treemap with [React](https://github.com/facebook/react) and [D3](https://github.com/mbostock/d3). Styles and data can be customized by passing in your own values as properties to the component. Data changes are animated with [victory-animation](https://github.com/FormidableLabs/victory-animation).

## Examples

The plain component has baked-in sample data, style, angle, and sort defaults, so rendering the treemap with no custom properties, like so:

``` javascript
<VictoryTreemap/>
```

Will look like this:

![basic treemap chart](victory-treemap-sample.png)

Labels, by default, are placed in the upper left hand corner of each treemap slice, which can look a little strange sometimes. Apply `padding` and `labelPadding` like so:

``` javascript
<VictoryTreemap
  labelPadding={180}
  padding={30}/>
```

Makes:

![donut with white text](victory-donut-white.png)

Want a half donut? Specify a `startAngle` and `endAngle`:

``` javascript
<VictoryTreemap
  borderWidth={2}
  endAngle={90}
  fontColor="white"
  innerRadius={140}
  startAngle={-90}/>
```
Voilà:
![half donut](victory-donut-half.png)

Specify a `padAngle` to add space between adjacent slices:

``` javascript
<VictoryTreemap
  borderWidth={2}
  endAngle={90}
  fontColor="white"
  innerRadius={140}
  padAngle={5}
  startAngle={-90}/>
```
![donut with padding](victory-donut-padding.png)

Custom data (age vs population) and colors:

``` javascript
<VictoryTreemap
  borderWidth={2}
  data={[
    {x: "<5", y: 6279},
    {x: "5-13", y: 9182},
    {x: "14-17", y: 5511},
    {x: "18-24", y: 7164},
    {x: "25-44", y: 6716},
    {x: "45-64", y: 4263},
    {x: "≥65", y: 7502}
  ]}
  fontColor="white"
  fontWeight={200}
  innerRadius={150}
  sliceColors={[
    "#D85F49",
    "#F66D3B",
    "#D92E1D",
    "#D73C4C",
    "#FFAF59",
    "#E28300",
    "#F6A57F"
  ]}/>
```

Snazzes things up a bit:

![donut with data and custom colors](victory-donut-data.png)

If the data changes, the donut updates seamlessly:

![donut data change animated](victory-donut-animation.gif)

Set the `sort` prop to `"ascending"`, `"descending"`, or your own comparator:

``` javascript
<VictoryTreemap
  borderWidth={2}
  data={[
    { x: "<5", y: 4577 },
    { x: "5-13", y: 5661 },
    { x: "14-17", y: 3038 },
    { x: "18-24", y: 8151 },
    { x: "25-44", y: 7785 },
    { x: "45-64", y: 1911 },
    { x: "≥65", y: 7665 }
  ]}
  fontColor="white"
  fontWeight={200}
  innerRadius={150}
  sliceColors={[
    "#D85F49",
    "#F66D3B",
    "#D92E1D",
    "#D73C4C",
    "#FFAF59",
    "#E28300",
    "#F6A57F"
  ]}
  sort="descending"/>
```

To organize by slice size:

![donut descending sort](victory-donut-sort.png)


## Development

Please see [DEVELOPMENT](DEVELOPMENT.md)

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md)

[trav_img]: https://api.travis-ci.org/FormidableLabs/victory-treemap.svg
[trav_site]: https://travis-ci.org/FormidableLabs/victory-treemap