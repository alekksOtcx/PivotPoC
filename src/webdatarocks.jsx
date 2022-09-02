import React from 'react';
import * as Papa from 'papaparse'
import * as WebDataRocksReact from 'react-webdatarocks';
import Chart from 'chart.js/auto';
import * as pivotCss from './pivot.css';

const SAMPLE_DATA = "localhost:8081/RunsSamples.csv";
const REPORT = "http://localhost:8081/report.json";

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
class WebDataRocksPivotTable extends React.Component {

  chartRef = React.createRef()

    constructor(props) {
      super(props);
      fetchSampleData().then((result) => {
        console.log(result.data);
        this.setState({ data: result.data });
        var bidIndex = result.data[0].findIndex(val => val == "Bid");
        var maxBid = parseFloat(result.data[1][bidIndex]);
        for (var i = 2; i < result.data.length-1; i++){
          maxBid = Math.max(parseFloat(result.data[i][bidIndex]), maxBid);
        }
        this.setState({ maxBid: maxBid });
      });
      this.customizeCellFunction = this.customizeCellFunction.bind(this);
    }

    componentDidMount(){
      const myChartRef = this.chartRef.current.getContext("2d");
      new Chart(myChartRef, {
        type: "line",
        data: {
          labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          datasets: [{ 
            data: [86,114,106,106,107,111,133],
            label: "Total",
            borderColor: "#3e95cd",
            backgroundColor: "#7bb6dd",
            fill: false,
          }, { 
            data: [70,90,44,60,83,90,100],
            label: "Accepted",
            borderColor: "#3cba9f",
            backgroundColor: "#71d1bd",
            fill: false,
          }, { 
            data: [10,21,60,44,17,21,17],
            label: "Pending",
            borderColor: "#ffa500",
            backgroundColor:"#ffc04d",
            fill: false,
          }, { 
            data: [6,3,2,2,7,0,16],
            label: "Rejected",
            borderColor: "#c45850",
            backgroundColor:"#d78f89",
            fill: false,
          }
          ]
        },
      });
    }

    reportcomplete() {
      pivot.off("reportcomplete");
      createPolarAreaChart();
    }

     customizeCellFunction(cellBuilder, cellData) {
      if (cellData.type == "value" && cellData.measure.name == "Offer") {
        if (cellData.label >= 2) {
          cellBuilder.addClass("highOffer");
        } else if (cellData.label <= 1.20){
          cellBuilder.addClass("lowOffer");
        } else {
          cellBuilder.addClass("midOffer");
        }
      } else if (cellData.type == "value" && cellData.measure.name == "Bid"){
        if (this.state.maxBid - parseFloat(cellData.label) <= 0.0000001) {
          cellBuilder.addClass("maxBid");
        }
      }
    }

    render() {
        return (
          <div>
            <div>
              <WebDataRocksReact.Pivot
                toolbar={true}
                componentFolder="https://cdn.webdatarocks.com/"
                width="100%"
                customizeCell={this.customizeCellFunction}
                report={REPORT}
              />
            </div>
            <div>
              <canvas id="myChart" width="800" height="500"  ref={this.chartRef}/>
            </div>
          </div>
        );
    }
}

export { WebDataRocksPivotTable }