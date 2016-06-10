import React, { Component } from 'react';
import Registry from '../../utils/Registry';
import BaseComponent from '../BaseComponent';
import Loader from '../Loader';
import Datamap from './Datamap';
import HoverInfo from './HoverInfo';
import topojson from 'topojson'
import d3 from 'd3';
import MapLegend from './MapLegend';

export default class Choropleth extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      infoWindowPos: new Map([['x',0], ['y', 0]]),
      infoWindowActive: true,
      activeSubunitName: 'default',
      data: []
    };
  }

  componentDidMount() {
    super.componentDidMount();
    fetch(this.props.geometry)
      .then((response) => response.json())
      .then( (data) =>{
        var geometryFeatures;

        if (this.props.format === 'geojson') {
          geometryFeatures = data.features;
        } else {
          geometryFeatures = topojson.feature(
            data,
            data.objects[this.props.topologyObject]
          ).features;
        }

        this.setState({geometryFeatures })
      });
  }

  extremeValues(){
    let max = d3.max(this.state.data.map((d) => d[this.props.dataValueField]));
    let min = d3.min(this.state.data.map((d) => d[this.props.dataValueField]));
    return new Map([ ['min', min], ['max', max] ]);
  }

  colorScale() {
    let extremeValues = this.extremeValues();
    let min = (extremeValues) ? extremeValues.get('min') : 0;
    let max = (extremeValues) ? extremeValues.get('max') : 200;

    return d3.scale.linear()
      .domain([min, max])
      .range([this.props.startColor, this.props.endColor])
      .interpolate(d3.interpolateLab)
  }

  mouseMoveOnDatamap(e) {
    const position = new Map([['x', e.clientX], ['y', e.clientY]]);
    this.setState({ infoWindowPos: position })
  }

  mouseEnterOnDatamap() {
    this.setState({ infoWindowActive: true })
  }

  mouseLeaveDatamap() {
    this.setState({ infoWindowActive: false })
  }

  mouseEnterOnSubunit(name, value) {
    this.setState({
      activeSubunitName: name,
      activeSubunitValue: value,
    });
  }

  render() {

    const svgWidth = 750
    const svgHeight = svgWidth * 0.8;
    const extremeValues = this.extremeValues();

    const {
      infoWindowPos,
      infoWindowActive,
      activeSubunitName,
      activeSubunitValue,
    } = this.state;

    const mapLegend = (
      <MapLegend
        svgWidth={svgWidth}
        svgHeight={svgHeight}
        extremeValues={extremeValues || new Map()}
        dataClassification={this.props.dataClassification}
        {...this.props}
      />
    );

    const colorScale = this.colorScale();
    const noDataColor = this.props.noDataColor || '#f5f5f5';
    const borderColor = this.props.borderColor || '#cccccc';
    const geometryFeatures = this.state.geometryFeatures || [];
    const loading = this.state.geometryFeatures && this.state.data;

    const svgStyle = {
      width: svgWidth,
      height: svgHeight,
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    }

    return (
      <Loader isFeching={!loading}>
        <div className="map-container">
          <svg className="map-svg" style={svgStyle}>
            <g id="root-svg-group">
              <Datamap
                {...this.props}
                geometry={geometryFeatures}
                colorScale={colorScale}
                noDataColor={noDataColor}
                borderColor={borderColor}
                svgWidth={svgWidth}
                svgHeight={svgHeight}
                mouseMoveOnDatamap={this.mouseMoveOnDatamap.bind(this)}
                mouseEnterOnDatamap={this.mouseEnterOnDatamap.bind(this)}
                mouseLeaveDatamap={this.mouseLeaveDatamap.bind(this)}
                mouseEnterOnSubunit={this.mouseEnterOnSubunit.bind(this)}
                regionData={this.state.data}
              />
              {extremeValues && mapLegend}
            </g>
          </svg>
          <HoverInfo
            active={infoWindowActive}
            position={infoWindowPos}
            name={activeSubunitName}
            value={activeSubunitValue}
          />
        </div>
      </Loader>
    );
  }
}

Registry.set('Choropleth', Choropleth);