import React from 'react';
import * as Papa from 'papaparse'
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers'

// create Plotly renderers via dependency injection
const PlotlyRenderers = createPlotlyRenderers(Plot);

async function fetchSampleData() {
    const processedData =  Papa.parse(await fetchCsv());
    return processedData;
}

async function fetchCsv() {
    const response = await fetch('../sampleData/RunsSampleData.csv');
    const reader = response.body.getReader();
    const result = await reader.read();
    const decoder = new TextDecoder('utf-8');
    const csv = await decoder.decode(result.value);
    return csv;
}

// see documentation for supported input formats

class ReactPivotTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = props;
    fetchSampleData().then((result) => {
      console.log(result.data);
      var defaultRows = result.data[0];
      this.setState({ data: result.data, defaultRows});
    });
  }

  render() {
    var currencyUSDFilter = { //cant get this to do anything
      "currency":{
        "USD": false
      }
    }
    return (
      <div>
        <div>
          <PivotTableUI
            data={this.state.data}
            rows={this.state.defaultRows}
            valueFilter={currencyUSDFilter}
            onChange={(s) => this.setState(s)}
            renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
            {...this.state}
          />
        </div>
      </div>
    );
  }
}

export { ReactPivotTable} 