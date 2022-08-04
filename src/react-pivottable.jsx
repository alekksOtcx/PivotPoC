import React from 'react';
import * as Papa from 'papaparse'
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers'
import Cookies from 'universal-cookie';

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
      const cookies = new Cookies();
      var defaultRows = cookies.get("newRows") || result.data[0];
      var defaultColumns = cookies.get("newColumns");
      this.setState({ data: result.data, defaultRows, defaultColumns, pivotState: this.state.pivotState });
    });
  }

  onRefresh(pivotState) {
    if (pivotState.rows || pivotState.cols) {
      const cookies = new Cookies();
      cookies.set("newColumns", pivotState.cols, { path: "/" });
      cookies.set("newRows", pivotState.rows, { path: "/" });
    }
    }

  render() {
    var currencyUSDFilter = {
      //hides usd by default
      "Currency": {
        "USD": false,
      },
    };
    return (
      <div>
        <div>
          <PivotTableUI
            data={this.state.data}
            rows={this.state.defaultRows}
            cols={this.state.defaultColumns}
            valueFilter={currencyUSDFilter}
            onRefresh={this.onRefresh(this.state)}
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