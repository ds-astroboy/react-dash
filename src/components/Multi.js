/*
 * This is not a reusable component. 
 * This is a simple pattern and should serve as a base
 * for development of custom components that intelligently
 * render children based on user input or certain logic
 */
import React, { Component } from 'react';
import Registry from '../utils/Registry';

export default class Multi extends Component {
  /*
   * Define initial set of elements to render
   */
  componentWillMount() {
    this.setState({elements : this.props.elements.a});
  }

  /*
   * The current state.elements array
   */
  renderChildren() {
    let els = [];
    this.state.elements.map((element) => {
      els.push(React.createElement(Registry.get(element.type), element));
    });
    return els;
  }
 
  /*
   * The render method, in this case, renders a select which triggers
   * our change listener. 
   * A helper function renders an array of elements from the appropriate
   * section of the multi component's settings
   */
  render() {
    let filters = this.getFilters();
    let v = 
    <div class="multi-container">
      {filters}
      <div class="multi-elements-container">
        {this.renderChildren()}
      </div>
    </div> 
    return v;
  }

  /*
   * Listen for change and update state.elements
   */
  listener(e) {
    this.setState({elements: this.props.elements[e.target.value]});
  }
}

Registry.set('Multi', Multi);
