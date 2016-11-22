import React, { Component } from 'react';
import {browserHistory} from 'react-router';
import {findDOMNode} from 'react-dom';
import EventDispatcher from '../dispatcher/EventDispatcher';
import Dataset from '../models/Dataset';
import {omit, isEqual, isEmpty, isFunction, isPlainObject, isString, isArray, debounce} from 'lodash';
import DataHandler from '../utils/DataHandler';
import Registry from '../utils/Registry';
import {qFromParams, getOwnQueryParams, getFID, objToQueryString} from '../utils/paramRouting';

export default class BaseComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      dataset: null,
      queryObj: Object.assign({from: 0}, this.props.queryObj), // dataset query
      isFeching: false,
    };
  }
  
  /**
   * LIFECYCLE
   **/
  componentWillMount() {
    // Register to all the actions
    EventDispatcher.register(this.onAction.bind(this));
    let q = '';
    
    if (this.props.location) {
      q = this.props.location.query;
    }

    //let ownParams = getOwnQueryParams(q, this.props.cid, this.props.multi) || {};
    //this.setState({ownParams: ownParams});
  }
  
  componentDidMount(){
    // resize magic
    let componentWidth = findDOMNode(this).getBoundingClientRect().width;
    this.setState({ componentWidth : componentWidth});
    //this.fetchData();
    this.onResize();
  }
  
  componentWillReceiveProps() {
    this.applyOwnFilters();
  }
  
  componentDidUpdate(nextProps, nextState) {
    let isDash = this.props.type == undefined; 
    let globalDataEqual = _.isEqual(nextProps.globalData, this.props.globalData);
    let appliedFiltersEqual = _.isEqual(nextProps.appliedFilters, this.props.appliedFilters);

    if (!isDash && !globalDataEqual || !appliedFiltersEqual) {
      this.fetchData(); 
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resizeHandler);
  }
  
  /**
   * FETCH DATA
   **/
  fetchData() {
    let type = this.getFetchType();
    
    switch (type) {
      case 'backend':
        this.fetchBackend();
        break;
      case 'global':
        this.applyDataHandlers();
        break;
      case 'data':
        this.applyDataHandlers(this.props.data);
        break;
    }  
  }
  
  /**
   * returns type:
   *   backend - uses an existing data backend (CSV, CartoDB, etc)
   *   global - uses a dataHandler function to extract data from globalData
   *   data - component is supplied data via props.data which it will use directly
   */
  getFetchType() {
    let type = 'global'; 
    
    if (this.props.fetchData && this.props.fetchData.type) {
      type = 'backend';
    } else if (this.props.data) {
      type = 'data';
    }
    return type;
  }
  
  /**
   * Use backends to fetch data and query the result
   */
  fetchBackend() {
    let dataset = new Dataset(omit(this.props.fetchData, 'type'));
    let queryObj = this.state.queryObj;
    
    this.setState({isFeching: true});
    dataset.fetch().then(() => {
      dataset.query(queryObj).then(queryRes => {
        console.log('QR', queryRes);
        this.applyDataHandlers(queryRes, true);
      }).catch(e => {
        console.error('Error fetching dataset', e);
      });
    });
  } 
  
  // @@TODO handle filter logic separately from datahandlers
  applyDataHandlers(data = [], isDataset = false) {
    let _handlers = this.state.filterHandlers || this.props.dataHandlers;
    let _data = data;
    let _total = data.length;
    
    if (isDataset) {
      _data = _data.hits;
      let _total = data.total || data.length;
    }
    _data = DataHandler.handle.call(this, _handlers, _data, this.getGlobalData(), this.state.filterEvent, this.state.appliedFilters);
    
    if (isEmpty(_data) && this.state.filterEvent) _data = this.state.filterEvent.value;
    this.setState({data: _data, total: _total, isFeching: false});
  }
  
  /**
   * FILTERS
   **/
  getFilters() {
		let filters;
  	
    if (Array.isArray(this.props.filters)) {
      filters = this.props.filters.map(filter => {
         filter.onChange = this.onFilter.bind(this, filter);
         return React.createElement(Registry.get('Filter'), filter);
      });
	  }
    return filters;
  }
  
  // onFilter sets new state
  // this triggers applyOwnFilters -> handleFiter
  // @@TODO fid should be array index
  onFilter(filter, e) {
    if (this.props.multi) return this.onFilterMulti(filter, e);

    let fid = 'fid'+filter.cid;
    let own = this.state.ownParams || {};
    let newQFragment = {};

    // asFilter components use state.data as their stored filter value
    if (this.props.asFilter) {
      newQFragment[this.props.cid] = e.value;
    } else {
      newQFragment[this.props.cid] = 'fid' + filter.cid + '__' + e.value;
    }

    const newQ = Object.assign(this.props.location.query, newQFragment);
    let newQueryString = decodeURIComponent(objToQueryString(newQ)).replace(/\[\]/g, '');
    browserHistory.push(this.props.location.pathname + '?' + newQueryString);
    
    // Update state with new filter values
    let z = {};
    
    z[fid] = e.value;
    let newState = Object.assign(own, z);
    this.setState({ownParams: newState});
  }
 
  // the big deal here is that multi fiter values are arrays
  // note that we overwrite data and ownParams with every update
  // @@TODO - Address multi type for component filters
  // @@TODO this shares code with onFilter - refactor?
  onFilterMulti(filter, e) {
    let newQFragment = {};
    let z = [];
    let newQ, newQueryString, newState;
    
    e.forEach(_e => {
      if (this.props.asFilter) {
        if (newQFragment[this.props.cid]) {
          newQFragment[this.props.cid].push(_e.value)
        } else {
          newQFragment[this.props.cid] = [_e.value]
        }
      } else {
        return console.error('"Multi" type is not currently supported for component filters, only for components with "asFilter" prop, and really only for Autocomplete component ');
       // newQFragment[this.props.cid] = 'fid' + filter.cid + '__' + e.value;
      }
      z.push(_e.value);
    });
    newQ = Object.assign(this.props.location.query, newQFragment);
     
    if (isEmpty(newQFragment)) delete newQ[this.props.cid];
    
    newQueryString = decodeURIComponent(objToQueryString(newQ)).replace(/\[\]/g, '');
    browserHistory.push('/?' + newQueryString);
    this.setState({ownParams: z, data: z}); 
  }
  
  // add datahandlers to stack
  handleFilter(filter, e) {
    let handlers = Object.assign([], filter.dataHandlers);
    
    this.setState({filterHandlers: handlers, filterEvent: e});
    setTimeout(() => {this.fetchData()},10); // @@TODO - this is obv. wrong but we need state 
  }

  
  /**
   * @@TODO fid should be filter index
   * + parse fids from ownParams 
   * + call onFilter with the appropriate data
   **/
  applyOwnFilters() {
    const ownParams = this.state.ownParams;
    let ownFilters = [];
    
    if (ownParams) {
      // multi filters
      if (isArray(ownParams)) {
        this.handleFilter(this, {value: ownParams});
      } else {
       for (var p in ownParams) {
         let fid = getFID(p);
         let z = {};
         z.value = ownParams[p];
         if (fid && this.props.filters) {
           const filter = this.props.filters[fid];
           this.handleFilter(filter, z);
         } else if (this.props.asFilter) {
           this.handleFilter(this, z);
         }
       }
     }
    }
  }  


  emit(payload) {
    EventDispatcher.dispatch(payload);
  }


  getGlobalData() {
    return this.props.globalData || [];
  }

  addResizeListener() {
    this._resizeHandler = (e) => {
      let componentWidth = findDOMNode(this).getBoundingClientRect().width;
      
      this.setState({ componentWidth : componentWidth});
      this.onResize(e);
    }
    window.addEventListener('resize', this._resizeHandler);
  }
  
  /**
   * Abstract
   */

  onResize() {
    /* IMPLEMENT */
  }

  onAction() {
    /* IMPLEMENT */
  }
  
}
