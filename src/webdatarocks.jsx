import React from 'react';
import * as Papa from 'papaparse'
import * as WebDataRocksReact from 'react-webdatarocks';
import * as pivotCss from './pivot.css';
import { getRunsData } from './dataProvider.js'
import { getReport, mergeReportAndData } from './reportProvider.js'
import Chart from 'chart.js/auto';
import Cookies from 'universal-cookie';


const REPORT = "http://localhost:8080/report.json";

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
  chartRef = React.createRef();
  myRef = null;

  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    fetchSampleData().then((result) => {
      this.setState({ data: result.data });
      var bidIndex = result.data[0].findIndex((val) => val == "Bid");
      var maxBid = parseFloat(result.data[1][bidIndex]);
      for (var i = 2; i < result.data.length - 1; i++) {
        maxBid = Math.max(parseFloat(result.data[i][bidIndex]), maxBid);
      }
      this.setState({ maxBid: maxBid, webdatarocks: "" });
    });
    this.customizeCellFunction = this.customizeCellFunction.bind(this);
    this.createCharts = this.createCharts.bind(this);
    this.drawChart = this.drawChart.bind(this);
    this.updateChart = this.updateChart.bind(this);
    this.saveReport = this.saveReport.bind(this);
    this.customizeToolbar = this.customizeToolbar.bind(this);
    this.handleCellClick = this.handleCellClick.bind(this);
  }

  componentDidMount() {}

  prepareDataFunction(rawData) {
    var result = {};
    var labels = [];
    var data = [];
    for (var i = 0; i < rawData.data.length / 2; i++) {
      // duplicate data bug, unknown why this is happening
      var record = rawData.data[i];
      if (record.c0 == undefined && record.r0 !== undefined) {
        var _record = record.r0;
        labels.push(_record);
      }
      if ((record.c0 == undefined) & (record.r0 == undefined)) continue;
      if (record.v0 != undefined) {
        data.push(!isNaN(record.v0) ? record.v0 : null);
      }
    }
    result.labels = labels;
    result.data = data;
    return result;
  }

  drawChart(rawData) {
    var data = this.prepareDataFunction(rawData);
    var data_for_charts = {
      datasets: [
        {
          data: data.data,
          backgroundColor: [
            "#FF6384",
            "#4BC0C0",
            "#FFCE56",
            "#E7E9ED",
            "#36A2EB",
            "#9ccc65",
            "#b3e5fc",
          ],
        },
      ],
      labels: data.labels,
    };
    var options = {
      responsive: true,
      legend: {
        position: "right",
      },
      title: {
        display: true,
        fontSize: 18,
        text: "Profit by Countries",
      },
      scale: {
        ticks: {
          beginAtZero: true,
        },
        reverse: false,
      },
      animation: {
        animateRotate: false,
        animateScale: true,
      },
    };
    var ctx = document.getElementById("chart").getContext("2d");
    window.chart = new Chart(ctx, {
      data: data_for_charts,
      type: "polarArea",
      options: options,
    });
  }

  updateChart(rawData) {
    chart.destroy();
    this.drawChart(rawData);
}

  createCharts() {
    this.myRef.webdatarocks.getData({}, this.drawChart, this.updateChart);
  }

  customizeCellFunction(cellBuilder, cellData) {
    if (!this.state) return null;
    if (cellData.type == "value" && cellData.measure.name == "Offer") {
      if (cellData.label >= 2) {
        cellBuilder.addClass("highOffer");
      } else if (cellData.label <= 1.2) {
        cellBuilder.addClass("lowOffer");
      } else {
        cellBuilder.addClass("midOffer");
      }
    } else if (cellData.type == "value" && cellData.measure.name == "Bid") {
      if (this.state.maxBid - parseFloat(cellData.label) <= 0.0000001) {
        cellBuilder.addClass("maxBid");
      }
    }
  }

  customizeToolbar(toolbar) {
    var tabs = toolbar.getTabs();
    toolbar.getTabs = function () {
      tabs = tabs.splice(1);
      tabs.splice(1, 1);
      tabs.unshift({
        id: "wdr-tab-lightblue",
        title: "Save",
        handler: handleSaveReport,
        icon: this.icons.format
    })
      return tabs;
    };
    var handleSaveReport = () => {
      this.saveReport();
    };
  }

  saveReport(){
    var report = this.myRef.webdatarocks.getReport();
    delete report.dataSource;
    const cookies = new Cookies();
    cookies.set("report", report, { path: "/" });
  }

  loadReport() {
    const cookies = new Cookies();
    var savedReport = cookies.get("report");
    if(savedReport != null){
      return mergeReportAndData(savedReport, getRunsData());
    }
    return getReport(getRunsData());
  }

  handleCellClick(cell){
    var row = cell.rowIndex;
    var column = cell.columnIndex;
    var length = this.myRef.webdatarocks.getRows().length;
    var selectedData = [{name:cell.measure.uniqueName, value:cell.label}];
    for (var i=0; i < length; i++){
      if(i != column){
        var otherCell = this.myRef.webdatarocks.getCell(row, i);
        if (otherCell.type == "header") {
          selectedData.push({name:otherCell.member.hierarchyName, value:otherCell.member.caption});
        } else {
        selectedData.push({name:otherCell.measure.uniqueName, value:otherCell.label});
        }
      }
    }
    var label = "";
    for (var i=0; i< selectedData.length; i++){
      label = label + " " + selectedData[i].name +": " + selectedData[i].value + "\n";
    }
    alert(label);
  }

  render() {
    var data = this.loadReport();
    return (
      <div>
        <div>
          <WebDataRocksReact.Pivot
            ref={(elem) => {
              this.myRef = elem;
            }}
            toolbar={true}
            componentFolder="https://cdn.webdatarocks.com/"
            width="100%"
            customizeCell={this.customizeCellFunction}
            report={data}
            beforetoolbarcreated={this.customizeToolbar}
            cellclick={this.handleCellClick}
            reportcomplete={() => {
              this.createCharts();
            }}
          />
        </div>
        <canvas id="chart" width="800" height="500"></canvas>
      </div>
    );
  }
}

export { WebDataRocksPivotTable }