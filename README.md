React Dashboard
===============

## What's React Dashboard
* It's a collection of tools (components + utils) that can be used to create dashboards programatically.
* It's a framework to speed up dashboards creation.
* components + configurations + data

## What's not React Dashboard
* Is not a tool to transform data.
* Is not an end user tool.

## Where is the UI to build dashboards
There is no UI. All is created from code.

## Why?
Because the main goal of this library is to be flexible and code give all the flexibility we need.

## Requirements
* React
* ReactDOM

## Quick start
Using the boilerplate repository is the easiest way to start playing with this library.

```
git clone git@github.com:NuCivic/react-dashboard-example.git
npm install
npm run dev_standalone
open http://localhost:5000
```

## How it works

All the dashboard configuration is stored in a javascript object inside the file src/settings.js. It's a hierarchical representation of a dashboard. They are composed of regions and each region store elements. This elements contains the required information to instantiate a React component base in the type key.

When a dashboard is created it uses the layout configured in the settings an this layout call the renderRegion method which iterates over all the elements for that region. Then the renderRegion method creates the React component with the name set in the type key of that object. Rest of properties of this object is passed to the component as react props.


## Entry point
The entry point of the application is either the src/standalone.js or src/dkan.js depending on the environment you want to use. All the custom components you create needs to be imported in this file. For example we are importing the custom component GAChart which is a subclass of the Chart component.

With all the custom components imported we need to wait until the dom is ready and then render the dashboard in the target dom element.

```javascript
import GAChart from './components/GAChart';
import GAChoropleth from './components/GAChoropleth';
import GATable from './components/GATable';
import GAMetric from './components/GAMetric';
import GAGoal from './components/GAGoal';
import MyCustomLayout from './layouts/MyCustomLayout';
import GADashboard from './dashboard';

/**
 * This renders the GADAshboard
 */
document.addEventListener('DOMContentLoaded', function(event) {
  ReactDOM.render(<GADashboard {...settings} layout={MyCustomLayout}/>, document.getElementById('root'));
});
```

To start you need to create a class extending the Dashboard base class. In the above example you could notice we are not rendering a <Dashboard/> component but the <GADashboard/> component. This is because most of base components are useless without the custom implementation for the project you are working on.
They are like abstract classes and you need to provide the bussines logic to make it work.

## Dashboard configuration
A dashboard configuration looks like this:

```javascript
export var settings = {
  title: 'Georgia Reports',
  regions: {
    top: [
      {
        type: 'Chart'
        ...
      }
      ...
    ],
    left: [],
    ....
  }
}
```

The name of that regions should be available in the layout you are currently using. 

## Layouts
To define a custom layout you need to extend from the base class Layout. That class provides the renderRegion method you need to use to render regions.

Note at the end the Registry.set call. That's mandatory in order to let it know to the dashboard the existence of a new layout. The same applies to all the custom components you create.

```javascript
import React from 'react';
import Layout from '../../src/components/Layout';
import Registry from '../../src/utils/Registry';

export default class MyCustomLayout extends Layout {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-12">{this.renderRegion(this.props.regions.top)}</div>
        </div>
        <div className="row">
          <div className="col-sm-6 col-lg-3">{this.renderRegion(this.props.regions.middleFirst)}</div>
          <div className="col-sm-6 col-lg-3">{this.renderRegion(this.props.regions.middleSecond)}</div>
          <div className="col-sm-6 col-lg-3">{this.renderRegion(this.props.regions.middleThird)}</div>
          <div className="col-sm-6 col-lg-3">{this.renderRegion(this.props.regions.middleFourth)}</div>
        </div>
        <div className="row">
          <div className="col-md-4">{this.renderRegion(this.props.regions.goalsFirst)}</div>
          <div className="col-md-4">{this.renderRegion(this.props.regions.goalsSecond)}</div>
          <div className="col-md-4">{this.renderRegion(this.props.regions.goalsThird)}</div>
        </div>
        <div className="row">
          <div className="col-md-6">{this.renderRegion(this.props.regions.left)}</div>
          <div className="col-md-6">{this.renderRegion(this.props.regions.right)}</div>
        </div>
        <div className="row">
          <div className="col-md-12">{this.renderRegion(this.props.regions.bottom)}</div>
        </div>
      </div>
    );
  }
}

Registry.set('MyCustomLayout', MyCustomLayout);
```

In the example we are using a custom layout with the following regions:
top, middleFirst, middleSecond, middleThird, middleFourth, goalsFirst, goalsSecond, goalsThird, left, right and bottom.

As final step you need to import into the application your just baked layout:

```javascript
// This should be placed in the entry point
import MyCustomLayout from './layouts/MyCustomLayout';
```

## Adding components

Most of components uses data pulled from somewhere to produce an output (there are some exceptions like the Text component which get the data from its configuration). 

Then before start adding components you need to figure out how to get the data to feed the component. 

Let's try to add a chart:

```javascript
export var settings = {
  title: 'Georgia Reports',
  regions: {
    top: [
      {
        header:'Left',
        iconClass: 'glyphicon glyphicon-fire',
        type: 'GAChart',
        settings: {
          id:'lineChart',
          type: 'discreteBarChart',
          x: 'label',
          y: 'value',
          height: 300,
          margin: {
            left: 38
          },
        },
        fetchData: {type:'function', name: 'getCustomData'},
      },
      ...
    ],
    left: [],
    ....
  }
}
```

All the components has the ability to fechData in several ways. In this case we are configuring the GAChart component to use the method getCustomData to fetchData. This method should be implemented in the subclass and must return either a promise or an array with the data.

For example:

```javascript
// imports
class GAChart extends Chart {
  
  // Synchronous
  getCustomData() {
    return [{key: 'serie1', values: [{x:1, y:1}...] }];
  }

  // Asynchronous
  getCustomData2() {
    return new Promise((resolve, reject) => {
      let dataset = new Dataset({
        backend: 'csv',
        url: 'http://demo.getdkan.com/node/9/download'
      });
      return dataset.fetch().then(() => {
        dataset.query({size: 100, from: 0}).then((data) =>{
          resolve(data.hits)
        });
      });
    });
  }
} 

```
In the above example we have two different methods to fetch data. The first one it's a synchronous call that retrives an array. 

But return an array with data from a function is not very exciting. However we can acces to the data loaded by the dashboard and then process that global data to obtain the data for this element:

```javascript
  getCustomData() {
    return this.props.globalData.filter((record) => record.state === 'georgia');
  }

```
If the data to be used is static then we can place it in the element configuration at the settings file:

```javascript
{
  fetchData: [{key: 'serie1', values: [{x:1, y:1}...] }]
}

```

If you look at the method getCustomData2 you'll notice we don't transform the data in any way. We are using the csv as it is. If that your case then you can use the following method:

```javascript
{
  fetchData: {type: 'backend', backend: 'csv', url: 'http://example.com/example.csv'}
}

```
This is a common scenario for table components.

## Layouts
<React Dashboard> provides a default layout ``layouts/Geary.js`` but you can also create your own layouts. 

To create your own layout add a file to your example project such as the following:
```javascript
import React from 'react';
import Layout from 'react-dashboard/Layout';
import Registry from 'react-dashboard/Registry';

export default class MyCustomLayout extends Layout {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-12">{this.renderRegion(this.props.regions.top)}</div>
        </div>
        <div className="row">
          <div className="col-md-3">{this.renderRegion(this.props.regions.middleFirst)}</div>
          <div className="col-md-3">{this.renderRegion(this.props.regions.middleSecond)}</div>
          <div className="col-md-3">{this.renderRegion(this.props.regions.middleThird)}</div>
          <div className="col-md-3">{this.renderRegion(this.props.regions.middleFourth)}</div>
        </div>
        <div className="row">
          <div className="col-md-6">{this.renderRegion(this.props.regions.left)}</div>
          <div className="col-md-6">{this.renderRegion(this.props.regions.right)}</div>
        </div>
        <div className="row">
          <div className="col-md-12">{this.renderRegion(this.props.regions.bottom)}</div>
        </div>
      </div>
    );
  }
}

Registry.set('MyCustomLayout', MyCustomLayout); 
```

Layouts are composed of regions. You can create any number of regions by calling the renderRegion method with the region object: 

```javascript
{this.renderRegion(this.props.regions.myCustomRegion)}
```
Note that we are registering the component using the Registry set method. This is a requirement to make Components available inside layouts. Every time you create a new component you'll need to register it.

## Actions
Sometimes you need to notify other components about a change that happen in the application. 

For example change the underlying dashboard data right after the user added a new selection in the autocomplete. Such communication is handled through actions. 

All the components have a method called emit which purpose is to fire actions and an onAction method that is automatically called when an action is fired from any component.

It's worth mentioning the emit method could fire any javascript object. By convention it should have an actionType but the rest is up to you.

```javascript

// Component emitting a change
onClick(){
  this.emit({
    actionType: 'CHANGE',
    data: data
  });
}

// Component receiving a change
onAction(action){
  switch(action.actionType){
    case 'CHANGE':
      // Do some in
      break;
  }
}
```

## Theming
If you don't like the default styles or you want to customize them then you need to import the stylesheet you want to use:

```
// file: entry point 
// standalone.js or dkan.js
import 'stylesheets/custom.css'
```

Currently it accepts either a css or a sass file. You can also add import sentences inside to split the files. It's good to have a separate stylesheet for each component you are overriding. 

## Built-in Components
### Autocomplete

The autocomplete it's using the react select component https://github.com/JedWatson/react-select. As result all the react select configurations can be passed in the element configuration.

Usually you will not need to extend this component because their behavior is pretty standard and its highly configurable.


```javascript     
{
  type: 'Autocomplete',
  name: 'some-name',
  multi: true,
  url: 'http://localhost:3004/options?q={{keyword}}',
},
```
**Available settings**
* **url:** url to fetch the options base on the keyword you typed in the input.
* **multi:** you can enable multi-value selection by setting multi to true. 
* **name:** an arbitrary name.
* **options:** an array with options (e.g.: [{ value: 'one', label: 'One' }])

### Metric
Metrics are intended to display a computed single value to the end user. The basic class Metric should be extended to the methods to get each metric. 
Normally you will compute metrics derived from the globalData prop by performing some aggregations. 

If you want to get the metric from a different resource that globalData then you can add the fetchData property and configure it to fecth the data you want.

```javascript
{
  type:'GAMetric',
  background: '#9F3E69',
  metric: 'getRandomMetric',
  caption: 'New Users',
  fetchData: {type: 'function', name: 'externalData'}
}
```

**Available settings**
* **background:** the background color to be used for this metric. 
* **metric:** a function defined in the subclass component that retrives the metric number. 
* **caption:** a description to be displayed 
* **options:** an array with options (e.g.: [{ value: 'one', label: 'One' }])

### Card
A card is a html wrapper to keep the styles consistency across elements. This class can't be override it. 

Card can't be configured but it display the header and footer configured in the element configuration object.

For example:

```javascript
{
  header: 'Hello Metric',
  type:'GAMetric',
  metric: 'getRandomMetric',
  caption: 'New Users',
  footer: 'This is a footer text',
}
```

### Dashboard

This is the top parent element of a dashboard. Commonly you will extend the dashboard class with your custom dashboard subclass. The reason of this is you probably want to provide a custom way to fetch the data. 
However if your data is just a plain CSV file (or any resource supported by backends) and you don't need to perform transformations on it then you can use the fetchData property.

### Text
Text component allows you to create a block of text by setting the content property with the desired html.

```javascript
{
  header: 'This is an awesome text',
  type: 'Text',
  content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut erat dui, sodales eleifend placerat a, dictum sed tortor.</p><p> Quisque porttitor urna in est vehicula, a molestie nunc pharetra. Cras vehicula nisi dui, ut aliquam nunc vulputate lacinia. Curabitur vitae interdum dolor, sed venenatis tellus. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam volutpat metus et ipsum lobortis, at porttitor nunc laoreet.</p><p>Nullam et ligula at enim pretium accumsan. In et facilisis enim, vel consectetur justo. Duis eleifend sit amet neque eu interdum. Sed ornare orci diam, ac finibus ipsum posuere vel. Duis maximus velit ipsum, et mattis massa tempus sit amet. Suspendisse potenti.</p>',
}
```

### Table
Table component provides a way to browse, filter, search and display datasets to end users. 

```javascript    
{
  type: 'GATable',
  header: 'Mi titulo',
  fetchData: {
    type:'backend',
    backend: 'csv',
    url: 'http://demo.getdkan.com/node/9/download',
  },
  settings: {
    table: {
      rowHeight: 40,
      width: 800,
      maxHeight: 300,
      headerHeight:40
    },
    columns: {
      flexGrow: 1,
      width: 150,
      overrides: {
        a1: {
          flexGrow: 0.5
        }
      }
    },
    cells: {
      height: 40,
      width: 500,
      overrides: {
        1: {
          height: 40
        }
      }
    }
  }
},
```
**Available settings**
* **settings**:
  - **settings.table:** allows to configure all the properties for a table
  - **settings.columns:** allows to configure all the properties for columns
    - **overrides:** allows to override configurations for the column name number used as key.
  - **settings.cells:** allows to configure all the properties for cells
  - **overrides:** allows to override configurations for the cell in the row number used as key.

### Chart
Chart component is a wrapper of the react-nvd3 library which also is a wrapper of the nvd3 chart library. Therefore all the charts and options available in nvd3 are also available in this component.

#### React NVD3 documentation: 
https://github.com/NuCivic/react-nvd3

#### NVD3 documentation: 
https://nvd3-community.github.io/nvd3/examples/documentation.html

```javascript
{
  header:'Top',
  type: 'GAChart',
  iconClass: 'glyphicon glyphicon-tree-conifer',
  settings: {
    id:'lineChart2',
    type: 'discreteBarChart',
    x: 'label',
    y: 'value',
    height: 340,
    margin: {
      left: 38
    },
    color: ['#EA7E7E']
  },
  fetchData: {type:'function', name: 'getData'},
}
```

Notice all the chart configuration goes inside the settings object. **id, type, fetchData and height are mandatory.** If your data already have the x and y columns named properly then you don't need to specify the x and y settings. 

### Choropleth Map

```javascript
{
  header: 'GAChoropleth Test',
  type: 'Choropleth',
  settings: {
    colors:['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'pink','violet', 'darkmagenta'],
    cssPath: '/static/choropleth.css',
    showTooltip: {true},
    domainField: 'rate',
    levels: 9,
    domainLower: 0,
    domainUpper: .15,
    legendHeader: "Per Cent Unemploytment by U.S. County",
    width: 1200,
    height: 600,
    domainKey: 'id',
    dataset: {
      backend: 'csv',
      url: '/data/unemployment.tsv',
      delimiter: '\t'
    },
    mapFormat: 'topojson',
    mapDataUrl: '/data/us.json',
    polygon: 'counties',
    mesh: 'states',
    projection: 'albersUsa',
    showGraticule: true,
  },
  fetchData: {type:'function', name: 'getData'},
},
```

### Goal


```javascript
{
  type: 'GAGoal',
  title: '',
  caption: 'number of schools enrollments',
  link: 'http://tootherplace.com',
  icon: 'glyphicon-gbp',
  startDate: '03/24/2016',
  endDate: '04/24/2016',
  startNumber: 0,
  endNumber: 200,
  action: 'increase',
  background: 'white',
  // trackStatus: 'function',
  tolerance: [
    {from: 0, to: 2, label: 'On Track', color: 'green'},
    {from: 2, to: 5, label: 'Needs Improvement', color: 'orange'},
    {from: 5, to: Infinity, label: 'Off Track', color: 'red'},
  ],
  spline: {
    height: 50,
  },
  fetchData: {type:'function', name: 'getData'},
  metric: 'getRandomMetric'
}
```
**Available settings**
* **caption:** caption text using in the component. Only plain text is allowed. 
* **link:** a url to redirect users when they click in the goal.
* **startDate:** date when you start to messure your goal
* **endDate:** date when you needs to reach the goal.
* **startNumber:** amount of units you start with. 
* **endNumber:** amout of units you want to reach.
* **action:** the action you want to accomplish. There are 6 possible values:
  -  increase: your goal is to increase the number of units. If the number of units are equal or greater than the endNumber then goal is on track.
  -  decrease: your goal is to decrease the number of units. If the number of units are equal or lower than the endNumber then goal is on track.
  - maintain_above: this action is very similar to the increase action except  startNumber and endNumber should be set at the same number.
  - maintain_below: this action is very similar to the decrease action except  startNumber and endNumber should be set at the same number.
  - mesure: in this case you don't want to reach a goal but just display a mesure.
* tolerance: allow you to define a tolerance to define the status of your goal. 

Let's take a look at the above example. In that case if your deviation is between 0 and 2 then the OnTrack label will be displayed because the first item of tolerance will be selected.
Deviation is computed by projecting the number of units base on the startDate, endDate and endNumber and using a linear function. You can override the getTracker and the trackStatus functions if this projection doesn't fit with your needs.


## Development
```
$ git clone git@github.com:NuCivic/react-dashboard.git
$ npm install
$ npm start
$ open http://localhost:3000
```

## Builds
### Standalone Development
### Standalone Production
### DKAN Development
### DKAN Production

## To-do
- Pass global data and arguments to default data handlers
- Allow to rename columns in tables
- Allow to pass strings instead of functions as tick formaters for charts