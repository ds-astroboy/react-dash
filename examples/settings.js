export var settings = {
  title: 'React-Dash Demo -- Climate Indices by Year',
  queries: {},
	// we will add this to globalData in app.js 
  // and use these labels in our customDatahandlers
  climate_vars: {
    PCP: 'Precipitation Index',
    TAVG: 'Temperature Index',
    TMIN: 'Minimum Temperature Index',
    TMAX: 'Maximum Temperature Index',
    PDSI: 'Palmer Drought Severity Index',
    PHDI: 'Palmer Hydrological Drought Index',
    ZNDX: 'Palmer Z-Index',
    PMDI: 'Modified Palmer Drought Severity Index',
    CDD: 'Cooling Degree Days',
    HDD: 'Heating Degree Days',
    SPnn: 'Standard Precipitation Index'
	},
  
  // if defined at the top level, fetchData will populate
  // the dashboard with globalData
  dataResources: {
    climateData: {
      fetchData: {
        type: 'backend',
        backend: 'csv',
        url: 'https://dl.dropboxusercontent.com/u/73703010/react_dash_data_0.4/climate_indices.csv'
      },
    }
  },

  regions: [
    {
      id: 'top-row filters-row',
      className: 'row',
      children: [
        {
          type: 'Autocomplete',
          className: 'col-md-6',
          name: 'specialty-autocomplete',
          id: 'specialty-autocomplete',
          className: 'specialty-autocomplete',
          field: 'YearMonth',
          action: 'filter', // sort / groupBy / etc
          willFilter: ['climateData'], // array of dkanDataResources keys that filters affect 
          data: [
            [
              { label: '2010', value: '2010' },
              { label: '2011', value: '2011' },
              { label: '2012', value: '2012' },
              { label: '2013', value: '2013' },
              { label: '2014', value: '2014' },
              { label: '2015', value: '2015' },
            ]
          ],
          placeholder: 'Select year to filter dashboard...'
        },
      ]
    },
    {
      id: 'metrics-row',
      className: 'row',
      children: [
        {
          type: 'Metric',
          cardStyle: 'metric',
          iconClass: 'fa fa-level-up',
          className: 'col-md-4',
          caption: 'Maximum Temp.',
          dataHandlers: [
            {
              name: 'getClimateMetric',
              field: 'TMAX'
            }
          ]
        },
        {
          type: 'Metric',
          cardStyle: 'metric',
          iconClass: 'fa fa-level-down',
          className: 'col-md-4',
          background: '#53ACC9',
          caption: 'Minimum Temp.',
          dataHandlers: [
            {
              name: 'getClimateMetric',
              field: 'TMIN'
            }
          ]
        },
        {
          type: 'Metric',
          cardStyle: 'metric',     
          iconClass: 'fa fa-fire',
          className: 'col-md-4',
          caption: 'Average Temp/',
          background: '#C97053',
          dataHandlers: [
            {
              name: 'getClimateMetric',
              field: 'TAVG'
            }
          ]
        }
      ]
    },
    /*
    {
      id: 'map-row',
      className: 'row',
      children: [
        // choropleth
        {
          type: 'Choropleth',
          cid: 'choro1',
          cardStyle: 'map',
          header: 'Palmer Hydrological Drought Index',
          format: 'topojson',
          dataHandlers: [
            {
              name: 'getMapData',
              stateArray: stateIds
            }
          ],
          dataKeyField: 'name',
          dataValueField: 'PHDI',
          geometryKeyField: 'name',
          geometry: 'https://dl.dropboxusercontent.com/u/73703010/react_dash_data_0.4/map/usa.json', // topojson or geojson
          projection: 'albersUsa', // https://github.com/d3/d3/wiki/Geo-Projections
          scaleDenominator: .8,
          borderColor: 'white',
          noDataColor: 'red',
          topologyObject: 'usa',
          startColor: 'red',
          endColor: 'yellow',
          dataClassification: 'equidistant',
          legend: {
            classesCount: 5,
            palleteKey: 'GnBu',
            pallete: ['#ff3333','#ff4d4d','#ff6666','#ff8080','#ff9999','#ffb3b3','#ffcccc'],
          },
        },
      ]
    },
    {
      id: 'text-row',
      className: 'row',
      children: [          
        {
          type: 'Markup',
          content: '<p>Hydrological drought is described as a sustained and regionally extensive occurrence of below average natural water availability (Tallaksen and van Lanen, 2004). Hydrological drought as period of time below the average water content in streams, reservoirs, groundwater aquifers, lakes and soils. The period is associated effects of precipitation (including snowfall) shortfall on surface and subsurface water supply, rather than with direct shortfall in precipitation (Yevjevich et al., 1977). Hydrological drought may be the result of long term meteorological droughts that results in the drying up of reservoirs, lakes, streams, rivers and a decline in groundwater levels (Rathore 2004).</p>'
        }
      ]
    },


    // region pie-charts
    {
      id: 'chart-row',
      className: 'row',
      children: [
        {
          type: 'Chart',
          cardStyle: 'chart',
          header: 'Standard Precipitation Index',
          dataHandlers: ['getBarChartData'],
          settings: {
            type: 'multiBarChart',
            x: 'x',
            y: 'y',
            height: 800
          }
        },
      ]
    }, */
    /*{
      type: 'Region',
      className: 'region-piesI row',
      children: [
        {
          type: 'Chart',
          cardStyle: 'chart',
          header: 'Chart 1',
          style: {borderRight: '1px dotted gray'},
          className: 'col-md-6',
          data: [[{x: 1, y: 40}, {x: 2, y: 40}, {x: 3, y: 20}]],
          dataHandlers: ['NVD3.toPieChartSeries'],
          settings: {
            type: 'pieChart',
            x: 'x',
            y: 'y',
            height: 400
          },
        },
        {
          type: 'Chart',
          cardStyle: 'chart',
          header: 'Chart 2',
          className: 'col-md-6',
          data: [[{x: 1, y: 40}, {x: 2, y: 40}, {x: 3, y: 20}]],
          dataHandlers: ['NVD3.toPieChartSeries'],
          settings: {
            type: 'pieChart',
            x: 'x',
            y: 'y',
            height: 400
          },
        }, 
      ]
    }, */

   {
      id: 'footer',
      className: 'row',
      children: [
        {
          type: 'Markup',
          content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</p>'
        }     
      ]
    }
  ]
}
