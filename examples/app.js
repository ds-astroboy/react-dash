import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { settings } from './settings';
import { Router, Route, browserHistory } from 'react-router';
import { Dashboard, Dataset } from '../src/ReactDashboard';
let _settings;
import { omit } from 'lodash';

// get settings object from global, if available
if (typeof expressDashSettings != "undefined") {
   _settings = expressDashSettings;
} else {
  _settings = settings;
}


// Extend Dashboard with our data fetch logic
// @@TODO - this is a good case for a higher order function as mariano discussed 
class Dash extends Dashboard {
  getDashboardData() {
    let dashData = Object.assign({}, this.state.data);
    let dataKeys = Object.keys(this.props.dataResources);
    
    dataKeys.forEach(dataKey => {
      this.fetchBackend(this.props.dataResources[dataKey]).then(data => {
        dashData[dataKey] = data.hits;
        if (Object.keys(dashData).length === dataKeys.length) {
          this.setState({data: dashData});
        }
      }).catch(e => {
        console.log('Error fetching dashboard data', e);
      });  
    });
  }

  /**
   * Use backends to fetch data and query the result
   */
  fetchBackend(fetcher) {
    console.log('FFF_', omit(fetcher.fetchData, 'type'));
    return new Promise((resolve, reject) => {
      let dataset = new Dataset(omit(fetcher.fetchData, 'type'));
      let queryObj = this.state.queryObj;
      this.setState({isFeching: true, dataset: dataset});
      dataset.fetch().then((data) => {
        this.state.dataset.query(queryObj).then(queryRes => {
          console.log('fetched data', queryRes);
          resolve(queryRes);
        })
      }).catch(e => {
          reject(e);
      });
    });
  }
}

// Now wrap the Dashboard so we can pass Routing info from the App
class MyDashboard extends Component {
  render() {
    let z = {};
    z.appliedFilters = (this.state) ? this.state.appliedFilters : {};
    const props = Object.assign({}, this.props, z, _settings);
    return <Dash {...props}/>
  }
}

// Wrap Dashboard component in router
class App extends Component {
  render() {
    return (
      <div id="router-container">
        <Router history={browserHistory}>
          <Route path='*' component={MyDashboard} />
          <Route path='/react-dashboard' component={MyDashboard} />
        </Router>
      </div>
    )
  }
}

// Now put it in the DOM!
document.addEventListener('DOMContentLoaded', function(event) {
    ReactDOM.render(<App/>, document.getElementById('root'));
});
