export var store = {
  title: 'Georgia Reports',
  regions: {
    top: [
      {
        type: 'Autocomplete',
        name: 'some-name',
        multi: true,
        url: 'http://localhost:3004/options?q={{keyword}}',
        onChange: {
          type: 'function',
          name: 'onAutocompleteChange'
        },
        cardStyle: 'none'
      },
      {
        header:'Top',
        type: 'Chart',
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
        cardStyle: 'card',
        data: {
          type: 'function',
          name: 'getData',
          args: [
            ['value', 'label']
          ]
        }
      }
    ],
    middleFirst: [
      {
        type:'Metric',
        cardStyle: 'metric',
        background: '#9F3E69',
        number: {
          type: 'function',
          name: 'getRandomMetric'
        },
        caption: 'New Users',
      }
    ],
    middleSecond: [
      {
        type:'Metric',
        cardStyle: 'metric',
        background: '#F3BA4F',
        number: {
          type: 'function',
          name: 'getRandomMetric'
        },
        caption: 'Visitors',
      }
    ],
    middleThird: [
      {
        type:'Metric',
        cardStyle: 'metric',
        background: '#3EB1AE',
        number: {
          type: 'function',
          name: 'getRandomMetric'
        },
        caption: 'Page views',
      }
    ],
    middleFourth: [
      {
        type:'Metric',
        cardStyle: 'metric',
        background: '#0B90B1',
        number: {
          type: 'function',
          name: 'getRandomMetric'
        },
        caption: 'Unique Visitors',
      }
    ],
    left: [
      {
        header:'Left',
        iconClass: 'glyphicon glyphicon-fire',
        type: 'Chart',
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
        cardStyle: 'card',
        data: {
          type: 'function',
          name: 'getData',
          args: [
            'http://data.com/data.json'
          ]
        }
      },
      {
        type: 'Table',
        data: {
          type: 'function',
          name: 'getTableData'
        },
        cardStyle: 'table',
        settings: {
          table: {
            rowHeight: 50,
            width: 800,
            maxHeight: 5000,
            headerHeight:50
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
            height: 50,
            width: 500,
            overrides: {
              1: {
                height: 60
              }
            }
          }
        }
      },
    ],
    right: [
      {
        header:'Right',
        type: 'Chart',
        iconClass: 'glyphicon glyphicon-exclamation-sign',
        settings: {
          id:'barChart',
          type: 'discreteBarChart',
          x: 'label',
          y: 'value',
          height: 300,
          margin: {
            left: 38
          },
          color: ['#82899B']
        },
        cardStyle: 'card',
        data: {
          type: 'function',
          name: 'getData',
        }
      },
      {
        header: 'This is an awesome text',
        type: 'Text',
        content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut erat dui, sodales eleifend placerat a, dictum sed tortor.</p><p> Quisque porttitor urna in est vehicula, a molestie nunc pharetra. Cras vehicula nisi dui, ut aliquam nunc vulputate lacinia. Curabitur vitae interdum dolor, sed venenatis tellus. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam volutpat metus et ipsum lobortis, at porttitor nunc laoreet.</p><p>Nullam et ligula at enim pretium accumsan. In et facilisis enim, vel consectetur justo. Duis eleifend sit amet neque eu interdum. Sed ornare orci diam, ac finibus ipsum posuere vel. Duis maximus velit ipsum, et mattis massa tempus sit amet. Suspendisse potenti.</p>',
        cardStyle: 'card',
      }
    ],
  }
};