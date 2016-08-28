import DataHandler from '../src/utils/DataHandler'

let customDataHandlers = {
  getXYByQueryData: function (componentData, dashboardData, handler, e, pipelineData) {
    console.log('gbXY', arguments);
    if (componentData && componentData.length > 0) {
      console.log('gXY-A');
      let localData = componentData[handler.queryKey].result.records;
      let output =  localData.map(row => {
        return {age: row.age, count_age: row.count_age }
      });
      return [output];
    } 
  },

  groupByRange: function (componentData, dashboardData, handler, e, pipelineData) {
    let data = pipelineData || componentData;
    console.log('BYRANGE', arguments, data);
    let finalOutput = []; // array of series
    data.forEach(series => {
      let outputSeries = []; // an array of objects
      for (let i in handler.ranges) {
        let lowerBound = handler.ranges[i][0];
        let upperBound = handler.ranges[i][1];
        let xVal = lowerBound + ' - ' + upperBound;
        let yVal = 0;
        let groupedRow = {};
        // loop through vals for current range, if it's in the range, add to the running yVal sum;
        series.forEach(row => {
          // if it's in the range, add it to this range's sum
          if (row[handler.xField] >= lowerBound && row[handler.xField] <= upperBound) {
            yVal += parseInt(row[handler.yField]);
          }
        })
        
        groupedRow[handler.xField] = xVal;
        groupedRow[handler.yField] = yVal;
        outputSeries.push(groupedRow);
      }
      // now add our transformed series to the array of series for output
      finalOutput.push(outputSeries);
    });

    console.log('FF', finalOutput); 
    return finalOutput;
  },

  getFTE: function (componentData, dashboardData, handler, e, pipelineData) {
    console.log('getFTE', arguments);
    return [['FTE Value']];
  }
}

for (let k in customDataHandlers) {
  DataHandler.set(k, customDataHandlers[k]);
}

export default customDataHandlers;
