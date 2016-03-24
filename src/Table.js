import React, { Component } from 'react';
import {Table as FixedTable, Column, Cell} from 'fixed-data-table';
import Registry from './Registry';
import {getProp} from './utils';
import isEmpty from 'lodash/isEmpty';

export default class Table extends Component {

  constructor(props) {
    super(props);
    this.state = {
      gridWidth: 200,
      gridHeight: 200
    };
  }

  componentDidMount(){
    this.attachResize();
    this.setSize();
    this.fetchData().then(this.onData.bind(this));
  }

  onData(data) {
    this.setData(data);
  }

  fetchData() {
    return Promise.resolve(this[this.props.fetchData]());
  }

  setData(data) {
    const { offsetWidth, offsetHeight } = this.refs.table;
    let state = Object.assign({}, {
      gridWidth: offsetWidth,
      gridHeight: offsetHeight
    }, {data:data});

    this.setState(state);
  }

  setSize() {
    const { offsetWidth, offsetHeight } = this.refs.table;
    this.setState({
      gridWidth: offsetWidth,
      gridHeight: offsetHeight
    });
  }

  attachResize() {
    window.addEventListener('resize', this.setSize.bind(this), false);
  }

  render() {
    if(isEmpty(this.state.data)) return (<div ref="table"></div>);

    const { gridWidth, gridHeight } = this.state;
    let tableDefaultProps = getProp('settings.table', this.props);
    let columnDefaultProps = getProp('settings.columns', this.props);
    let cellsDefaultProps = getProp('settings.cells', this.props);
    let headers = Object.keys(this.state.data[0]);
    let columns = headers.map((header) => {
      let overrides = getProp('overrides.' + header, columnDefaultProps);
      return <Column
        header={<Cell>{header}</Cell>}
        key={header}
        columnKey={header}
        cell={props => {
          let overrides = getProp('overrides.' + props.rowIndex, cellsDefaultProps);
          return <Cell {...props} {...cellsDefaultProps} {...overrides}>
            {this.state.data[props.rowIndex][props.columnKey]}
          </Cell>
        }}
        {...columnDefaultProps}
        {...overrides}
      />
    });

    return (
      <div ref="table">
        <FixedTable rowsCount={this.state.data.length} {...tableDefaultProps} width={gridWidth}>
          {columns}
        </FixedTable>
      </div>
    );
  }
}

Registry.set('Table', Table);