import React, { Component } from 'react';
import { Card, BaseComponent, Dataset, DataHandler, DataHandlers, Registry, EventDispatcher } from '../ReactDashboard';
import { isArray, isEqual, pick} from 'lodash';

export default class Dashboard extends BaseComponent {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    super.componentWillMount();
    this.applyUrlFilters();
    this.getDashboardData();
  }

  componentDidUpdate(nextProps, nextState) {
    if (!isEqual(nextState.appliedFilters, this.state.appliedFilters)) {
      this.getDashboardData();
    }
  }
  
  /**
   * Apply datahandlers in sequence, passing data returned to subsequent handler
   *    makes global leve data and @@TODO event object available to ahndler
   **/
  _applyDataHandlers(datahandlers, componentData=[]) {
    let _handlers = datahandlers;
    let _appliedFilters = this.state.appliedFilters || {};
    let _data = DataHandler.handle.call(this, _handlers, componentData, this.state.data, {e:'foo'}, _appliedFilters);
    return _data;
  }

  applyUrlFilters() {
    let q = this.props.location.query;
    let appliedFilters = {};

    console.log('aURL0',q, Object.keys(q));
    Object.keys(q).forEach(key => {
      let payload = {}; // mock url filter as regular Dashboard filter
      payload.field = key;
      payload.value = q[key];
      appliedFilters = this.getUpdatedAppliedFilters(payload, appliedFilters);
      console.log('>>><>', payload, appliedFilters);
    });

    console.log('aURL1', appliedFilters);

    this.setState({appliedFilters: appliedFilters});
    // turn this into something that looks 
  }

  /**
   * Override this method in your application and insert data fetching stuff here!
   *    API integrations
   *    Flat file Loading
   *    Whatever you want
   **/
  getDashboardData() {
    console.log('Warning. getDashboardData should be defined in your application which extends this dashboard component. getDashboardData should return an object with dataKeys. See @@LINK');
  }

  
  /**
   * Maps data to components based on component settings
   **/
  getChildData(component) {
    let data = [];

    if (component.dataHandlers) {
      data = this._applyDataHandlers(component.dataHandlers, component.data);
    } else if (component.data) {
      if (component.data.length > 0) {
        data = component.data;
      }
    }
    
    return data;
  }
  
  /**
   * Figure out which appliedFilters apply to which dataKeys
   **/
  getFilters(key) {
    let filters = [];
    let appliedFilters = Object.assign({}, this.state.appliedFilters);
    let toFilter = Object.keys(appliedFilters).filter(k => { 
      let next = appliedFilters[k];
      if (next && next.willFilter && next.willFilter.length > 0 ) {
        let will = next.willFilter.indexOf(key);
        return (will >= 0);
      }
    });
    
    toFilter.forEach(filter => {
      let addThis = {};
      let vals = appliedFilters[filter].value.map(row  => {
        return (!isNaN(row.value)) ? parseInt(row.value) : row.value;
      })
      addThis[filter] = vals;
      filters.push(addThis);
    });

    return filters;
  }

  getFilterByField(field) {
    let filter;

    this.props.regions.forEach(region => {
      return region.children.forEach(child => {
        if (child.field === field) filter = child; 
      })
    });

    return filter;
  }

  /**
   * Handle actions here.
   *    Update appliedFilters on state triggers re-render
   *    App parses appliedFilters and updates dash accordingly
   **/
  onAction(payload) {
    switch(payload.actionType) {
      case 'AUTOCOMPLETE_CHANGE':
        console.log('0000000');
        let appliedFilters = Object.assign({}, this.state.appliedFilters);
        let updatedAppliedFilters = this.getUpdatedAppliedFilters(payload, appliedFilters);
        console.log ('>>>>>>>>>>>', updatedAppliedFilters);
        this.setState({appliedFilters: updatedAppliedFilters});
        break;
      
      default:
        console.warn('Actions should define an actionType. See docs @@LINK');
    } 
  }

  getUpdatedAppliedFilters(_payload, appliedFilters) {
    let field = _payload.field;
    let filter = this.getFilterByField(field);
    let payload = Object.assign(_payload, filter);

    console.log('FILTERbyF',filter, payload);

    // value is a non-empty array of values
    if (isArray(payload.value) && payload.value.length > 0) {
      payload.vals = payload.value.map(row => {
        if (!isNaN(row.value)) return parseInt(row.value);  // ints are easier
        return row.value;
      });
      appliedFilters[field] = payload;
    } else if (payload.value && payload.value.value) { // payload value is an object with a value attribute
      if (!isNaN(payload.value.value)) payload.value.value =  parseInt(payload.value.value);  // ints are easier
      payload.value = [payload.value]
      appliedFilters[field] = payload;
    } else if (payload.value && typeof payload.value === 'string' || typeof payload.value === 'number') { // payload value is a scalar value
      console.log('gAppl-3');
      payload.value = [payload.value];
      appliedFilters[field] = payload;
    } else { // if there is no value, remove this filter from appliedFilters
      delete appliedFilters[field];
    }

    return appliedFilters;
  }
  
  render() {
    let markup;
    let routeParams = pick(this.props, ['history', 'location', 'params', 'route', 'routeParams', 'routes']);
    console.log('DASH RENDER', this);
    return (
        <div className="container">
          <link rel="stylesheet" type="text/css" href={this.props.faPath} />
          <h1 className="dashboard-title">{this.props.title}</h1>
          {this.props.regions.map( (region, key) => {
            
            if (region.multi) {
              let multiRegionKey = this.getChildData(region);
              region.children = region.elements[multiRegionKey];
            }

            return (
              <div id={region.id} className={region.className} >
                {region.children.map( (element, key) => {
                  let isReactEl = React.isValidElement(element);
                  let output;
                  let el;
                  // if it isn't a react element, the element is a settings object
                  let _props = (isReactEl) ? element.props : element;
                  let props = Object.assign({}, _props);
                  
                  props.data = this.getChildData(element) || [];
                  props.globalData = Object.assign({}, this.state.data || {});
                  props.appliedFilters = Object.assign({}, this.state.appliedFilters || {});
                  props.vars = Object.assign({}, this.props.vars || {});
                  props.routeParams = routeParams;

                   el = (isReactEl) ? element : React.createElement(Registry.get(element.type), props);

                  if (props.cardStyle) {
                    output = 
                      <Card key={key} {...props}>
                        {el}
                      </Card>
                  } else {
                    output = el;
                  }

                  return output;
                })}  
              </div>
            )
          })}
        </div>
    );
  }
}
