import React, { Component } from 'react';
import Registry from '../utils/Registry';

export default class Markup extends Component {
  render() {
    return (
      <div dangerouslySetInnerHTML={ {__html: this.props.content}}></div>
    )
  }
}

Registry.set('Markup', Markup);
