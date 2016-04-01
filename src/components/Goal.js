import React, { Component } from 'react';
import Registry from '../utils/Registry';
import BaseComponent from './BaseComponent';
import head from 'lodash/head';
import NVD3Chart from 'react-nvd3';
import moment from 'moment';
import * as d3 from 'd3';
import capitalize from 'lodash/capitalize';
import classnames from 'classnames';

export default class Goal extends BaseComponent {

  constructor(props) {
    super(props);
    this.state = {
      metric: 50,
      style: {
        color: 'black',
        background: 'white',
      },
      dateFormat: this.props.dateFormat || 'MMMM Do YYYY',
      numberFormat: this.props.numberFormat || '.0f'
    };
  }

  componentDidMount() {
    super.componentDidMount();

    // If doesn't need to fetch data then use the global data
    if(!this.props.fetchData) this.onDataReady(this.props.globalData);
  }

  onDataReady(data) {
    this.setState({metric: this.getMetric(data)});
  }

  getMetric(data) {
    return this[this.props.metric](data);
  }

  getTolerance(distance, actionCondition) {
    let tolerance = this.props.tolerance;
    let dist = Math.abs(distance);
    return tolerance.filter((t) => {
      return actionCondition || (dist > t.from && dist <= t.to);
    })
  }

  trackStatus() {
    let startDate = Date.parse(this.props.startDate);
    let endDate = Date.parse(this.props.endDate);
    let startNumber = Number(this.props.startNumber);
    let endNumber = Number(this.props.endNumber);
    let tracker = this.getTracker(startDate, endDate, startNumber, endNumber);
    let projection = tracker(Date.now());
    let distance = projection - this.state.metric;
    let actionContitions = {
      increase: distance <= 0,
      decrease: distance > 0,
      maintain: true,
      mesure: true
    };

    return this.getTolerance(distance, actionContitions[this.props.action]);
  }

  getTracker(startDate, endDate, startNumber,  endNumber){
    return function (date){
      let m = (endNumber - startNumber) / (endDate - startDate);
      let y = m * (date - startDate);
      return y;
    }
  }

  formatNumber(n) {
    let format = d3.format(this.state.numberFormat);
    return format(n);
  }

  formatDate(date) {
    return moment((date).toISOString()).format(this.state.dateFormat);
  }

  getCaption() {
    let caption = capitalize(this.props.action);

    switch(this.props.action) {
      case 'increase':
      case 'decrease':
        caption +=' ' + this.props.caption + ' to ' + this.formatNumber(this.props.endNumber) + ' by ' + this.formatDate(new Date(this.props.endDate));
        break;
      case 'maintain':
        caption +=' ' + this.props.caption + ' at ' + this.formatNumber(this.props.endNumber) + ' by ' + this.formatDate(new Date(this.props.endDate));
        break;
      case 'mesure':
        caption +=' ' + this.props.caption;
        break;
    }
    return caption;
  }

  render() {
    let status = Object.assign({}, head(this.trackStatus()));
    let style = {
      background: this.props.background,
      color: status.color
    };
    let spline;

    if(this.props.spline) {
      let splineSettings = Object.assign({}, this.props.spline);
      spline = <NVD3Chart type="sparklinePlus" datum={this.state.data} showLastValue={false} color={['#333333']}{...splineSettings}/>
    }
    style = Object.assign({}, style, this.props.style);
    return (
      <div className="goal" style={style}>
          <div className="row">
            <div className="col-md-3">
              <div className="card-goal-icon">
                <span className={classnames('glyphicon', this.props.icon)}></span>
              </div>
            </div>
            <div className="col-md-9">
              <div className="card-goal-caption">{this.getCaption()}</div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="card-goal-progress">
              {this.formatNumber(this.state.metric)} / {this.formatNumber(this.props.endNumber)}
              </div>
            </div>
            <div className="col-md-6">
              <div className="card-goal-status">
              {status.label}
              </div>
              <div className="card-goal-end-date">
              {this.formatDate(new Date(this.props.endDate))}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="spline">
              {spline}
              </div>
            </div>
          </div>
      </div>
    )
  }
}

Registry.set('Goal', Goal);