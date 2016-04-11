import React, { Component } from 'react';
import Geary from '../layouts/Geary';
import Registry from '../utils/Registry';
import BaseComponent from './BaseComponent';
import EventDispatcher from '../dispatcher/EventDispatcher';

export default class Dashboard extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {data: []};
  }

  render() {
    let layout = (typeof this.props.layout === 'string') ? Registry.get(this.props.layout) : this.props.layout;
    if(!layout) throw new Error(`Missing layout class ${this.props.layout}`);
    let props = Object.assign({globalData: this.state.data || []}, this.props);

    return (
      <div className="container">
        <h1 className="dashboard-title">{this.props.title}</h1>
        {React.createElement(layout, props)}
      </div>
    );
  }
}